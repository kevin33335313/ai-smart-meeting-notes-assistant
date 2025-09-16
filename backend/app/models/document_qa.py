from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from typing import Dict, Any

class DocumentUpload(BaseModel):
    """文件上傳請求模型"""
    filename: str
    content_type: str

class DocumentInfo(BaseModel):
    """文件信息模型"""
    id: str
    filename: str
    size: int
    content_type: str
    upload_time: datetime
    status: str  # "processing", "ready", "error"

class QuestionRequest(BaseModel):
    """問答請求模型"""
    question: str
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None

class SourceInfo(BaseModel):
    """來源信息模型"""
    file_name: str
    page: Optional[int] = None
    chunk_id: Optional[str] = None

class SourceDocumentMetadata(BaseModel):
    """來源文檔元數據模型"""
    filename: str
    chunks_count: int
    relevance_score: float
    expandable: bool

class SourceDocument(BaseModel):
    """優化後的來源文檔模型"""
    snippet: str              # 相關片段 (150-200字)
    highlighted: str          # 高亮版本
    full_content: str         # 完整內容（供展開使用）
    metadata: SourceDocumentMetadata

class QuestionResponse(BaseModel):
    """問答回應模型"""
    id: str
    question: str
    answer: str
    sources: List[SourceInfo]  # 保留原有格式兼容性
    source_documents: Optional[List[SourceDocument]] = []  # 新增優化的來源預覽
    timestamp: datetime

class SummaryRequest(BaseModel):
    """摘要請求模型"""
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None

class SummaryResponse(BaseModel):
    """摘要回應模型"""
    summary: str
    key_points: List[str]
    timestamp: datetime

class QuizRequest(BaseModel):
    """測驗請求模型"""
    document_ids: Optional[List[str]] = None
    session_id: Optional[str] = None
    num_questions: int = 5

class QuizQuestion(BaseModel):
    """測驗題目模型"""
    id: int
    question: str
    options: List[str]
    correct_answer: int

class QuizResponse(BaseModel):
    """測驗回應模型"""
    questions: List[QuizQuestion]
    timestamp: datetime