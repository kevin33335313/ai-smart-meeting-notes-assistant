# AI 智能發票與收據管理系統

一個基於 AI 的智能發票與收據管理系統，幫助企業自動化處理報銷流程。

## 🎯 專案概述

這個應用程式將紙本發票和收據轉換為數位化、結構化的資料，大幅簡化企業的報銷和會計流程。透過 OCR 技術和 AI 分析，自動提取發票資訊、分類費用類型，並產生標準化的報銷單據。

## ✨ 核心功能

1. **智能 OCR 識別**: 拍照上傳發票，自動提取關鍵資訊
2. **自動分類歸檔**: AI 判斷費用類別，自動產生報銷單
3. **報銷流程管理**: 完整的審核流程與狀態追蹤
4. **稅務報表生成**: 自動計算稅額，產生申報表格
5. **數據分析視覺化**: 費用統計與預算控制圖表

## 🛠 技術棧

### 前端
- **框架**: Next.js 15 with TypeScript
- **樣式**: Tailwind CSS + Shadcn/ui
- **圖表**: Recharts
- **相機**: React Camera Pro

### 後端
- **框架**: Python FastAPI
- **OCR**: Google Vision API
- **AI 分析**: Google Gemini 2.5 Flash API
- **資料庫**: SQLite (開發) / PostgreSQL (生產)

### 開發環境
- **存儲**: 本地文件系統 (`./backend/uploads`)
- **執行**: `npm run dev` (前端) + `uvicorn` (後端)

## 🚀 快速開始

### 前置需求
- Node.js 18+
- Python 3.8+
- Google Cloud API Key (Vision + Gemini)

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/ai-invoice-manager.git
   cd ai-invoice-manager
   ```

2. **設置後端**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # 複製環境變數範例文件
   cp .env.example .env
   # 編輯 .env 文件，添加你的 API Keys
   ```

3. **設置前端**
   ```bash
   cd ../frontend
   npm install
   ```

4. **啟動開發服務器**
   
   **後端** (在 `backend` 目錄):
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   **前端** (在 `frontend` 目錄):
   ```bash
   npm run dev
   ```

5. **訪問應用**
   - 前端: http://localhost:3000
   - 後端 API: http://localhost:8000
   - API 文檔: http://localhost:8000/docs

## 📁 專案結構

```
AI Invoice Manager/
├── backend/                    # Python FastAPI 後端
│   ├── app/
│   │   ├── models/            # 資料模型
│   │   ├── services/          # 業務邏輯服務
│   │   ├── api/              # API 路由
│   │   └── main.py           # FastAPI 應用入口
│   ├── uploads/              # 發票圖片存儲
│   ├── database/             # SQLite 資料庫
│   ├── .env.example         # 環境變數範例
│   └── requirements.txt     # Python 依賴
├── frontend/                  # Next.js 前端
│   ├── app/                  # App Router 頁面
│   ├── components/           # React 組件
│   ├── lib/                  # 工具函數和類型
│   └── public/              # 靜態資源
└── .amazonq/                # Amazon Q 規則配置
```

## 🔧 環境變數配置

在 `backend/.env` 文件中配置以下變數：

```env
# Google Cloud API 配置
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# 資料庫配置
DATABASE_URL=sqlite:///./database/invoices.db

# 應用配置
SECRET_KEY=your_secret_key_here
UPLOAD_DIR=./uploads
```

## 📋 API 文檔

### 主要端點

- `POST /api/upload-invoice`: 上傳發票圖片
- `GET /api/invoices`: 獲取發票列表
- `GET /api/invoice/{invoice_id}`: 獲取特定發票詳情
- `PUT /api/invoice/{invoice_id}`: 更新發票資訊
- `POST /api/generate-report`: 生成費用報表
- `GET /api/categories`: 獲取費用分類

詳細 API 文檔請訪問: http://localhost:8000/docs

## 🎯 MVP 功能清單

- [x] 專案架構設計
- [ ] 發票圖片上傳功能
- [ ] OCR 文字識別
- [ ] AI 資訊提取與分類
- [ ] 發票資料管理
- [ ] 基礎報表生成
- [ ] 用戶界面設計

## 📝 程式碼註解規範

所有生成的 Python 和 TypeScript/TSX 代碼必須包含繁體中文註解，說明函數用途、複雜邏輯和類型定義。

## 📄 授權

MIT License

---

**注意**: 請確保在提交代碼前已正確配置 `.env` 文件，並且不要將 API 密鑰提交到版本控制系統中。