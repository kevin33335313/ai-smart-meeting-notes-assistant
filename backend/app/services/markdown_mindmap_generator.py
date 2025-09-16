import os
import json
import time
from typing import Dict, Any, List

import google.generativeai as genai
from dotenv import load_dotenv

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def generate_markdown_mindmap_from_content_blocks(content_blocks: list) -> str:
    """從內容區塊生成markdown格式的心智圖"""
    
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
                text_content += f"\n{block_dict['content']['summary']}: {block_dict['content']['details']}\n"
        
        # Markdown 心智圖生成 Prompt
        prompt = f"""
你是一位資深知識架構師，擅長將複雜會議內容轉化為清晰的markdown格式心智圖。

**重要語言要求：**
- 必須使用繁體中文輸出，絕對不可使用簡體中文
- 所有節點標籤、文字內容都必須是繁體中文字符

**參考範例格式（Swift Optional 心智圖風格）：**

# 會議主題心智圖

## 核心概念
**定義：** 會議的主要目的和核心議題

**重要性：** 為什麼這次會議很重要

## 主要議題分類
**議題類型A：** 具體描述這類議題的特點

- **子議題1：** 詳細說明
- **子議題2：** 相關內容

**議題類型B：** 另一類議題的描述

- **處理方式1：** 具體做法
- **處理方式2：** 替代方案

## 決策與行動
**重要決策**

- **決策1：** 具體決定內容
- **決策2：** 另一個重要決定

**行動項目**

- **任務A：** 具體任務描述
- **任務B：** 另一個任務

## 關鍵要點
**成功因素**

- **因素1：** 成功的關鍵要素
- **因素2：** 另一個重要因素

**風險與挑戰**

- **風險1：** 需要注意的風險點
- **風險2：** 可能的挑戰

## 後續追蹤
**監控指標**

- **指標1：** 需要追蹤的數據
- **指標2：** 另一個重要指標

**時程安排**

- **階段1：** 短期目標和時間點
- **階段2：** 中長期規劃

**輸出要求：**
1. **必須使用繁體中文**：所有內容都必須是繁體中文
2. **結構清晰**：使用 # ## 標題層級，**粗體** 強調重點
3. **內容豐富**：每個分類下都要有具體的子項目
4. **邏輯連貫**：按重要性和邏輯順序排列
5. **實用性強**：內容要具體可執行，不要空泛

請根據以下會議內容，生成一個結構化的markdown心智圖：

{text_content}

請直接輸出markdown格式，不要包含任何其他說明文字。
"""
        
        # 建立模型並發送請求
        generation_config = genai.types.GenerationConfig(
            temperature=0.3,
        )
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config
        )
        
        response = model.generate_content(prompt)
        
        print(f"Markdown心智圖生成成功")
        
        # 返回生成的markdown內容
        return response.text.strip()
        
    except Exception as e:
        print(f"Markdown心智圖生成錯誤: {e}")
        import traceback
        traceback.print_exc()
        
        # 返回預設的markdown心智圖結構
        return """# 會議心智圖

## 核心概念
**定義：** 本次會議的主要目的和討論重點

**重要性：** 對組織或專案的影響和意義

## 主要議題
**策略規劃**

- **目標設定：** 明確的目標和期望成果
- **資源配置：** 人力和預算的分配

**執行計畫**

- **時程安排：** 具體的時間節點
- **責任分工：** 各部門和個人的職責

## 決策與行動
**重要決策**

- **決策1：** 會議中達成的重要共識
- **決策2：** 需要進一步討論的議題

**行動項目**

- **立即行動：** 會後需要馬上執行的任務
- **後續追蹤：** 需要持續關注的事項

## 風險與機會
**潛在風險**

- **內部風險：** 組織內部可能面臨的挑戰
- **外部風險：** 市場或環境變化的影響

**發展機會**

- **短期機會：** 近期可以把握的機會點
- **長期機會：** 未來發展的可能性

## 後續追蹤
**監控機制**

- **定期檢討：** 進度追蹤的頻率和方式
- **成效評估：** 衡量成功的標準和指標

**溝通協調**

- **內部溝通：** 團隊間的資訊分享機制
- **外部溝通：** 與利害關係人的互動方式"""

async def generate_markdown_mindmap_from_transcript(transcript: str) -> str:
    """直接從轉錄文本生成markdown格式的心智圖"""
    
    try:
        # 檢查 API 金鑰
        if not GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        
        # Markdown 心智圖生成 Prompt
        prompt = f"""
你是一位資深知識架構師，擅長將會議轉錄內容轉化為清晰的markdown格式心智圖。

**重要語言要求：**
- 必須使用繁體中文輸出，絕對不可使用簡體中文
- 所有節點標籤、文字內容都必須是繁體中文字符

**參考範例格式（Swift Optional 心智圖風格）：**

# 會議主題心智圖

## 核心概念
**定義：** 會議的主要目的和核心議題

**重要性：** 為什麼這次會議很重要

## 主要議題分類
**議題類型A：** 具體描述這類議題的特點

- **子議題1：** 詳細說明
- **子議題2：** 相關內容

**議題類型B：** 另一類議題的描述

- **處理方式1：** 具體做法
- **處理方式2：** 替代方案

## 決策與行動
**重要決策**

- **決策1：** 具體決定內容
- **決策2：** 另一個重要決定

**行動項目**

- **任務A：** 具體任務描述
- **任務B：** 另一個任務

## 關鍵要點
**成功因素**

- **因素1：** 成功的關鍵要素
- **因素2：** 另一個重要因素

**風險與挑戰**

- **風險1：** 需要注意的風險點
- **風險2：** 可能的挑戰

## 後續追蹤
**監控指標**

- **指標1：** 需要追蹤的數據
- **指標2：** 另一個重要指標

**時程安排**

- **階段1：** 短期目標和時間點
- **階段2：** 中長期規劃

**輸出要求：**
1. **必須使用繁體中文**：所有內容都必須是繁體中文
2. **結構清晰**：使用 # ## 標題層級，**粗體** 強調重點
3. **內容豐富**：每個分類下都要有具體的子項目
4. **邏輯連貫**：按重要性和邏輯順序排列
5. **實用性強**：內容要具體可執行，不要空泛

請根據以下會議轉錄內容，生成一個結構化的markdown心智圖：

{transcript}

請直接輸出markdown格式，不要包含任何其他說明文字。
"""
        
        # 建立模型並發送請求
        generation_config = genai.types.GenerationConfig(
            temperature=0.3,
        )
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config
        )
        
        response = model.generate_content(prompt)
        
        print(f"從轉錄文本生成Markdown心智圖成功")
        
        # 返回生成的markdown內容
        return response.text.strip()
        
    except Exception as e:
        print(f"從轉錄文本生成Markdown心智圖錯誤: {e}")
        import traceback
        traceback.print_exc()
        
        # 返回預設的markdown心智圖結構
        return """# 會議心智圖

## 核心概念
**定義：** 本次會議的主要目的和討論重點

**重要性：** 對組織或專案的影響和意義

## 主要議題
**策略規劃**

- **目標設定：** 明確的目標和期望成果
- **資源配置：** 人力和預算的分配

**執行計畫**

- **時程安排：** 具體的時間節點
- **責任分工：** 各部門和個人的職責

## 決策與行動
**重要決策**

- **決策1：** 會議中達成的重要共識
- **決策2：** 需要進一步討論的議題

**行動項目**

- **立即行動：** 會後需要馬上執行的任務
- **後續追蹤：** 需要持續關注的事項

## 風險與機會
**潛在風險**

- **內部風險：** 組織內部可能面臨的挑戰
- **外部風險：** 市場或環境變化的影響

**發展機會**

- **短期機會：** 近期可以把握的機會點
- **長期機會：** 未來發展的可能性

## 後續追蹤
**監控機制**

- **定期檢討：** 進度追蹤的頻率和方式
- **成效評估：** 衡量成功的標準和指標

**溝通協調**

- **內部溝通：** 團隊間的資訊分享機制
- **外部溝通：** 與利害關係人的互動方式"""