# AI 智能工具箱

一個集成多種 AI 工具的智能平台，提供會議筆記、海報生成、發票管理和文檔問答等功能。

## 🎯 專案概述

本專案是一個現代化的 AI 工具集合平台，旨在通過人工智能技術提升工作效率。平台採用模組化設計，每個工具都專注於解決特定的業務需求，為用戶提供智能化的解決方案。

## ✨ 核心功能

### 🎤 AI 智慧會議筆記
- **音頻上傳**: 支援 MP3、M4A、WAV、MP4 格式
- **實時處理**: 顯示處理進度和音頻波形
- **智能分析**: 自動生成摘要、關鍵決策和行動項目
- **結構化筆記**: Notion 風格的區塊化內容呈現
- **心智圖生成**: 自動創建互動式心智圖
- **筆記管理**: 顏色分類、標籤系統、收藏功能
- **全文搜索**: 快速查找筆記內容
- **匯出功能**: 支援 Markdown 格式匯出

### 🎨 AI 智能海報生成器
- **文字轉海報**: 輸入描述自動生成專業海報
- **多種風格**: 商業、學術、創意等不同風格
- **即時預覽**: 實時查看生成效果
- **歷史記錄**: 保存和管理生成的海報

### 📄 AI 智能發票管理
- **OCR 識別**: 自動識別發票內容
- **數據提取**: 智能提取關鍵資訊
- **分類管理**: 自動分類和整理
- **報表生成**: 生成財務報表

### 📚 RAG 文檔問答系統
- **多文檔上傳**: 支援各種文檔格式
- **向量化存儲**: 高效的文檔檢索
- **智能問答**: 基於文檔內容的精準回答
- **來源引用**: 提供答案來源追溯

## 🛠 技術架構

### 前端技術棧
- **框架**: Next.js 15 with App Router
- **語言**: TypeScript
- **樣式**: Tailwind CSS + Shadcn/ui
- **動畫**: Framer Motion
- **視覺化**: React Flow (心智圖)
- **狀態管理**: React Hooks
- **UI 組件**: 自定義組件庫

### 後端技術棧
- **框架**: Python FastAPI
- **AI 模型**: 
  - Google Gemini 2.5 Flash (主要)
  - Ollama llama3.1:8b (備用)
- **向量數據庫**: Supabase + pgvector
- **嵌入模型**: Google text-embedding-004
- **文檔處理**: LangChain
- **OCR**: 集成 OCR 服務

### 數據存儲
- **筆記存儲**: 本地 JSON 文件 + 索引
- **文件上傳**: 本地文件系統
- **向量存儲**: Supabase 向量數據庫
- **會話管理**: 內存 + 持久化

## 📸 功能截圖

### 主頁 - 工具箱
![工具箱主頁](docs/images/homepage.png)
*現代化的工具選擇界面，支持 4 種 AI 工具*

### 會議筆記 - 上傳界面
![上傳界面](docs/images/upload.png)
*簡潔的音頻上傳界面，支持多種格式*

### 會議筆記 - 處理進度
![處理進度](docs/images/processing.png)
*實時顯示 AI 分析進度和音頻波形*

### 會議筆記 - 結果展示
![筆記結果](docs/images/notes-result.png)
*結構化的筆記內容和互動式心智圖*

### 筆記管理 - 總覽頁面
![筆記總覽](docs/images/notes-overview.png)
*筆記列表管理，支持搜索、分類和標籤*

## 🚀 快速開始

### 系統需求
- **Node.js**: 18.0+ 
- **Python**: 3.8+
- **API Keys**: Google Gemini API Key
- **可選**: Ollama (本地 LLM)

### 環境設置

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd AI-Tools
   ```

2. **後端設置**
   ```bash
   cd backend
   
   # 安裝依賴
   pip install -r requirements.txt
   
   # 配置環境變數
   cp .env.example .env
   # 編輯 .env 添加 API Keys
   ```

3. **前端設置**
   ```bash
   cd frontend
   
   # 安裝依賴
   npm install
   
   # 或使用 yarn
   yarn install
   ```

### 啟動服務

**開發模式**:
```bash
# 後端服務 (端口 8000)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端服務 (端口 3000)
cd frontend
npm run dev
```

**訪問地址**:
- 🌐 前端應用: http://localhost:3000
- 🔧 後端 API: http://localhost:8000
- 📚 API 文檔: http://localhost:8000/docs

## 📁 專案結構

```
AI-Tools/
├── backend/                           # Python FastAPI 後端
│   ├── app/
│   │   ├── config/                   # 配置文件
│   │   ├── models/                   # 數據模型
│   │   │   ├── schemas.py           # API 模型定義
│   │   │   ├── content_blocks.py    # 內容區塊模型
│   │   │   └── usage_tracking.py    # 使用統計模型
│   │   ├── services/                # 業務邏輯服務
│   │   │   ├── gemini_processor.py  # Gemini AI 處理
│   │   │   ├── notes_manager.py     # 筆記管理
│   │   │   ├── mindmap_generator.py # 心智圖生成
│   │   │   ├── token_service.py     # Token 統計
│   │   │   └── rag_service.py       # RAG 問答服務
│   │   ├── routes/                  # API 路由
│   │   │   ├── poster_generator.py  # 海報生成 API
│   │   │   ├── invoice_manager.py   # 發票管理 API
│   │   │   └── icon_generator.py    # 圖標生成 API
│   │   ├── routers/                 # 路由模組
│   │   │   └── document_qa.py       # 文檔問答路由
│   │   └── main.py                  # FastAPI 應用入口
│   ├── notes_storage/               # 筆記持久化存儲
│   ├── local_uploads/               # 臨時文件上傳
│   ├── generated_images/            # 生成的圖片
│   ├── invoice_uploads/             # 發票上傳目錄
│   ├── vector_store/                # 向量數據庫
│   ├── .env.example                # 環境變數範例
│   └── requirements.txt            # Python 依賴
├── frontend/                        # Next.js 15 前端
│   ├── app/                        # App Router 頁面
│   │   ├── page.tsx               # 主頁 (工具箱)
│   │   ├── notes/[taskId]/        # 筆記詳情頁
│   │   ├── tools/                 # 工具頁面
│   │   │   ├── meeting-notes/     # 會議筆記工具
│   │   │   ├── poster-generator/  # 海報生成工具
│   │   │   ├── invoice-manager/   # 發票管理工具
│   │   │   └── document-qa/       # 文檔問答工具
│   │   └── components/            # 頁面組件
│   ├── components/                # 共用組件
│   │   ├── ui/                   # UI 基礎組件
│   │   ├── MindMap.tsx           # 心智圖組件
│   │   ├── BlockRenderer.tsx     # 內容區塊渲染
│   │   └── LoadingStates.tsx     # 載入狀態組件
│   ├── lib/                      # 工具函數
│   ├── public/                   # 靜態資源
│   ├── package.json             # 前端依賴
│   └── tailwind.config.js       # Tailwind 配置
└── .amazonq/                     # Amazon Q 規則配置
    └── rules/                   # 開發規則
        ├── RAG.md              # RAG 系統規則
        ├── rules.md            # 通用開發規則
        └── Smart_Meeting_Notes_Assistant.md
```

## 🔧 環境變數配置

在 `backend/.env` 文件中配置以下變數：

```env
# === AI 服務配置 ===
# Google Gemini API (必需)
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama 本地 LLM (可選)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# === 數據庫配置 ===
# Supabase 向量數據庫 (RAG 功能)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# === 服務配置 ===
# 跨域設置
CORS_ORIGINS=http://localhost:3000

# 文件上傳限制
MAX_FILE_SIZE=100MB

# === 功能開關 ===
# 啟用/禁用特定功能
ENABLE_RAG=true
ENABLE_POSTER_GENERATOR=true
ENABLE_INVOICE_MANAGER=true
```

## 🎨 功能特色

### 會議筆記系統
- **🎯 智能分析**: 自動提取會議要點、決策和行動項目
- **🎨 視覺化**: 美觀的 Notion 風格內容呈現
- **🧠 心智圖**: 自動生成互動式心智圖
- **🏷️ 標籤系統**: 自動標籤 + 自定義標籤
- **🎨 顏色分類**: 8 種顏色主題分類
- **⭐ 收藏功能**: 重要筆記收藏管理
- **🔍 全文搜索**: 快速查找筆記內容
- **📤 匯出功能**: Markdown 格式匯出
- **💾 持久化**: 重啟後數據不丟失

### 用戶體驗
- **📱 響應式設計**: 適配各種設備
- **🎭 現代 UI**: 玻璃擬態效果和漸變背景
- **⚡ 實時反饋**: 處理進度和狀態顯示
- **🔄 自動重試**: 網路異常自動恢復
- **🎵 音頻波形**: 視覺化音頻處理過程
- **🧭 智能導航**: 便捷的頁面間跳轉

### 技術亮點
- **🚀 Next.js 15**: 最新 App Router 架構
- **🤖 AI 驅動**: Google Gemini 2.5 Flash
- **📊 向量檢索**: 高效的 RAG 實現
- **🔧 模組化**: 可擴展的組件架構
- **💨 高性能**: 優化的載入和渲染
- **🛡️ 類型安全**: 完整的 TypeScript 支持

## 📋 API 文檔

### 會議筆記 API
```http
# 上傳音頻文件
POST /api/v1/notes
Content-Type: multipart/form-data

# 獲取處理狀態
GET /api/v1/notes/{task_id}

# 獲取筆記列表
GET /api/v1/notes-list

# 搜索筆記
GET /api/v1/notes/search?q={query}&tags={tags}&color={color}

# 更新筆記屬性
PUT /api/v1/notes/{task_id}/properties

# 生成心智圖
POST /api/v1/notes/{task_id}/mindmap

# 刪除筆記
DELETE /api/v1/notes/{task_id}
```

### 海報生成 API
```http
# 生成海報
POST /api/v1/poster/generate

# 獲取生成狀態
GET /api/v1/poster/{task_id}/status

# 下載海報
GET /api/v1/poster/{task_id}/download
```

### 發票管理 API
```http
# 上傳發票
POST /api/v1/invoice/upload

# 獲取發票列表
GET /api/v1/invoice/list

# OCR 識別
POST /api/v1/invoice/ocr
```

### RAG 問答 API
```http
# 上傳文檔
POST /api/v1/documents/upload

# 問答查詢
POST /api/v1/documents/query

# 獲取文檔列表
GET /api/v1/documents/list
```

**完整 API 文檔**: http://localhost:8000/docs

## 🧪 開發與測試

### 開發模式
```bash
# 後端熱重載
cd backend
uvicorn app.main:app --reload

# 前端開發服務器
cd frontend
npm run dev
```

### 代碼檢查
```bash
# Python 代碼格式化
cd backend
black .
flake8 .

# TypeScript 類型檢查
cd frontend
npm run type-check
npm run lint
```

### 構建部署
```bash
# 前端構建
cd frontend
npm run build

# 後端容器化
cd backend
docker build -t ai-tools-backend .
```

## 🤝 開發規範

### 代碼風格
- **Python**: 遵循 PEP 8，使用 Black 格式化
- **TypeScript**: 使用 ESLint + Prettier
- **註解**: 繁體中文註解說明函數用途和邏輯
- **命名**: 使用有意義的變數和函數名稱

### 提交規範
```bash
feat: 新增功能
fix: 修復錯誤  
docs: 文檔更新
style: 代碼格式
refactor: 重構代碼
test: 測試相關
chore: 構建工具
```

### 分支策略
- `main`: 穩定版本
- `develop`: 開發分支
- `feature/*`: 功能開發
- `hotfix/*`: 緊急修復

## 🚀 部署指南

### 本地部署
1. 確保所有依賴已安裝
2. 配置環境變數
3. 啟動後端和前端服務
4. 訪問 http://localhost:3000

### 生產部署
```bash
# 前端構建
npm run build
npm start

# 後端部署
gunicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker 部署
```dockerfile
# 使用 Docker Compose
docker-compose up -d
```

## 🔧 故障排除

### 常見問題
1. **API 連接失敗**: 檢查後端服務是否啟動
2. **文件上傳失敗**: 確認文件大小和格式
3. **心智圖不顯示**: 檢查 Gemini API 配置
4. **筆記丟失**: 確認 notes_storage 目錄權限

### 日誌查看
```bash
# 後端日誌
tail -f backend/logs/app.log

# 前端日誌
npm run dev # 查看控制台輸出
```

## 📞 支持與貢獻

### 問題回報
- 🐛 Bug 回報: 提供詳細的重現步驟
- 💡 功能建議: 描述期望的功能和使用場景
- 📚 文檔改進: 指出不清楚或錯誤的部分

### 貢獻指南
1. Fork 專案
2. 創建功能分支
3. 提交變更
4. 發起 Pull Request

## 📄 授權信息

本專案採用 MIT 授權條款，詳見 LICENSE 文件。

## 🙏 致謝

感謝以下技術和服務：
- Google Gemini AI
- Next.js 團隊
- FastAPI 框架
- Tailwind CSS
- React Flow
- Supabase

---

**⚠️ 重要提醒**: 
- 請勿將 API 密鑰提交到版本控制
- 定期備份重要的筆記數據
- 生產環境請使用 HTTPS
- 建議定期更新依賴包