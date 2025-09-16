import os
import json
import time
from typing import Dict, Any, List, Tuple
import google.generativeai as genai
from dotenv import load_dotenv
from ..models.schemas import ReactFlowMindMap

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class ProfessionalMindMapGenerator:
    """專業心智圖生成器 - 基於商業分析和知識架構最佳實踐"""
    
    def __init__(self):
        self.color_schemes = {
            "strategy": "#2563eb",      # 藍色 - 戰略
            "operations": "#16a34a",    # 綠色 - 營運
            "risks": "#ea580c",         # 橙色 - 風險
            "actions": "#9333ea",       # 紫色 - 行動
            "analysis": "#0891b2",      # 青色 - 分析
            "decisions": "#dc2626",     # 紅色 - 決策
            "resources": "#65a30d",     # 萊姆綠 - 資源
            "timeline": "#7c3aed"       # 靛色 - 時程
        }
        
        self.icon_mapping = {
            "strategy": "🎯", "operations": "🔄", "risks": "⚠️", "actions": "✅",
            "analysis": "📊", "decisions": "🎯", "resources": "💼", "timeline": "⏰",
            "goals": "🎯", "process": "🔄", "team": "👥", "innovation": "💡",
            "growth": "📈", "quality": "⭐", "communication": "💬", "planning": "📋"
        }

    async def generate_professional_mindmap(self, content_blocks: list) -> ReactFlowMindMap:
        """生成專業級心智圖"""
        try:
            if not GEMINI_API_KEY:
                raise ValueError("Gemini API key not configured")
            
            # 分析內容並提取關鍵主題
            content_analysis = self._analyze_content_structure(content_blocks)
            
            # 使用 Gemini 生成心智圖結構
            mindmap_structure = await self._generate_mindmap_structure(content_analysis)
            
            # 應用專業佈局和樣式
            professional_mindmap = self._apply_professional_styling(mindmap_structure)
            
            return professional_mindmap
            
        except Exception as e:
            print(f"專業心智圖生成錯誤: {e}")
            return self._create_fallback_mindmap()

    def _analyze_content_structure(self, content_blocks: list) -> str:
        """分析內容結構並提取關鍵資訊"""
        analysis = {
            "main_topics": [],
            "key_decisions": [],
            "action_items": [],
            "risks_opportunities": [],
            "strategic_elements": []
        }
        
        for block in content_blocks:
            block_dict = block.dict() if hasattr(block, 'dict') else block
            
            if block_dict['type'] == 'heading_2':
                topic = block_dict['content']['text']
                analysis["main_topics"].append(topic)
                
                # 分類主題類型
                if any(keyword in topic.lower() for keyword in ['策略', '目標', '願景', '方向']):
                    analysis["strategic_elements"].append(topic)
                elif any(keyword in topic.lower() for keyword in ['風險', '挑戰', '機會', '威脅']):
                    analysis["risks_opportunities"].append(topic)
                elif any(keyword in topic.lower() for keyword in ['決策', '決定', '結論']):
                    analysis["key_decisions"].append(topic)
                elif any(keyword in topic.lower() for keyword in ['行動', '任務', '執行', '計畫']):
                    analysis["action_items"].append(topic)
            
            elif block_dict['type'] == 'callout':
                content = block_dict['content']['text']
                if block_dict['content'].get('style') == 'warning':
                    analysis["risks_opportunities"].append(content)
                else:
                    analysis["strategic_elements"].append(content)
        
        return json.dumps(analysis, ensure_ascii=False, indent=2)

    async def _generate_mindmap_structure(self, content_analysis: str) -> dict:
        """使用 Gemini 生成心智圖結構"""
        
        prompt = f"""
你是一位頂尖的商業分析師和資訊架構師，專精於創建專業級心智圖。

**重要語言要求：**
- 必須使用繁體中文輸出，絕對不可使用簡體中文
- 所有節點標籤都必須是繁體中文字符

**專業心智圖設計原則：**
1. **中央主題**：簡潔有力，3-6字概括會議核心
2. **主分支平衡**：左右各2-4個主分支，視覺平衡
3. **層級清晰**：最多3層，避免過度複雜
4. **色彩策略**：不同主題使用不同色系
5. **圖示運用**：每個重要節點配置合適圖示

**參考您提供的專業模板風格：**
- 中央主題：圓角矩形，深色背景
- 主分支：彩色邊框，白色背景
- 次分支：淺色背景，小圓點標記
- 連線：流暢曲線，顏色與分支一致

**輸出JSON結構：**
{{
  "central_topic": "會議核心主題",
  "branches": [
    {{
      "id": "branch1",
      "label": "主分支標題",
      "direction": "right",
      "color": "#2563eb",
      "icon": "🎯",
      "sub_branches": [
        {{
          "id": "sub1",
          "label": "次分支1",
          "items": ["具體項目1", "具體項目2"]
        }}
      ]
    }}
  ]
}}

**內容分析結果：**
{content_analysis}

請根據分析結果，生成一個專業的心智圖結構。確保：
1. 中央主題簡潔明確
2. 主分支數量適中（4-6個）
3. 每個分支都有實質內容
4. 使用繁體中文標籤
5. 合理的色彩和圖示配置

直接輸出JSON，不要包含markdown語法。
"""

        generation_config = genai.types.GenerationConfig(temperature=0.3)
        model = genai.GenerativeModel("gemini-2.5-flash", generation_config=generation_config)
        
        response = model.generate_content(prompt)
        
        # 清理並解析JSON
        cleaned_json = response.text.strip()
        if "```json" in cleaned_json:
            cleaned_json = cleaned_json.split("```json")[1].split("```")[0]
        elif "```" in cleaned_json:
            cleaned_json = cleaned_json.split("```")[1]
        
        return json.loads(cleaned_json.strip())

    def _apply_professional_styling(self, structure: dict) -> ReactFlowMindMap:
        """應用專業樣式和佈局"""
        nodes = []
        edges = []
        
        # 中央主題節點
        central_topic = structure.get("central_topic", "會議主題")
        nodes.append({
            "id": "root",
            "data": {
                "label": central_topic,
                "level": 0,
                "color": "#1e293b",
                "icon": "🎯"
            },
            "position": {"x": 0, "y": 0}
        })
        
        # 處理主分支
        branches = structure.get("branches", [])
        left_branches = [b for b in branches if b.get("direction") == "left"]
        right_branches = [b for b in branches if b.get("direction") == "right"]
        
        # 如果沒有指定方向，自動平衡分配
        if not left_branches and not right_branches:
            mid = len(branches) // 2
            left_branches = branches[:mid]
            right_branches = branches[mid:]
            
            for branch in left_branches:
                branch["direction"] = "left"
            for branch in right_branches:
                branch["direction"] = "right"
        
        # 生成主分支節點
        self._create_branch_nodes(left_branches + right_branches, nodes, edges)
        
        return ReactFlowMindMap(nodes=nodes, edges=edges)

    def _create_branch_nodes(self, branches: List[dict], nodes: List[dict], edges: List[dict]):
        """創建分支節點"""
        for i, branch in enumerate(branches):
            branch_id = branch.get("id", f"branch_{i}")
            
            # 主分支節點
            nodes.append({
                "id": branch_id,
                "data": {
                    "label": branch.get("label", f"分支{i+1}"),
                    "level": 1,
                    "direction": branch.get("direction", "right"),
                    "color": branch.get("color", self.color_schemes["strategy"]),
                    "icon": branch.get("icon", "📋")
                },
                "position": {"x": 0, "y": 0}
            })
            
            # 連接到中央主題
            edges.append({
                "id": f"edge-root-{branch_id}",
                "source": "root",
                "target": branch_id
            })
            
            # 處理次分支
            sub_branches = branch.get("sub_branches", [])
            for j, sub_branch in enumerate(sub_branches):
                sub_id = f"{branch_id}_sub_{j}"
                
                nodes.append({
                    "id": sub_id,
                    "data": {
                        "label": sub_branch.get("label", f"次分支{j+1}"),
                        "level": 2,
                        "direction": branch.get("direction", "right"),
                        "color": branch.get("color", self.color_schemes["strategy"]),
                        "icon": "📌"
                    },
                    "position": {"x": 0, "y": 0}
                })
                
                edges.append({
                    "id": f"edge-{branch_id}-{sub_id}",
                    "source": branch_id,
                    "target": sub_id
                })
                
                # 處理具體項目
                items = sub_branch.get("items", [])
                for k, item in enumerate(items[:3]):  # 限制最多3個項目避免過度複雜
                    item_id = f"{sub_id}_item_{k}"
                    
                    nodes.append({
                        "id": item_id,
                        "data": {
                            "label": item,
                            "level": 3,
                            "direction": branch.get("direction", "right"),
                            "color": branch.get("color", self.color_schemes["strategy"])
                        },
                        "position": {"x": 0, "y": 0}
                    })
                    
                    edges.append({
                        "id": f"edge-{sub_id}-{item_id}",
                        "source": sub_id,
                        "target": item_id
                    })

    def _create_fallback_mindmap(self) -> ReactFlowMindMap:
        """創建備用心智圖"""
        return ReactFlowMindMap(
            nodes=[
                {
                    "id": "root",
                    "data": {"label": "會議核心主題", "level": 0, "color": "#1e293b", "icon": "🎯"},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "strategy",
                    "data": {"label": "戰略規劃", "level": 1, "direction": "right", "color": "#2563eb", "icon": "🎯"},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "execution",
                    "data": {"label": "執行計畫", "level": 1, "direction": "left", "color": "#16a34a", "icon": "🔄"},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "risks",
                    "data": {"label": "風險管控", "level": 1, "direction": "right", "color": "#ea580c", "icon": "⚠️"},
                    "position": {"x": 0, "y": 0}
                },
                {
                    "id": "actions",
                    "data": {"label": "行動方案", "level": 1, "direction": "left", "color": "#9333ea", "icon": "✅"},
                    "position": {"x": 0, "y": 0}
                }
            ],
            edges=[
                {"id": "edge-root-strategy", "source": "root", "target": "strategy"},
                {"id": "edge-root-execution", "source": "root", "target": "execution"},
                {"id": "edge-root-risks", "source": "root", "target": "risks"},
                {"id": "edge-root-actions", "source": "root", "target": "actions"}
            ]
        )

# 全域實例
professional_mindmap_generator = ProfessionalMindMapGenerator()