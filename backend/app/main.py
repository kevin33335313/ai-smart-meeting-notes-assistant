import os
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from .models.schemas import TaskStatus, UploadResponse
from .services.gemini_processor import process_audio_task, task_store
from .services.mindmap_generator import generate_mindmap_from_content_blocks
import os
from .routers import document_qa
from .routes import invoice_manager, icon_generator, poster_generator
from .services.token_service import get_token_service
import traceback

# 載入環境變數
load_dotenv()

# 建立 FastAPI 應用程式實例
app = FastAPI(title="AI Smart Meeting Notes Assistant API")

# 應用啟動事件：載入已存在的筆記
@app.on_event("startup")
async def startup_event():
    """應用啟動時載入已存在的筆記"""
    try:
        from .services.gemini_processor import reload_task_store
        reload_task_store()
        print("✅ 已載入現有筆記到任務存儲")
    except Exception as e:
        print(f"❌ 載入現有筆記失敗: {e}")

# 設定 CORS 中介軟體，允許前端連接
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由器
app.include_router(document_qa.router)
app.include_router(invoice_manager.router)
app.include_router(icon_generator.router)
app.include_router(poster_generator.router)

# 靜態文件服務
app.mount("/uploads", StaticFiles(directory="./invoice_uploads"), name="uploads")

# 初始化 Token 服務
token_service = get_token_service()

# 建立本地上傳目錄
UPLOAD_DIR = Path("./local_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 根路徑端點，返回狀態確認
@app.get("/")
async def root():
    return {"status": "ok"}

# Token 統計 API
@app.get("/api/token-stats")
async def get_token_stats(service: str = None):
    """獲取 Token 使用統計"""
    try:
        if service:
            stats = token_service.get_service_stats(service)
        else:
            stats = token_service.get_all_stats()
        return stats
    except Exception as e:
        return {"error": str(e), "total_tokens": 0, "total_cost": 0.0}

# 重新載入筆記 API
@app.post("/api/v1/reload-notes")
async def reload_notes():
    """手動重新載入所有筆記到任務存儲"""
    try:
        from .services.gemini_processor import reload_task_store, task_store
        reload_task_store()
        return {
            "status": "success", 
            "message": f"已重新載入 {len(task_store)} 個筆記",
            "loaded_count": len(task_store)
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}



# POST 端點：上傳音頻檔案並開始處理
@app.post("/api/v1/notes", response_model=UploadResponse)
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """上傳音頻檔案並返回任務 ID"""
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    # 生成唯一任務 ID
    task_id = str(uuid.uuid4())
    
    # 儲存上傳的檔案
    file_path = UPLOAD_DIR / f"{task_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # 初始化任務狀態
    from datetime import datetime
    task_store[task_id] = {
        "status": "queued",
        "filename": file.filename,
        "file_path": str(file_path),
        "created_at": datetime.now().isoformat()
    }
    
    # 啟動背景任務
    background_tasks.add_task(process_audio_task, task_id, str(file_path))
    
    return UploadResponse(task_id=task_id, status="queued")

# GET 端點：獲取所有筆記列表
@app.get("/api/v1/notes-list")
async def get_notes_list():
    """獲取所有筆記列表"""
    try:
        # 確保 task_store 已載入最新的筆記
        from .services.gemini_processor import reload_task_store
        reload_task_store()
        
        from .services.notes_manager import get_all_notes
        notes = get_all_notes()
        print(f"獲取到 {len(notes)} 個筆記")
        return {"notes": notes}
    except Exception as e:
        print(f"獲取筆記列表錯誤: {e}")
        import traceback
        traceback.print_exc()
        return {"notes": []}

# GET 端點：搜尋筆記
@app.get("/api/v1/notes/search")
async def search_notes(q: str = "", tags: str = "", color: str = "", favorite: bool = None):
    """搜尋筆記"""
    try:
        from .services.notes_manager import notes_manager
        results = notes_manager.search_notes(q, tags.split(',') if tags else [], color, favorite)
        return {"notes": results}
    except Exception as e:
        print(f"搜尋筆記錯誤: {e}")
        return {"notes": []}

# GET 端點：獲取所有標籤
@app.get("/api/v1/notes/tags")
async def get_all_tags():
    """獲取所有標籤"""
    try:
        from .services.notes_manager import get_all_notes
        notes = get_all_notes()
        
        # 收集所有標籤
        all_tags = set()
        for note in notes:
            if note.get('tags'):
                all_tags.update(note['tags'])
            if note.get('custom_tags'):
                all_tags.update(note['custom_tags'])
        
        return {"tags": list(all_tags)}
    except Exception as e:
        print(f"獲取標籤錯誤: {e}")
        return {"tags": []}

# GET 端點：查詢任務狀態和結果
@app.get("/api/v1/notes/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """查詢任務狀態和結果"""
    print(f"查詢任務: {task_id}")
    print(f"當前 task_store 中的 task_id: {list(task_store.keys())}")
    
    # 首先檢查 task_store
    if task_id in task_store:
        print(f"在 task_store 中找到任務: {task_id}")
        task_data = task_store[task_id]
        return TaskStatus(
            task_id=task_id,
            status=task_data["status"],
            filename=task_data.get("filename"),
            result=task_data.get("result"),
            error=task_data.get("error")
        )
    
    # 如果 task_store 中沒有，嘗試從 notes_manager 中獲取
    try:
        from .services.notes_manager import notes_manager
        print(f"嘗試從 notes_manager 獲取任務: {task_id}")
        
        # 檢查是否在筆記索引中
        if task_id in notes_manager.notes_index:
            print(f"在 notes_manager 索引中找到任務: {task_id}")
            note_info = notes_manager.notes_index[task_id]
            full_note = notes_manager.get_note(task_id)
            
            if full_note:
                print(f"成功讀取筆記文件: {task_id}")
                # 重新載入到 task_store 以便後續使用
                task_store[task_id] = {
                    "status": "completed",
                    "filename": note_info["filename"],
                    "created_at": note_info["created_at"],
                    "result": full_note
                }
                
                return TaskStatus(
                    task_id=task_id,
                    status="completed",
                    filename=note_info["filename"],
                    result=full_note,
                    error=None
                )
            else:
                print(f"無法讀取筆記文件: {task_id}")
        else:
            print(f"在 notes_manager 索引中未找到任務: {task_id}")
    except Exception as e:
        print(f"從筆記管理器獲取任務失敗: {e}")
        import traceback
        traceback.print_exc()
    
    print(f"任務未找到: {task_id}")
    raise HTTPException(status_code=404, detail="Task not found")

# PUT 端點：編輯筆記標題
@app.put("/api/v1/notes/{task_id}/title")
async def update_note_title(task_id: str, title_data: dict):
    """更新筆記標題"""
    try:
        from .services.notes_manager import notes_manager
        new_title = title_data.get("title", "").strip()
        
        if not new_title:
            return {"status": "error", "message": "標題不能為空"}
        
        success = notes_manager.update_note_title(task_id, new_title)
        
        if success:
            return {"status": "success", "message": "標題已更新"}
        else:
            return {"status": "error", "message": "更新標題失敗"}
    except Exception as e:
        print(f"更新標題錯誤: {e}")
        return {"status": "error", "message": str(e)}

# PUT 端點：更新筆記屬性
@app.put("/api/v1/notes/{task_id}/properties")
async def update_note_properties(task_id: str, properties: dict):
    """更新筆記屬性（顏色、標籤、收藏等）"""
    try:
        from .services.notes_manager import notes_manager
        success = notes_manager.update_note_properties(task_id, properties)
        
        if success:
            return {"status": "success", "message": "屬性已更新"}
        else:
            return {"status": "error", "message": "更新屬性失敗"}
    except Exception as e:
        print(f"更新屬性錯誤: {e}")
        return {"status": "error", "message": str(e)}

# DELETE 端點：刪除筆記
@app.delete("/api/v1/notes/{task_id}")
async def delete_note(task_id: str):
    """刪除指定的筆記"""
    try:
        from .services.notes_manager import notes_manager
        import os
        
        # 從 task_store 中移除
        if task_id in task_store:
            # 刪除上傳的檔案
            file_path = task_store[task_id].get("file_path")
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            del task_store[task_id]
        
        # 從筆記管理器中刪除
        success = notes_manager.delete_note(task_id)
        
        if success:
            return {"status": "success", "message": "筆記已成功刪除"}
        else:
            return {"status": "error", "message": "刪除筆記時發生錯誤"}
    except Exception as e:
        print(f"刪除筆記錯誤: {e}")
        return {"status": "error", "message": str(e)}

# POST 端點：生成心智圖
@app.post("/api/v1/notes/{task_id}/mindmap")
async def generate_mindmap(task_id: str):
    """為指定任務生成心智圖"""
    # 首先嘗試從 task_store 獲取
    if task_id not in task_store:
        # 如果 task_store 中沒有，嘗試從 notes_manager 中獲取
        try:
            from .services.notes_manager import notes_manager
            if task_id in notes_manager.notes_index:
                note_info = notes_manager.notes_index[task_id]
                full_note = notes_manager.get_note(task_id)
                if full_note:
                    # 重新載入到 task_store
                    task_store[task_id] = {
                        "status": "completed",
                        "filename": note_info["filename"],
                        "created_at": note_info["created_at"],
                        "result": full_note
                    }
                else:
                    raise HTTPException(status_code=404, detail="Task not found")
            else:
                raise HTTPException(status_code=404, detail="Task not found")
        except Exception as e:
            print(f"從筆記管理器獲取任務失敗: {e}")
            raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = task_store[task_id]
    if task_data["status"] != "completed" or not task_data.get("result"):
        raise HTTPException(status_code=400, detail="Task not completed or no result available")
    
    try:
        result = task_data["result"]

        
        # 將結果轉換為內容區塊格式
        content_blocks = []
        if hasattr(result, 'content_blocks'):
            content_blocks = result.content_blocks
        else:
            # 如果沒有 content_blocks，從舊格式轉換
            content_blocks = [
                {"type": "heading_2", "content": {"text": "會議摘要"}},
                {"type": "callout", "content": {"icon": "📝", "style": "info", "text": getattr(result, 'summary', '無摘要')}}
            ]
        
        print(f"開始生成心智圖，內容區塊數量: {len(content_blocks)}")
        
        mindmap = await generate_mindmap_from_content_blocks(content_blocks)
        
        print(f"心智圖生成成功")
        
        # 更新任務結果
        if hasattr(mindmap, 'dict'):
            mindmap_dict = mindmap.dict()
        elif hasattr(mindmap, 'model_dump'):
            mindmap_dict = mindmap.model_dump()
        else:
            mindmap_dict = mindmap
            
        # 更新 task_store 中的結果
        if isinstance(task_data["result"], dict):
            task_data["result"]['mindmap_structure'] = mindmap_dict
        else:
            # 如果結果物件沒有 mindmap_structure 屬性，直接設定
            setattr(task_data["result"], 'mindmap_structure', mindmap_dict)
        
        # 保存到持久化存儲
        try:
            from .services.notes_manager import notes_manager
            notes_manager.update_note_mindmap(task_id, mindmap_dict)
            print(f"心智圖已保存到持久化存儲: {task_id}")
        except Exception as save_error:
            print(f"保存心智圖到持久化存儲失敗: {save_error}")
        
        return {"status": "success", "mindmap": mindmap_dict}
    except Exception as e:
        error_msg = f"Mindmap generation error: {str(e)}"
        print(error_msg)
        traceback.print_exc()
        
        # 返回預設心智圖而不是拋出錯誤
        default_mindmap = {
            "nodes": [
                {"id": "root", "data": {"label": "會議主題", "level": 0}, "position": {"x": 0, "y": 0}},
                {"id": "topic-1", "data": {"label": "主要內容", "level": 1, "direction": "right", "color": "#4dabf7", "icon": "📝"}, "position": {"x": 0, "y": 0}}
            ],
            "edges": [
                {"id": "edge-root-topic-1", "source": "root", "target": "topic-1"}
            ]
        }
        
        return {"status": "success", "mindmap": default_mindmap}