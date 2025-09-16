from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

Base = declarative_base()

class Invoice(Base):
    """發票資料模型"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    # 基本資訊
    invoice_number = Column(String(50), unique=True, index=True)  # 發票號碼
    invoice_date = Column(DateTime)  # 發票日期
    vendor_name = Column(String(200))  # 商家名稱
    vendor_tax_id = Column(String(20))  # 商家統編
    
    # 金額資訊
    total_amount = Column(Float)  # 總金額
    tax_amount = Column(Float, default=0.0)  # 稅額
    net_amount = Column(Float)  # 未稅金額
    
    # 分類與狀態
    category = Column(String(50))  # 費用類別
    status = Column(String(20), default="pending")  # 狀態: pending, approved, rejected
    
    # 檔案資訊
    image_path = Column(String(500))  # 圖片路徑
    ocr_text = Column(Text)  # OCR 識別的原始文字
    
    # 時間戳記
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class InvoiceCreate(BaseModel):
    """建立發票的請求模型"""
    invoice_number: Optional[str] = None
    invoice_date: Optional[datetime] = None
    vendor_name: Optional[str] = None
    vendor_tax_id: Optional[str] = None
    total_amount: Optional[float] = None
    tax_amount: Optional[float] = 0.0
    net_amount: Optional[float] = None
    category: Optional[str] = None

class InvoiceResponse(BaseModel):
    """發票回應模型"""
    id: int
    invoice_number: Optional[str]
    invoice_date: Optional[datetime]
    vendor_name: Optional[str]
    vendor_tax_id: Optional[str]
    total_amount: Optional[float]
    tax_amount: Optional[float]
    net_amount: Optional[float]
    category: Optional[str]
    status: str
    image_path: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True