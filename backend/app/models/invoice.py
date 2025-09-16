from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

Base = declarative_base()

class Invoice(Base):
    """發票資料模型"""
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(50), index=True)
    invoice_date = Column(DateTime)
    vendor_name = Column(String(200))
    vendor_tax_id = Column(String(20))
    total_amount = Column(Float)
    tax_amount = Column(Float, default=0.0)
    net_amount = Column(Float)
    category = Column(String(50))
    status = Column(String(20), default="pending")
    image_path = Column(String(500))
    ocr_text = Column(Text)
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

class InvoiceStats(BaseModel):
    """發票統計模型"""
    total_invoices: int
    total_amount: float
    category_stats: List[dict]