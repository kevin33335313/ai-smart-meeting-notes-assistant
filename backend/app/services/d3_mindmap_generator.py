import json
from typing import Dict, Any, List
import google.generativeai as genai
from dotenv import load_dotenv
import os

# 載入環境變數
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_d3_mindmap_data(content_blocks: list) -> Dict[str, Any]:
    """生成 D3.js 心智圖數據結構"""
    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        content_text = _extract_content_text(content_blocks)
        mindmap_data = await _generate_d3_structure(content_text)
        
        return mindmap_data
        
    except Exception as e:
        print(f"D3 心智圖生成錯誤: {e}")
        return _get_fallback_d3_data()

async def _generate_d3_structure(content_text: str) -> Dict[str, Any]:
    """使用 Gemini 生成 D3 心智圖結構"""
    prompt = f"""
請根據會議內容創建一個 D3.js 心智圖數據結構。

**輸出格式範例：**
{{
    "id": "root",
    "label": "會議主題",
    "level": 0,
    "children": [
        {{
            "id": "branch1",
            "label": "戰略規劃",
            "level": 1,
            "children": [
                {{"id": "sub1", "label": "市場分析", "level": 2}},
                {{"id": "sub2", "label": "競爭對手研究", "level": 2}},
                {{"id": "sub3", "label": "客戶需求", "level": 2}}
            ]
        }},
        {{
            "id": "branch2", 
            "label": "執行計畫",
            "level": 1,
            "children": [
                {{"id": "sub4", "label": "團隊組建", "level": 2}},
                {{"id": "sub5", "label": "時程安排", "level": 2}}
            ]
        }}
    ]
}}

**會議內容：**
{content_text}

請創建包含4-6個主分支的心智圖結構，每個主分支有2-4個子項目。直接輸出JSON。
"""

    generation_config = genai.types.GenerationConfig(temperature=0.3)
    model = genai.GenerativeModel("gemini-2.5-flash", generation_config=generation_config)
    
    response = model.generate_content(prompt)
    
    cleaned_json = response.text.strip()
    if "```json" in cleaned_json:
        cleaned_json = cleaned_json.split("```json")[1].split("```")[0]
    elif "```" in cleaned_json:
        cleaned_json = cleaned_json.split("```")[1]
    
    try:
        return json.loads(cleaned_json.strip())
    except json.JSONDecodeError:
        return _get_fallback_d3_data()

def _get_fallback_d3_data() -> Dict[str, Any]:
    """獲取備用 D3 心智圖數據"""
    return {
        "id": "root",
        "label": "會議核心主題",
        "level": 0,
        "children": [
            {
                "id": "branch1",
                "label": "戰略規劃",
                "level": 1,
                "children": [
                    {"id": "sub1", "label": "市場分析", "level": 2},
                    {"id": "sub2", "label": "競爭對手研究", "level": 2},
                    {"id": "sub3", "label": "產品策略", "level": 2}
                ]
            },
            {
                "id": "branch2",
                "label": "執行計畫", 
                "level": 1,
                "children": [
                    {"id": "sub4", "label": "團隊組建", "level": 2},
                    {"id": "sub5", "label": "流程優化", "level": 2},
                    {"id": "sub6", "label": "時程安排", "level": 2}
                ]
            },
            {
                "id": "branch3",
                "label": "資源配置",
                "level": 1, 
                "children": [
                    {"id": "sub7", "label": "預算分配", "level": 2},
                    {"id": "sub8", "label": "技術資源", "level": 2}
                ]
            },
            {
                "id": "branch4",
                "label": "風險管控",
                "level": 1,
                "children": [
                    {"id": "sub9", "label": "技術風險", "level": 2},
                    {"id": "sub10", "label": "市場風險", "level": 2},
                    {"id": "sub11", "label": "營運風險", "level": 2}
                ]
            }
        ]
    }

def _extract_content_text(content_blocks: list) -> str:
    """從內容塊中提取文本"""
    content_text = "會議內容摘要：\n"
    
    for block in content_blocks:
        block_dict = block.dict() if hasattr(block, 'dict') else block
        
        if block_dict['type'] == 'heading_2':
            content_text += f"\n## {block_dict['content']['text']}\n"
        elif block_dict['type'] == 'bullet_list':
            for item in block_dict['content']['items']:
                content_text += f"- {item}\n"
        elif block_dict['type'] == 'callout':
            content_text += f"\n重要：{block_dict['content']['text']}\n"
        elif block_dict['type'] == 'toggle_list':
            content_text += f"\n{block_dict['content']['summary']}\n"
    
    return content_text