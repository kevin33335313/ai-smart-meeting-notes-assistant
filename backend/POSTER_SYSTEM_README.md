# AI 智能海報生成系統

基於《提示詞優化海報生成框架》實現的智能海報生成系統，將傳統的關鍵詞拼接工具升級為具備創意指導能力的自動化系統。

## 🎯 系統概述

本系統實現了從「關鍵詞生成」到「創意指導」的範式轉移，通過結構化的提示詞工程和智能化的概念轉化，為用戶提供專業級的海報設計解決方案。

## 🏗 核心架構

### 1. 智能提示詞引擎 (`poster_prompt_engine.py`)

實現四個核心模組的協同工作：

- **第一模組：概念轉化** - 將抽象主題轉化為具體視覺主體
- **第二模組：風格解構** - 將風格選擇解構為技術關鍵詞組合
- **第三模組：機率性選擇** - 引入受控隨機性避免重複結果
- **第四模組：提示詞合成** - 按七層架構組裝最終提示詞

### 2. 迭代優化服務 (`poster_iteration_service.py`)

支援12種調整類型的即時優化：

- 戲劇性調整：`more_dramatic`, `less_dramatic`
- 色彩調整：`change_palette`, `warmer_colors`, `cooler_colors`
- 構圖調整：`different_angle`, `more_minimal`, `more_detailed`
- 光照調整：`brighter`, `darker`
- 風格調整：`more_professional`, `more_creative`

### 3. 結構化詞彙庫

包含五大類專業詞彙：

- **藝術風格與運動**：Art Deco, Bauhaus, Mid-century modern, Swiss design
- **現代插畫風格**：Flat design, Isometric, Gradient mesh, Line art
- **媒介與技術**：Digital art, Risograph print, Mixed media
- **構圖與取景**：Minimalist, Dynamic, Grid-based
- **光照與氛圍**：Studio light, Dramatic lighting, Natural daylight

## 🎨 風格配方系統

### 支援的風格類型

1. **企業正式風格** (`corporate_formal`)
   - 構圖：簡約、網格化
   - 光照：柔和工作室燈光
   - 色彩：海軍藍與灰色
   - 情緒：專業、可信賴

2. **現代科技風格** (`modern_tech`)
   - 構圖：動態、簡約
   - 光照：重點照明、戲劇性
   - 色彩：鮮豔、單色調
   - 情緒：創新、前衛

3. **創意活潑風格** (`creative_vibrant`)
   - 構圖：動態、簡約
   - 光照：自然光、重點照明
   - 色彩：鮮豔、大地色調
   - 情緒：充滿活力、創意

4. **復古懷舊風格** (`vintage_retro`)
   - 構圖：網格化、簡約
   - 光照：自然光、工作室燈光
   - 色彩：大地色調、單色調
   - 情緒：懷舊、經典

## 🧠 抽象概念轉化

系統能夠識別並轉化以下抽象概念：

- **創新** → 發光的神經網絡、展開的幾何形狀
- **連接** → 交織的光線、網絡節點
- **安全** → 光粒子盾牌、晶體保護屏障
- **速度** → 運動光軌、空氣動力學光線
- **成長** → 有機分支模式、上升幾何形狀
- **協作** → 交叉光束、同步幾何舞蹈

## 📡 API 端點

### 1. 生成海報
```http
POST /api/v1/generate-poster
Content-Type: multipart/form-data

{
  "text_content": "AI 驅動的網絡安全產品發布",
  "style": "modern_tech",
  "poster_type": "announcement"
}
```

### 2. 調整海報
```http
POST /api/v1/adjust-poster
Content-Type: multipart/form-data

{
  "original_prompt": "...",
  "adjustment_type": "more_dramatic",
  "session_id": "uuid",
  "text_content": "..."
}
```

## 🔧 使用方式

### 基本生成流程

1. **輸入主題**：用戶提供海報主題（可以是抽象概念）
2. **選擇風格**：從四種預定義風格中選擇
3. **指定類型**：選擇海報類型（公告、促銷等）
4. **智能處理**：系統自動進行概念轉化和風格解構
5. **生成結果**：獲得高品質的專業海報

### 迭代優化流程

1. **查看初始結果**：檢視首次生成的海報
2. **選擇調整類型**：從12種調整選項中選擇
3. **即時優化**：系統精確修改提示詞特定部分
4. **重新生成**：獲得調整後的新版本
5. **持續迭代**：可進行多次調整直到滿意

## 🧪 測試與驗證

運行測試腳本驗證系統功能：

```bash
cd backend
python test_poster_engine.py
```

測試內容包括：
- 基本提示詞生成功能
- 迭代優化功能
- 抽象概念提取功能

## 📊 技術優勢

1. **結構化方法**：七層提示詞架構確保全面性和可控性
2. **智能轉化**：自動將抽象概念轉化為具體視覺隱喻
3. **風格一致性**：基於配方的風格系統確保專業品質
4. **迭代優化**：支援精確的局部調整而非重新開始
5. **擴展性**：模組化設計便於添加新風格和功能

## 🚀 未來發展

1. **風格微調**：支援企業品牌專屬風格訓練
2. **自定義配方**：允許用戶創建和保存個人風格配方
3. **分步構圖控制**：結合 Inpainting/Outpainting 技術
4. **多語言支援**：擴展到其他語言的概念識別
5. **A/B 測試**：自動生成多個版本供用戶選擇

## 📝 注意事項

- 確保 `GEMINI_API_KEY` 已正確配置
- 生成的圖像會自動保存到 `./generated_images/` 目錄
- 系統會自動追蹤 token 使用量和成本
- 所有生成的圖像都不包含文字，需要後續添加

---

此系統代表了 AI 輔助設計的新範式，從簡單的工具升級為智能的創意合作夥伴。