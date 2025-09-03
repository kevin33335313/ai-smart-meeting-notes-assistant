import os
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models.schemas import TaskStatus, UploadResponse
from .services.gemini_processor import process_audio_task, task_store
from .services.mindmap_generator import generate_mindmap_from_content_blocks
import traceback

# 載入環境變數
load_dotenv()

# 建立 FastAPI 應用程式實例
app = FastAPI(title="AI Smart Meeting Notes Assistant API")

# 設定 CORS 中介軟體，允許前端連接
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 建立本地上傳目錄
UPLOAD_DIR = Path("./local_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 根路徑端點，返回狀態確認
@app.get("/")
async def root():
    return {"status": "ok"}



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
    task_store[task_id] = {
        "status": "queued",
        "filename": file.filename,
        "file_path": str(file_path)
    }
    
    # 啟動背景任務
    background_tasks.add_task(process_audio_task, task_id, str(file_path))
    
    return UploadResponse(task_id=task_id, status="queued")

# GET 端點：查詢任務狀態和結果
@app.get("/api/v1/notes/{task_id}", response_model=TaskStatus)
async def get_task_status(task_id: str):
    """查詢任務狀態和結果"""
    if task_id not in task_store:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = task_store[task_id]
    
    return TaskStatus(
        task_id=task_id,
        status=task_data["status"],
        filename=task_data.get("filename"),
        result=task_data.get("result"),
        error=task_data.get("error")
    )

# POST 端點：生成心智圖
@app.post("/api/v1/notes/{task_id}/mindmap")
async def generate_mindmap(task_id: str):
    """為指定任務生成心智圖"""
    if task_id not in task_store:
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
            
        # 安全更新 mindmap_structure
        if hasattr(task_data["result"], 'mindmap_structure'):
            task_data["result"].mindmap_structure = mindmap_dict
        else:
            # 如果結果物件沒有 mindmap_structure 屬性，直接設定
            setattr(task_data["result"], 'mindmap_structure', mindmap_dict)
        
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