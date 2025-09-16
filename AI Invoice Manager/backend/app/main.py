from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv
import os
import shutil
from datetime import datetime
from typing import List

from app.models.invoice import Base, Invoice, InvoiceCreate, InvoiceResponse
from app.services.ocr_service import OCRService

# 載入環境變數
load_dotenv()

# 建立 FastAPI 應用
app = FastAPI(
    title="AI Invoice Manager",
    description="智能發票與收據管理系統 API",
    version="1.0.0"
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 開發服務器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 資料庫設定
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database/invoices.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 建立資料表
Base.metadata.create_all(bind=engine)

# 上傳目錄設定
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 靜態檔案服務
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# 初始化服務
ocr_service = OCRService()

def get_db():
    """取得資料庫連線"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    """根路徑"""
    return {"message": "AI Invoice Manager API", "version": "1.0.0"}

@app.post("/api/upload-invoice", response_model=InvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    上傳發票圖片並進行 OCR 識別
    
    Args:
        file: 上傳的圖片檔案
        db: 資料庫連線
        
    Returns:
        處理後的發票資訊
    """
    try:
        # 驗證檔案類型
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="只接受圖片檔案")
        
        # 生成唯一檔名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 儲存檔案
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # OCR 識別
        ocr_result = await ocr_service.extract_invoice_info(file_path)
        
        if not ocr_result["success"]:
            raise HTTPException(status_code=500, detail=f"OCR 識別失敗: {ocr_result['error']}")
        
        # 建立發票記錄
        invoice_data = ocr_result["data"]
        db_invoice = Invoice(
            invoice_number=invoice_data.get("invoice_number"),
            invoice_date=datetime.strptime(invoice_data["invoice_date"], "%Y-%m-%d") if invoice_data.get("invoice_date") else None,
            vendor_name=invoice_data.get("vendor_name"),
            vendor_tax_id=invoice_data.get("vendor_tax_id"),
            total_amount=invoice_data.get("total_amount", 0.0),
            tax_amount=invoice_data.get("tax_amount", 0.0),
            net_amount=invoice_data.get("net_amount", 0.0),
            category=invoice_data.get("category", "其他"),
            image_path=file_path,
            ocr_text=ocr_result.get("raw_text", ""),
            status="pending"
        )
        
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        
        return db_invoice
        
    except Exception as e:
        # 清理上傳的檔案
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/invoices", response_model=List[InvoiceResponse])
async def get_invoices(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    取得發票列表
    
    Args:
        skip: 跳過筆數
        limit: 限制筆數
        category: 篩選類別
        status: 篩選狀態
        db: 資料庫連線
        
    Returns:
        發票列表
    """
    query = db.query(Invoice)
    
    if category:
        query = query.filter(Invoice.category == category)
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@app.get("/api/invoice/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """
    取得特定發票詳情
    
    Args:
        invoice_id: 發票 ID
        db: 資料庫連線
        
    Returns:
        發票詳情
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="發票不存在")
    return invoice

@app.put("/api/invoice/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """
    更新發票資訊
    
    Args:
        invoice_id: 發票 ID
        invoice_update: 更新資料
        db: 資料庫連線
        
    Returns:
        更新後的發票資訊
    """
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="發票不存在")
    
    # 更新欄位
    for field, value in invoice_update.dict(exclude_unset=True).items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@app.get("/api/categories")
async def get_categories():
    """取得費用分類列表"""
    categories = [
        "交通", "餐飲", "辦公用品", "住宿", 
        "通訊", "水電", "維修", "保險", "其他"
    ]
    return {"categories": categories}

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """取得統計資訊"""
    total_invoices = db.query(Invoice).count()
    total_amount = db.query(Invoice).with_entities(
        db.func.sum(Invoice.total_amount)
    ).scalar() or 0
    
    # 按類別統計
    category_stats = db.query(
        Invoice.category,
        db.func.count(Invoice.id).label('count'),
        db.func.sum(Invoice.total_amount).label('amount')
    ).group_by(Invoice.category).all()
    
    return {
        "total_invoices": total_invoices,
        "total_amount": total_amount,
        "category_stats": [
            {
                "category": stat.category,
                "count": stat.count,
                "amount": stat.amount or 0
            }
            for stat in category_stats
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)