import os
import json
import time
from typing import Dict, Any

import google.generativeai as genai
from dotenv import load_dotenv

from ..models.schemas import ReactFlowMindMap

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_mindmap_from_content_blocks(content_blocks: list) -> ReactFlowMindMap:
    """從內容區塊生成心智圖"""
    
    try:
        # 檢查 API 金鑰
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        # 組合文本內容
        text_content = "會議內容結構：\n"
        for block in content_blocks:
            # 處理 Pydantic 物件或字典
            block_dict = block.dict() if hasattr(block, 'dict') else block
            
            if block_dict['type'] == 'heading_2':
                text_content += f"\n## {block_dict['content']['text']}\n"
            elif block_dict['type'] == 'bullet_list':
                for item in block_dict['content']['items']:
                    text_content += f"- {item}\n"
            elif block_dict['type'] == 'callout':
                text_content += f"\n重要：{block_dict['content']['text']}\n"
            elif block_dict['type'] == 'toggle_list':
                summary = block_dict['content'].get('summary', '摘要')
                details = block_dict['content'].get('details', '')
                if summary and details:
                    text_content += f"\n{summary}: {details}\n"
        
        # 商業分析師級別的心智圖生成 Prompt
        prompt = """
你是一位資深商業分析師與資訊架構師，擅長將複雜會議內容轉化為清晰的商業洞察心智圖。

**分析框架 (MECE原則)：**
1. **戰略層面** (Strategic) - 目標、願景、決策
2. **營運層面** (Operational) - 流程、執行、資源
3. **風險與機會** (Risk & Opportunity) - 挑戰、威脅、機會點
4. **行動計畫** (Action Plan) - 具體任務、時程、負責人

**心智圖設計原則：**
- 中央主題：會議核心目的或專案名稱
- 主分支 (數量由你專業判斷，避免不必要的分支)：按商業邏輯分類，左右平衡佈局
- 次分支：具體要點，每個主分支下2-4個子項目
- 顏色策略：戰略(藍色#2563eb)、營運(綠色#16a34a)、風險(橙色#ea580c)、行動(紫色#9333ea)
- 圖示策略：🎯目標 📊分析 ⚠️風險 ✅行動 💡創新 👥團隊 📈成長 🔄流程

**輸出要求：**
- 節點標籤簡潔有力 (3-8字)
- level 1 節點平均分配 left/right
- 每個分支統一色系
- 重要節點加上合適圖示

範例結構：
{
  "nodes": [
    { "id": "root", "data": { "label": "Q3產品策略會議", "level": 0 }, "position": { "x": 0, "y": 0 } },
    { "id": "strategy", "data": { "label": "市場策略", "level": 1, "direction": "right", "color": "#2563eb", "icon": "🎯" }, "position": { "x": 0, "y": 0 } },
    { "id": "operations", "data": { "label": "營運執行", "level": 1, "direction": "left", "color": "#16a34a", "icon": "🔄" }, "position": { "x": 0, "y": 0 } }
  ],
  "edges": [
    { "id": "edge-root-strategy", "source": "root", "target": "strategy" },
    { "id": "edge-root-operations", "source": "root", "target": "operations" }
  ]
}

請直接輸出 JSON，不要包含 Markdown 語法。
        """
        
        # 建立模型並發送請求
        model = genai.GenerativeModel(model_name="gemini-2.5-flash")
        response = model.generate_content(f"{text_content}\n\n{prompt}")
        
        print(f"Gemini 原始回應: {response.text}")
        
        # 清理並解析 JSON 回應
        cleaned_json_string = response.text.strip()
        
        # 移除可能的 Markdown 語法
        if "```json" in cleaned_json_string:
            cleaned_json_string = cleaned_json_string.split("```json")[1].split("```")[0]
        elif "```" in cleaned_json_string:
            cleaned_json_string = cleaned_json_string.split("```")[1]
        
        cleaned_json_string = cleaned_json_string.strip()
        
        print(f"清理後的 JSON: {cleaned_json_string}")
        
        # 解析 JSON
        result_dict = json.loads(cleaned_json_string)
        
        # 驗證必要欄位
        if "nodes" not in result_dict or "edges" not in result_dict:
            raise ValueError("Generated JSON missing required fields: nodes or edges")
        
        # 補充缺失的 position 欄位
        for node in result_dict["nodes"]:
            if "position" not in node:
                node["position"] = {"x": 0, "y": 0}
        
        # 轉換為 Pydantic 模型
        return ReactFlowMindMap(**result_dict)
        
    except json.JSONDecodeError as e:
        print(f"JSON 解析錯誤: {e}")
        print(f"原始回應: {response.text if 'response' in locals() else 'No response'}")
        # 返回商業級別的預設心智圖結構
        return ReactFlowMindMap(
            nodes=[
                {"id": "root", "data": {"label": "會議核心主題", "level": 0}, "position": {"x": 0, "y": 0}},
                {"id": "strategy", "data": {"label": "戰略目標", "level": 1, "direction": "right", "color": "#2563eb", "icon": "🎯"}, "position": {"x": 0, "y": 0}},
                {"id": "operations", "data": {"label": "營運執行", "level": 1, "direction": "left", "color": "#16a34a", "icon": "🔄"}, "position": {"x": 0, "y": 0}},
                {"id": "risks", "data": {"label": "風險與機會", "level": 1, "direction": "right", "color": "#ea580c", "icon": "⚠️"}, "position": {"x": 0, "y": 0}},
                {"id": "actions", "data": {"label": "行動計畫", "level": 1, "direction": "left", "color": "#9333ea", "icon": "✅"}, "position": {"x": 0, "y": 0}}
            ],
            edges=[
                {"id": "edge-root-strategy", "source": "root", "target": "strategy"},
                {"id": "edge-root-operations", "source": "root", "target": "operations"},
                {"id": "edge-root-risks", "source": "root", "target": "risks"},
                {"id": "edge-root-actions", "source": "root", "target": "actions"}
            ]
        )
    except Exception as e:
        print(f"心智圖生成錯誤: {e}")
        import traceback
        traceback.print_exc()
        # 返回商業級別的預設心智圖結構
        return ReactFlowMindMap(
            nodes=[
                {"id": "root", "data": {"label": "會議核心主題", "level": 0}, "position": {"x": 0, "y": 0}},
                {"id": "strategy", "data": {"label": "戰略目標", "level": 1, "direction": "right", "color": "#2563eb", "icon": "🎯"}, "position": {"x": 0, "y": 0}},
                {"id": "operations", "data": {"label": "營運執行", "level": 1, "direction": "left", "color": "#16a34a", "icon": "🔄"}, "position": {"x": 0, "y": 0}},
                {"id": "risks", "data": {"label": "風險與機會", "level": 1, "direction": "right", "color": "#ea580c", "icon": "⚠️"}, "position": {"x": 0, "y": 0}},
                {"id": "actions", "data": {"label": "行動計畫", "level": 1, "direction": "left", "color": "#9333ea", "icon": "✅"}, "position": {"x": 0, "y": 0}}
            ],
            edges=[
                {"id": "edge-root-strategy", "source": "root", "target": "strategy"},
                {"id": "edge-root-operations", "source": "root", "target": "operations"},
                {"id": "edge-root-risks", "source": "root", "target": "risks"},
                {"id": "edge-root-actions", "source": "root", "target": "actions"}
            ]
        )