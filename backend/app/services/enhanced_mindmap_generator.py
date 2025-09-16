import os
import json
import time
import math
from typing import Dict, Any, List, Tuple
import google.generativeai as genai
from dotenv import load_dotenv
import graphviz
from ..models.schemas import ReactFlowMindMap

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_enhanced_mindmap(content_blocks: list) -> str:
    """生成高品質 PNG 心智圖並返回文件路徑"""
    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        content_text = _extract_content_text(content_blocks)
        mindmap_data = await _generate_mindmap_structure(content_text)
        
        # 生成 PNG 心智圖
        png_path = _create_graphviz_mindmap(mindmap_data)
        return png_path
        
    except Exception as e:
        print(f"心智圖生成錯誤: {e}")
        # 使用備用數據生成心智圖
        fallback_data = _get_fallback_mindmap_data()
        return _create_graphviz_mindmap(fallback_data)

def regenerate_mindmap_png(mindmap_data: Dict[str, Any]) -> str:
    """基於現有數據重新生成 PNG 心智圖"""
    return _create_graphviz_mindmap(mindmap_data)

async def _generate_mindmap_structure(content_text: str) -> Dict[str, Any]:
    """使用 Gemini 生成心智圖結構"""
    prompt = f"""
請根據會議內容創建一個心智圖結構，使用嵌套字典格式。

**輸出格式範例：**
{{
    "會議主題": {{
        "戰略規劃": {{
            "市場分析": ["競爭對手研究", "市場趨勢", "客戶需求"],
            "產品策略": ["功能規劃", "定價策略"]
        }},
        "執行計畫": {{
            "團隊組建": ["人員招募", "角色分工"],
            "時程安排": ["里程碑設定", "交付時間"]
        }}
    }}
}}

**會議內容：**
{content_text}

請創建包含4-6個主分支的心智圖結構，每個主分支有2-4個子項目。直接輸出JSON字典。
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
        return _get_fallback_mindmap_data()

def _create_graphviz_mindmap(mindmap_data: Dict[str, Any]) -> str:
    """使用 Graphviz 創建經典心智圖風格 PNG"""
    
    # 使用 neato 引擎進行手動定位
    dot = graphviz.Digraph(
        comment='Professional Mind Map',
        engine='neato',
        graph_attr={
            'bgcolor': 'white',
            'overlap': 'false',
            'splines': 'curved',
            'dpi': '300',
            'size': '20,14!',
            'pad': '1.0'
        },
        node_attr={
            'fontname': 'Microsoft YaHei,SimHei,Arial Unicode MS,sans-serif',
            'fontsize': '12',
            'fontcolor': 'white',
            'style': 'filled,rounded'
        },
        edge_attr={
            'dir': 'none'
        }
    )
    
    if not mindmap_data:
        mindmap_data = _get_fallback_mindmap_data()
        
    root_key = list(mindmap_data.keys())[0]
    branches = list(mindmap_data[root_key].items())
    
    # 確保至少有4個分支
    if len(branches) < 4:
        mindmap_data = _get_fallback_mindmap_data()
        root_key = list(mindmap_data.keys())[0]
        branches = list(mindmap_data[root_key].items())
    
    # 經典心智圖配色方案
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    
    # 中央主題 - 固定在中心
    dot.node('root', root_key,
             pos='0,0!',
             fillcolor='#2C3E50',
             fontcolor='white',
             fontsize='16',
             shape='box',
             width='4.5',
             height='1.2')
    
    # 分配分支位置：上2個、左2個、下2個
    positions = [
        (-6, 4),   # 左上
        (6, 4),    # 右上
        (-6, 0),   # 左中
        (6, 0),    # 右中
        (-6, -4),  # 左下
        (6, -4)    # 右下
    ]
    
    for i, (branch_title, items) in enumerate(branches[:6]):
        branch_id = f'branch_{i}'
        color = colors[i % len(colors)]
        x, y = positions[i]
        
        # 主分支節點
        dot.node(branch_id, branch_title,
                pos=f'{x},{y}!',
                fillcolor=color,
                fontcolor='white',
                fontsize='13',
                shape='box',
                width='3.0',
                height='1.0')
        
        # 主分支連接到中心
        dot.edge('root', branch_id,
                color=color,
                penwidth='4.0')
        
        # 處理子節點
        sub_items = []
        if isinstance(items, dict):
            for sub_key, sub_values in items.items():
                sub_items.append(sub_key)
                if isinstance(sub_values, list):
                    sub_items.extend(sub_values[:2])
        elif isinstance(items, list):
            sub_items.extend(items[:3])
        
        # 子節點位置計算
        is_left = x < 0
        sub_x_offset = -3.5 if is_left else 3.5
        
        for j, sub_item in enumerate(sub_items[:3]):
            sub_id = f'{branch_id}_sub_{j}'
            sub_x = x + sub_x_offset
            sub_y = y + (j - 1) * 1.5
            
            # 子節點使用淡色
            light_color = _lighten_color(color)
            
            dot.node(sub_id, sub_item,
                    pos=f'{sub_x},{sub_y}!',
                    fillcolor=light_color,
                    fontcolor='#2C3E50',
                    fontsize='10',
                    shape='ellipse',
                    width='2.2',
                    height='0.8')
            
            # 子節點連接到主分支
            dot.edge(branch_id, sub_id,
                    color=color,
                    penwidth='2.5')

def _lighten_color(hex_color: str) -> str:
    """將顏色變淡"""
    color_map = {
        '#FF6B6B': '#FFB3B3',
        '#4ECDC4': '#A8E6E1', 
        '#45B7D1': '#A2D5F2',
        '#96CEB4': '#C8E6D0',
        '#FFEAA7': '#FFF5D6',
        '#DDA0DD': '#EED0EE'
    }
    return color_map.get(hex_color, '#E8E8E8')

    # 生成文件
    output_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'local_uploads')
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = int(time.time() * 1000)
    filename = f'mindmap_{timestamp}'
    filepath = os.path.join(output_dir, filename)
    
    dot.render(filepath, format='png', cleanup=True)
    
    return f'{filepath}.png'

def _get_fallback_mindmap_data() -> Dict[str, Any]:
    """獲取備用心智圖數據"""
    return {
        '會議核心主題': {
            '戰略規劃': {
                '市場分析': ['競爭對手研究', '市場趨勢分析', '客戶需求調研'],
                '產品策略': ['功能規劃', '定價策略', '上市時程']
            },
            '執行計畫': {
                '團隊組建': ['人員招募', '角色分工', '培訓計畫'],
                '流程優化': ['工作流程', '品質控制', '效率提升']
            },
            '資源配置': {
                '預算分配': ['研發預算', '行銷預算', '營運預算'],
                '技術資源': ['開發工具', '基礎設施', '技術支援']
            },
            '風險管控': {
                '技術風險': ['技術可行性', '開發風險', '整合風險'],
                '市場風險': ['競爭風險', '需求變化', '法規風險']
            }
        }
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

# ReactFlow 心智圖生成功能（備用）
async def generate_reactflow_mindmap(content_blocks: list) -> ReactFlowMindMap:
    """生成 ReactFlow 格式的心智圖（備用功能）"""
    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        content_text = _extract_content_text(content_blocks)
        
        prompt = f"""
你是專業的心智圖設計師，請根據會議內容創建ReactFlow心智圖。

**輸出JSON結構：**
{{
  "nodes": [
    {{
      "id": "root",
      "data": {{
        "label": "會議主題",
        "level": 0,
        "color": "#1e293b"
      }},
      "position": {{ "x": 0, "y": 0 }}
    }}
  ],
  "edges": [
    {{ "id": "edge-root-branch1", "source": "root", "target": "branch1" }}
  ]
}}

**會議內容：**
{content_text}

請創建一個放射狀的心智圖，包含4-6個主分支，每個主分支有2-4個子項目。直接輸出JSON。
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
            result_dict = json.loads(cleaned_json.strip())
            
            if "nodes" not in result_dict or "edges" not in result_dict:
                raise ValueError("Generated JSON missing required fields")
            
            return ReactFlowMindMap(**result_dict)
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"ReactFlow心智圖生成失敗: {e}")
            return _get_fallback_reactflow_mindmap()
            
    except Exception as e:
        print(f"ReactFlow心智圖生成錯誤: {e}")
        return _get_fallback_reactflow_mindmap()

def _get_fallback_reactflow_mindmap() -> ReactFlowMindMap:
    """獲取備用ReactFlow心智圖"""
    return ReactFlowMindMap(
        nodes=[
            {
                "id": "root",
                "data": {"label": "會議核心主題", "level": 0, "color": "#2C3E50"},
                "position": {"x": 400, "y": 300}
            },
            {
                "id": "branch1",
                "data": {"label": "戰略規劃", "level": 1, "color": "#E74C3C"},
                "position": {"x": 200, "y": 150}
            },
            {
                "id": "branch2", 
                "data": {"label": "執行計畫", "level": 1, "color": "#3498DB"},
                "position": {"x": 600, "y": 150}
            }
        ],
        edges=[
            {"id": "edge-root-branch1", "source": "root", "target": "branch1"},
            {"id": "edge-root-branch2", "source": "root", "target": "branch2"}
        ]
    )