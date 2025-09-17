import os
import json
import time
from typing import Dict, Any

import google.generativeai as genai
from dotenv import load_dotenv

from ..models.schemas import NoteResult, ReactFlowMindMap, ContentBlock, ActionItem

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 全域任務儲存
task_store: Dict[str, Dict[str, Any]] = {}

def _load_task_store_from_notes():
    """從筆記管理器載入任務到 task_store"""
    try:
        from .notes_manager import notes_manager
        
        # 載入所有已保存的筆記到 task_store
        loaded_count = 0
        for task_id, note_info in notes_manager.notes_index.items():
            if task_id not in task_store:
                # 載入完整筆記內容
                full_note = notes_manager.get_note(task_id)
                if full_note:
                    task_store[task_id] = {
                        "status": "completed",
                        "filename": note_info["filename"],
                        "created_at": note_info["created_at"],
                        "result": full_note
                    }
                    loaded_count += 1
        print(f"已從筆記管理器載入 {loaded_count} 個任務")
    except Exception as e:
        print(f"載入任務存儲失敗: {e}")

def reload_task_store():
    """重新載入任務存儲（用於 API 呼叫）"""
    _load_task_store_from_notes()

# 啟動時載入已存在的筆記
_load_task_store_from_notes()

async def process_audio_with_gemini(audio_file_path: str) -> NoteResult:
    """使用 Gemini 2.5 Flash 處理音頻檔案並返回結構化結果"""
    print(f"Uploading file to Gemini: {audio_file_path}")
    
    # 上傳檔案到 Gemini 檔案服務
    audio_file = genai.upload_file(path=audio_file_path)

    # 等待檔案處理完成
    while audio_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        audio_file = genai.get_file(audio_file.name)

    if audio_file.state.name == "FAILED":
        raise ValueError(audio_file.state.name)
        
    print(f"\nFile uploaded successfully. Starting analysis...")

    # 定義結構化 Prompt
    prompt = """
你是一位頂尖的產品設計師與內容架構師。請仔細聆聽並分析這段會議音訊，並將其內容解構成結構化的 JSON 格式。

請輸出包含以下兩個主要部分的 JSON：

1. "content_blocks": 內容區塊陣列，用於渲染類似 Notion 的精美頁面
2. "action_items": 待辦事項陣列，提取會議中的任務和行動項目

區塊類型定義：
- heading_2: H2 標題
- bullet_list: 無序列表
- toggle_list: 可折疊列表
- callout: 引言框，用於強調重要結論
- code: 程式碼區塊

輸出格式：
{
  "content_blocks": [
    {
      "type": "heading_2",
      "content": {"text": "標題文字"}
    },
    {
      "type": "bullet_list",
      "content": {"items": ["項目1", "項目2"]}
    },
    {
      "type": "callout",
      "content": {"icon": "📋", "style": "info", "text": "重要資訊"}
    }
  ],
  "action_items": [
    {
      "task": "任務描述",
      "owner": "負責人姓名",
      "due_date": "截止日期 (YYYY-MM-DD 格式)"
    }
  ]
}

請直接輸出 JSON，不要包含 Markdown 語法。
    """

    # 建立模型並發送請求
    model = genai.GenerativeModel(model_name="models/gemini-2.5-flash")
    response = model.generate_content([audio_file, prompt])

    # 清理並解析 JSON 回應
    cleaned_json_string = response.text.strip()
    
    # 移除 Markdown 語法
    if "```json" in cleaned_json_string:
        cleaned_json_string = cleaned_json_string.split("```json")[1].split("```")[0]
    elif "```" in cleaned_json_string:
        cleaned_json_string = cleaned_json_string.split("```")[1]
    
    cleaned_json_string = cleaned_json_string.strip()
    
    print(f"Cleaned JSON: {cleaned_json_string[:500]}...")  # 顯示前500字符用於調試
    
    try:
        parsed_data = json.loads(cleaned_json_string)
        # 確保有必要的欄位
        content_blocks = parsed_data.get('content_blocks', [])
        action_items_data = parsed_data.get('action_items', [])
        
        # 轉換待辦事項為 ActionItem 物件
        action_items = [ActionItem(**item) for item in action_items_data]
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic JSON around position {e.pos}: {cleaned_json_string[max(0, e.pos-50):e.pos+50]}")
        # 嘗試修復常見的 JSON 錯誤
        fixed_json = cleaned_json_string.replace('\n', ' ').replace('\t', ' ')
        # 移除多餘的逗號
        import re
        fixed_json = re.sub(r',\s*}', '}', fixed_json)
        fixed_json = re.sub(r',\s*]', ']', fixed_json)
        parsed_data = json.loads(fixed_json)
        content_blocks = parsed_data.get('content_blocks', [])
        action_items_data = parsed_data.get('action_items', [])
        action_items = [ActionItem(**item) for item in action_items_data]
    
    # 轉換為 Pydantic 模型
    return NoteResult(
        content_blocks=content_blocks,
        action_items=action_items,
        mindmap_structure=None
    )

async def process_audio_task(task_id: str, file_path: str):
    """背景任務：處理音頻檔案"""
    try:
        task_store[task_id]["status"] = "processing"
        result = await process_audio_with_gemini(file_path)
        task_store[task_id]["status"] = "completed"
        task_store[task_id]["result"] = result
        
        # 自動保存筆記到 notes_manager
        try:
            from .notes_manager import notes_manager
            filename = task_store[task_id].get("filename", "未知檔案")
            
            # 將 Pydantic 模型轉換為字典
            if hasattr(result, 'model_dump'):
                result_dict = result.model_dump()
            elif hasattr(result, 'dict'):
                result_dict = result.dict()
            else:
                result_dict = result
            
            notes_manager.save_note(task_id, filename, result_dict)
            print(f"筆記已自動保存: {task_id}")
        except Exception as save_error:
            print(f"保存筆記失敗: {save_error}")
            
    except Exception as e:
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)