from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, MetaData, func
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
from typing import List
import os
import shutil
import uuid

from ..models.invoice import Base, Invoice, InvoiceCreate, InvoiceResponse, InvoiceStats
from ..services.invoice_ocr_service import InvoiceOCRService

router = APIRouter(prefix="/api/invoice", tags=["invoice"])

# 資料庫設定
DATABASE_URL = "sqlite:///./database/invoices.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 建立資料表
Base.metadata.create_all(bind=engine)

# 上傳目錄
UPLOAD_DIR = "./invoice_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 初始化服務
ocr_service = InvoiceOCRService()

def get_db():
    """取得資料庫連線"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload", response_model=InvoiceResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """上傳發票圖片並進行 OCR 識別"""
    try:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="只接受圖片檔案")
        
        # 生成唯一檔名
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # 儲存檔案
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # OCR 識別
        try:
            ocr_result = await ocr_service.extract_invoice_info(file_path)
            
            if not ocr_result["success"]:
                raise HTTPException(status_code=500, detail=f"OCR 識別失敗: {ocr_result['error']}")
        except Exception as ocr_error:
            # 如果 OCR 失敗，創建基本記錄
            print(f"OCR Error: {ocr_error}")
            ocr_result = {
                "success": True,
                "data": {
                    "invoice_number": None,
                    "invoice_date": None,
                    "vendor_name": file.filename,
                    "vendor_tax_id": None,
                    "total_amount": 0.0,
                    "tax_amount": 0.0,
                    "net_amount": 0.0,
                    "category": "其他"
                },
                "raw_text": ""
            }
        
        # 建立發票記錄
        invoice_data = ocr_result["data"]
        
        # 檢查重複的發票號碼
        invoice_number = invoice_data.get("invoice_number")
        is_duplicate = False
        if invoice_number:
            existing = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
            if existing:
                is_duplicate = True
                invoice_number = f"{invoice_number}_副本_{uuid.uuid4().hex[:4]}"
        
        db_invoice = Invoice(
            invoice_number=invoice_number,
            invoice_date=datetime.strptime(invoice_data["invoice_date"], "%Y-%m-%d") if invoice_data.get("invoice_date") else None,
            vendor_name=invoice_data.get("vendor_name"),
            vendor_tax_id=invoice_data.get("vendor_tax_id"),
            total_amount=invoice_data.get("total_amount", 0.0),
            tax_amount=invoice_data.get("tax_amount", 0.0),
            net_amount=invoice_data.get("net_amount", 0.0),
            category=invoice_data.get("category", "其他"),
            image_path=f"/uploads/{filename}",
            ocr_text=ocr_result.get("raw_text", ""),
            status="pending"
        )
        
        db.add(db_invoice)
        db.commit()
        db.refresh(db_invoice)
        
        # 如果是重複發票，在回應中添加提醒
        response_data = db_invoice.__dict__.copy()
        if is_duplicate:
            response_data['_duplicate_warning'] = True
            response_data['_original_invoice_number'] = invoice_data.get("invoice_number")
        
        return response_data
        
    except Exception as e:
        print(f"Upload Error: {e}")
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")

@router.get("/list", response_model=List[InvoiceResponse])
async def get_invoices(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    status: str = None,
    db: Session = Depends(get_db)
):
    """取得發票列表"""
    query = db.query(Invoice)
    
    if category:
        query = query.filter(Invoice.category == category)
    if status:
        query = query.filter(Invoice.status == status)
    
    invoices = query.offset(skip).limit(limit).all()
    return invoices

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """取得特定發票詳情"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="發票不存在")
    return invoice

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """更新發票資訊"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="發票不存在")
    
    for field, value in invoice_update.dict(exclude_unset=True).items():
        setattr(invoice, field, value)
    
    db.commit()
    db.refresh(invoice)
    return invoice

@router.get("/stats/summary", response_model=InvoiceStats)
async def get_invoice_stats(db: Session = Depends(get_db)):
    """取得發票統計資訊"""
    total_invoices = db.query(Invoice).count()
    total_amount = db.query(func.sum(Invoice.total_amount)).scalar() or 0
    
    # 按類別統計
    category_stats = db.query(
        Invoice.category,
        func.count(Invoice.id).label('count'),
        func.sum(Invoice.total_amount).label('amount')
    ).group_by(Invoice.category).all()
    
    return InvoiceStats(
        total_invoices=total_invoices,
        total_amount=total_amount,
        category_stats=[
            {
                "category": stat.category,
                "count": stat.count,
                "amount": stat.amount or 0
            }
            for stat in category_stats
        ]
    )

@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    """刪除發票"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="發票不存在")
    
    # 刪除圖片檔案
    if invoice.image_path and os.path.exists(invoice.image_path.replace('/uploads/', './invoice_uploads/')):
        os.remove(invoice.image_path.replace('/uploads/', './invoice_uploads/'))
    
    db.delete(invoice)
    db.commit()
    return {"message": "發票已刪除"}

@router.get("/categories/list")
async def get_categories():
    """取得費用分類列表"""
    categories = [
        "交通", "餐飲", "辦公用品", "住宿", 
        "通訊", "水電", "維修", "保險", "其他"
    ]
    return {"categories": categories}