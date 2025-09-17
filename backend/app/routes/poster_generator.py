from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import uuid
import asyncio
from ..services.prompt_service import enhance_prompt_for_poster
from ..services.image_service import generate_image_from_prompt

# 建立路由器
router = APIRouter(prefix="/api/v1/poster-generator", tags=["poster-generator"])

# 全域任務儲存
poster_tasks: Dict[str, Dict[str, Any]] = {}

async def process_poster_generation(task_id: str, enhanced_prompt: str):
    """背景任務：處理海報生成"""
    try:
        poster_tasks[task_id]["status"] = "generating"
        
        # 生成圖像
        image_path = await generate_image_from_prompt(enhanced_prompt)
        
        # 更新任務狀態
        poster_tasks[task_id]["status"] = "completed"
        poster_tasks[task_id]["result"] = {
            "image_path": image_path,
            "download_url": f"/api/v1/poster-generator/download/{task_id}"
        }
        
    except Exception as e:
        poster_tasks[task_id]["status"] = "failed"
        poster_tasks[task_id]["error"] = str(e)

@router.post("/generate")
async def generate_poster(background_tasks: BackgroundTasks, request: dict):
    """生成海報"""
    task_id = str(uuid.uuid4())
    
    try:
        # 提取請求參數
        text_content = request.get("text_content", "")
        style = request.get("style", "modern_tech")
        poster_type = request.get("poster_type", "announcement")
        
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="文字內容不能為空")
        
        # 使用 Prompt Enhancement Engine
        enhanced_prompt, token_usage = await enhance_prompt_for_poster(
            text_content, style, poster_type, has_image=False
        )
        print(f"Enhanced prompt: {enhanced_prompt}")
        
        # 儲存任務
        poster_tasks[task_id] = {
            "status": "processing",
            "request": request,
            "enhanced_prompt": enhanced_prompt,
            "result": None,
            "error": None
        }
        
        # 啟動背景任務生成圖像
        background_tasks.add_task(process_poster_generation, task_id, enhanced_prompt)
        
        return {
            "task_id": task_id,
            "status": "processing",
            "message": "海報生成任務已建立，正在處理中",
            "enhanced_prompt": enhanced_prompt
        }
        
    except Exception as e:
        poster_tasks[task_id] = {
            "status": "failed",
            "request": request,
            "result": None,
            "error": str(e)
        }
        
        return {
            "task_id": task_id,
            "status": "failed",
            "message": f"任務建立失敗: {str(e)}"
        }

@router.get("/task/{task_id}")
async def get_task_status(task_id: str):
    """獲取任務狀態"""
    if task_id not in poster_tasks:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    return poster_tasks[task_id]

@router.get("/history")
async def get_poster_history():
    """獲取海報生成歷史"""
    history = []
    for task_id, task_data in poster_tasks.items():
        if task_data["status"] == "completed" and task_data.get("result"):
            history.append({
                "task_id": task_id,
                "text_content": task_data["request"].get("text_content", ""),
                "style": task_data["request"].get("style", ""),
                "poster_type": task_data["request"].get("poster_type", ""),
                "image_url": task_data["result"]["download_url"],
                "enhanced_prompt": task_data["enhanced_prompt"]
            })
    
    # 按時間倒序排列（最新的在前面）
    history.reverse()
    return {"history": history}

@router.get("/download/{task_id}")
async def download_image(task_id: str):
    """下載生成的圖像"""
    if task_id not in poster_tasks:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    task = poster_tasks[task_id]
    if task["status"] != "completed" or not task.get("result"):
        raise HTTPException(status_code=400, detail="圖像尚未生成完成")
    
    from fastapi.responses import FileResponse
    image_path = task["result"]["image_path"]
    
    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=f"generated_poster_{task_id}.png"
    )