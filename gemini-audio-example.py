import os
import google.generativeai as genai

# 從環境變數讀取 API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

async def process_audio_with_gemini(audio_file_path: str) -> dict:
    """
    使用 Gemini 2.5 Flash 直接處理音訊檔案。
    """
    print(f"Uploading file to Gemini: {audio_file_path}")
    # 1. 上傳檔案到 Gemini 的檔案服務
    audio_file = genai.upload_file(path=audio_file_path)

    # 等待檔案處理完成
    while audio_file.state.name == "PROCESSING":
        print('.', end='')
        time.sleep(2)
        audio_file = genai.get_file(audio_file.name)

    if audio_file.state.name == "FAILED":
        raise ValueError(audio_file.state.name)
        
    print(f"\nFile uploaded successfully. Starting analysis...")

    # 2. 準備 Prompt，包含對音訊的引用
    prompt = """
    你是一位專業的會議記錄助理。請仔細聆聽並分析這段會議音訊。
    根據音訊內容，以 JSON 格式提供以下資訊：
    1.  `summary`: 一段不超過 300 字的會議摘要。
    2.  `key_decisions`: 一個包含會議中所有關鍵決策的字串陣列。
    3.  `action_items`: 一個物件陣列，每個物件包含 `task` (任務描述), `owner` (負責人), 和 `due_date` (截止日期)。如果資訊不明確，請填寫 "N/A"。
    4.  `mindmap_structure`: 一個用於生成心智圖的巢狀 JSON 物件，包含 `name` (中心主題), `children` (子節點陣列)。

    請直接輸出符合規範的 JSON 物件，不要包含任何額外的解釋或 Markdown 語法。
    """

    # 3. 建立模型並生成內容
    model = genai.GenerativeModel(model_name="models/gemini-1.5-flash-latest")
    
    # 將音訊檔案和文字 prompt 一起發送
    response = model.generate_content([audio_file, prompt])

    # 4. 清理並返回 JSON 結果
    # (需要加上錯誤處理和 JSON 解析的程式碼)
    cleaned_json_string = response.text.strip().replace("```json", "").replace("```", "")
    return json.loads(cleaned_json_string)