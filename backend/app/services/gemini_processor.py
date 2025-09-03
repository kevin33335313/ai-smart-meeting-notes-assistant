import os
import json
import time
from typing import Dict, Any

import google.generativeai as genai
from dotenv import load_dotenv

from ..models.schemas import NoteResult, ReactFlowMindMap, ContentBlock

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# 全域任務儲存
task_store: Dict[str, Dict[str, Any]] = {}

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
你是一位頂尖的產品設計師與內容架構師。請仔細聆聽並分析這段會議音訊，並將其內容，解構成一個由多個「內容區塊」(Content Blocks) 組成的 JSON 陣列。

目標： 輸出的 JSON 要能被前端直接渲染成一個類似 Notion 的精美頁面。

區塊類型定義：
- heading_2: H2 標題，用於主要段落標題。
- bullet_list: 無序列表，用於條列重點。
- toggle_list: 可折疊列表，用於隱藏次要細節，保持頁面整潔。
- callout: 引言框，用於強調最重要的結論、決策或警告。
- code: 程式碼區塊，用於呈現程式碼範例。

JSON 輸出結構：
輸出的 JSON 必須是一個陣列，每個物件代表一個區塊，且必須包含 type 和 content 兩個欄位。

type: 字串，必須是上述定義的區塊類型之一。

content: 根據 type 的不同，格式如下：
- heading_2: 一個包含 text 的物件。
- bullet_list: 一個包含 items (字串陣列) 的物件。
- toggle_list: 一個包含 summary (標題) 和 details (內容) 的物件。
- callout: 一個包含 icon (Emoji), style ('info', 'warning', 'success'), 和 text 的物件。
- code: 一個包含 language 和 text 的物件。

請直接輸出 JSON 陣列，不要包含 Markdown 語法。
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
        content_blocks = json.loads(cleaned_json_string)
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Problematic JSON around position {e.pos}: {cleaned_json_string[max(0, e.pos-50):e.pos+50]}")
        # 嘗試修復常見的 JSON 錯誤
        fixed_json = cleaned_json_string.replace('\n', ' ').replace('\t', ' ')
        # 移除多餘的逗號
        import re
        fixed_json = re.sub(r',\s*}', '}', fixed_json)
        fixed_json = re.sub(r',\s*]', ']', fixed_json)
        content_blocks = json.loads(fixed_json)
    
    # 轉換為 Pydantic 模型
    return NoteResult(
        content_blocks=content_blocks,
        mindmap_structure=None
    )

async def process_audio_task(task_id: str, file_path: str):
    """背景任務：處理音頻檔案"""
    try:
        task_store[task_id]["status"] = "processing"
        result = await process_audio_with_gemini(file_path)
        task_store[task_id]["status"] = "completed"
        task_store[task_id]["result"] = result
    except Exception as e:
        task_store[task_id]["status"] = "failed"
        task_store[task_id]["error"] = str(e)