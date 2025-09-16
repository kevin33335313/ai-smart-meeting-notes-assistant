from fastapi import APIRouter
from ..services.rag_service import RAGService

router = APIRouter(prefix="/api/rag", tags=["rag-stats"])
rag_service = RAGService()

@router.get("/stats")
async def get_rag_stats():
    """獲取RAG系統統計信息"""
    stats = rag_service.get_vector_store_stats()
    return {
        "vector_store": stats,
        "documents": len(rag_service.list_documents()),
        "status": "active"
    }