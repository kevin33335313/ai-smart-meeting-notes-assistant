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

async def generate_markmap_markdown(content_blocks: list) -> str:
    """生成 Markmap 格式的 Markdown 心智圖"""
    try:
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        content_text = _extract_content_text(content_blocks)
        markdown = await _generate_markdown_structure(content_text)
        
        return markdown
        
    except Exception as e:
        print(f"Markmap 心智圖生成錯誤: {e}")
        return _get_fallback_markdown()

async def _generate_markdown_structure(content_text: str) -> str:
    """使用 Gemini 生成 Markdown 心智圖結構"""
    prompt = f"""
請根據會議內容創建一個 Markmap 格式的 Markdown 心智圖。

**輸出格式範例：**
```markdown
# 會議主題

## 戰略規劃
- 市場分析
  - 競爭對手研究
  - 市場趨勢分析
  - 客戶需求調研
- 產品策略
  - 功能規劃
  - 定價策略
  - 上市時程

## 執行計畫
- 團隊組建
  - 人員招募
  - 角色分工
  - 培訓計畫
- 時程安排
  - 里程碑設定
  - 交付時間
  - 風險緩衝
```

**會議內容：**
{content_text}

請創建包含4-6個主分支的 Markdown 心智圖，每個主分支有2-4個子項目，每個子項目有2-3個細節。
直接輸出 Markdown 格式，不要包含 ```markdown 標記。
"""

    generation_config = genai.types.GenerationConfig(temperature=0.3)
    model = genai.GenerativeModel("gemini-2.5-flash", generation_config=generation_config)
    
    response = model.generate_content(prompt)
    
    markdown_text = response.text.strip()
    
    # 清理可能的 markdown 標記
    if "```markdown" in markdown_text:
        markdown_text = markdown_text.split("```markdown")[1].split("```")[0]
    elif "```" in markdown_text:
        lines = markdown_text.split("\n")
        start_idx = 0
        end_idx = len(lines)
        
        for i, line in enumerate(lines):
            if line.strip().startswith("```"):
                if start_idx == 0:
                    start_idx = i + 1
                else:
                    end_idx = i
                    break
        
        markdown_text = "\n".join(lines[start_idx:end_idx])
    
    return markdown_text.strip()

def _get_fallback_markdown() -> str:
    """獲取備用 Markdown 心智圖"""
    return """# 會議核心主題

## 戰略規劃
- 市場分析
  - 競爭對手研究
  - 市場趨勢分析
  - 客戶需求調研
- 產品策略
  - 功能規劃
  - 定價策略
  - 上市時程

## 執行計畫
- 團隊組建
  - 人員招募
  - 角色分工
  - 培訓計畫
- 流程優化
  - 工作流程
  - 品質控制
  - 效率提升

## 資源配置
- 預算分配
  - 研發預算
  - 行銷預算
  - 營運預算
- 技術資源
  - 開發工具
  - 基礎設施
  - 技術支援

## 風險管控
- 技術風險
  - 技術可行性
  - 開發風險
  - 整合風險
- 市場風險
  - 競爭風險
  - 需求變化
  - 法規風險"""

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