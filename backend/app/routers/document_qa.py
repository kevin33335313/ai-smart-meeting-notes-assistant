from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from ..models.document_qa import DocumentInfo, QuestionRequest, QuestionResponse, SummaryRequest, SummaryResponse, QuizRequest, QuizResponse, QuizQuestion

from ..services.rag_service import RAGService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/document-qa", tags=["document-qa"])

# 使用單例模式避免重複初始化
_rag_service_instance = None

def get_rag_service():
    global _rag_service_instance
    if _rag_service_instance is None:
        _rag_service_instance = RAGService()
    return _rag_service_instance

rag_service = get_rag_service()

@router.post("/upload", response_model=DocumentInfo)
async def upload_document(file: UploadFile = File(...)):
    try:
        allowed_types = ["text/plain", "application/pdf"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="不支援的文件格式")
        
        content = await file.read()
        doc_id = await rag_service.add_document(content, file.filename, file.content_type)
        doc_info = rag_service.get_document_info(doc_id)
        
        return DocumentInfo(
            id=doc_info["id"],
            filename=doc_info["filename"],
            size=len(content),
            content_type=doc_info["content_type"],
            upload_time=doc_info.get("upload_time", "2024-01-01T00:00:00"),
            status=doc_info["status"]
        )
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"文件上傳失敗: {str(e)}")

@router.get("/documents", response_model=List[DocumentInfo])
async def list_documents():
    try:
        documents = rag_service.list_documents()
        return [
            DocumentInfo(
                id=doc["id"],
                filename=doc["filename"],
                size=0,
                content_type=doc.get("content_type", ""),
                upload_time=doc.get("upload_time", "2024-01-01T00:00:00"),
                status=doc["status"]
            )
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取文件列表失敗: {str(e)}")

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str):
    try:
        success = rag_service.delete_document(doc_id)
        if not success:
            raise HTTPException(status_code=404, detail="文件不存在")
        return {"message": "文件刪除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刪除文件失敗: {str(e)}")

@router.post("/question", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    try:
        # 暫時跳過去識別化處理，直接使用原始問題
        result = await rag_service.query_documents(request.question, session_id=request.session_id)
        
        return {
            "id": result["id"],
            "question": result["question"],
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "source_documents": result.get("source_documents", []),
            "timestamp": result.get("timestamp", "2024-01-01T00:00:00")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"問答失敗: {str(e)}")

# 會話管理API
@router.post("/sessions")
async def create_session(request: dict = None):
    """創建新會話或獲取現有會話"""
    try:
        session_id = None
        if request and "session_id" in request:
            session_id = request["session_id"]
        
        session_id = rag_service.create_session(session_id)
        return {"session_id": session_id, "message": "會話創建成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"創建會話失敗: {str(e)}")

@router.get("/sessions")
async def list_sessions():
    """列出所有會話"""
    try:
        return rag_service.list_sessions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取會話列表失敗: {str(e)}")

@router.post("/sessions/{session_id}/documents/{doc_id}")
async def add_document_to_session(session_id: str, doc_id: str):
    """將文檔添加到會話（會話不存在時自動創建）"""
    try:
        success = rag_service.add_document_to_session(session_id, doc_id)
        if success:
            return {"message": "文檔添加成功"}
        else:
            raise HTTPException(status_code=404, detail="文檔不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"添加文檔失敗: {str(e)}")

@router.delete("/sessions/{session_id}/documents/{doc_id}")
async def remove_document_from_session(session_id: str, doc_id: str):
    """從會話中移除文檔"""
    try:
        success = rag_service.remove_document_from_session(session_id, doc_id)
        if success:
            return {"message": "文檔移除成功"}
        else:
            raise HTTPException(status_code=404, detail="會話不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"移除文檔失敗: {str(e)}")

@router.get("/sessions/{session_id}/documents")
async def get_session_documents(session_id: str):
    """獲取會話中的文檔列表"""
    try:
        doc_ids = rag_service.get_session_documents(session_id)
        documents = []
        for doc_id in doc_ids:
            try:
                doc_info = rag_service.get_document_info(doc_id)
                documents.append({
                    "id": doc_info["id"],
                    "filename": doc_info["filename"],
                    "status": doc_info["status"]
                })
            except:
                continue
        return documents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取會話文檔失敗: {str(e)}")

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    try:
        print(f"Summary request: session_id={request.session_id}, document_ids={request.document_ids}")
        result = await rag_service.generate_summary(session_id=request.session_id)
        return SummaryResponse(
            summary=result["summary"],
            key_points=result["key_points"],
            timestamp=result.get("timestamp", "2024-01-01T00:00:00")
        )
    except Exception as e:
        print(f"Summary generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"生成摘要失敗: {str(e)}")

@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: QuizRequest):
    try:
        print(f"Quiz request: session_id={request.session_id}, document_ids={request.document_ids}, num_questions={request.num_questions}")
        result = await rag_service.generate_quiz(session_id=request.session_id, num_questions=request.num_questions)
        questions = [
            QuizQuestion(
                id=q["id"],
                question=q["question"],
                options=q["options"],
                correct_answer=q["correct_answer"]
            )
            for q in result["questions"]
        ]
        return QuizResponse(questions=questions, timestamp=result.get("timestamp", "2024-01-01T00:00:00"))
    except Exception as e:
        print(f"Quiz generation error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"生成測驗失敗: {str(e)}")

@router.get("/health")
async def health_check():
    """系統健康檢查端點"""
    try:
        health_status = rag_service.health_check()
        status_code = 200 if health_status["status"] == "healthy" else 503
        return health_status
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@router.get("/stats")
async def get_system_stats():
    """獲取系統統計信息"""
    try:
        return rag_service.get_vector_store_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取統計信息失敗: {str(e)}")

@router.post("/reset")
async def reset_system():
    """完全重置系統到初始狀態"""
    try:
        result = rag_service.reset_system()
        if result["status"] == "success":
            return result
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"系統重置失敗: {str(e)}")

@router.post("/source-content")
async def get_source_content(request: dict):
    """獲取來源文件內容（完整版本）"""
    try:
        file_name = request.get("file_name")
        chunk_id = request.get("chunk_id")
        
        if not file_name:
            raise HTTPException(status_code=400, detail="文件名稱不能為空")
        
        content = rag_service.get_source_content(file_name, chunk_id)
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取來源內容失敗: {str(e)}")

@router.post("/expand-source")
async def expand_source_content(request: dict):
    """展開查看完整的文檔內容（用於前端展開功能）"""
    try:
        file_name = request.get("file_name")
        query = request.get("query", "")
        
        if not file_name:
            raise HTTPException(status_code=400, detail="文件名稱不能為空")
        
        # 獲取完整內容
        full_content = rag_service.get_source_content(file_name)
        
        # 高亮關鍵詞（如果有查詢）
        highlighted_content = full_content
        if query:
            highlighted_content = rag_service._highlight_keywords(full_content, query)
        
        return {
            "file_name": file_name,
            "content": full_content,
            "highlighted_content": highlighted_content,
            "length": len(full_content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"展開內容失敗: {str(e)}")