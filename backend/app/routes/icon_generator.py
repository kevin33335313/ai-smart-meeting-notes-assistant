from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import uuid
import asyncio
from ..services.prompt_service import enhance_prompt_for_icon
from ..services.image_service import generate_image_from_prompt

# 建立路由器
router = APIRouter(prefix="/api/v1/icon-generator", tags=["icon-generator"])

# 全域任務儲存
icon_tasks: Dict[str, Dict[str, Any]] = {}

async def process_icon_generation(task_id: str, enhanced_prompt: str):
    """背景任務：處理圖像生成"""
    try:
        icon_tasks[task_id]["status"] = "generating"
        
        # 生成圖像
        image_path = await generate_image_from_prompt(enhanced_prompt)
        
        # 更新任務狀態
        icon_tasks[task_id]["status"] = "completed"
        icon_tasks[task_id]["result"] = {
            "image_path": image_path,
            "download_url": f"/api/v1/icon-generator/download/{task_id}"
        }
        
    except Exception as e:
        icon_tasks[task_id]["status"] = "failed"
        icon_tasks[task_id]["error"] = str(e)

@router.post("/generate")
async def generate_icon(background_tasks: BackgroundTasks, request: dict):
    """生成圖示"""
    task_id = str(uuid.uuid4())
    
    try:
        # 提取請求參數
        subject = request.get("subject", "")
        style = request.get("style", "modern")
        composition = request.get("composition", "centered")
        
        # 使用 Prompt Enhancement Engine
        enhanced_prompt = await enhance_prompt_for_icon(subject, style, composition)
        print(f"Enhanced prompt: {enhanced_prompt}")
        
        # 儲存任務
        icon_tasks[task_id] = {
            "status": "processing",
            "request": request,
            "enhanced_prompt": enhanced_prompt,
            "result": None,
            "error": None
        }
        
        # 啟動背景任務生成圖像
        background_tasks.add_task(process_icon_generation, task_id, enhanced_prompt)
        
        return {
            "task_id": task_id,
            "status": "processing",
            "message": "圖示生成任務已建立，正在處理中",
            "enhanced_prompt": enhanced_prompt
        }
        
    except Exception as e:
        icon_tasks[task_id] = {
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
    if task_id not in icon_tasks:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    return icon_tasks[task_id]

@router.get("/download/{task_id}")
async def download_image(task_id: str):
    """下載生成的圖像"""
    if task_id not in icon_tasks:
        raise HTTPException(status_code=404, detail="任務不存在")
    
    task = icon_tasks[task_id]
    if task["status"] != "completed" or not task.get("result"):
        raise HTTPException(status_code=400, detail="圖像尚未生成完成")
    
    from fastapi.responses import FileResponse
    image_path = task["result"]["image_path"]
    
    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=f"generated_icon_{task_id}.png"
    )