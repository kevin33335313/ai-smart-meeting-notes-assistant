# AI Smart Meeting Notes Assistant

一個智能會議筆記助手，能將音頻錄音轉換為結構化、易於理解的筆記。

## 🎯 專案概述

這個應用程式將非結構化的音頻錄音（如會議、講座或訪談）轉換為結構化、易於消化且視覺上吸引人的筆記。目標用戶是忙碌的專業人士、學生和研究人員，他們需要節省手動記筆記的時間，並快速掌握音頻內容的核心見解。

## ✨ 核心功能

1. **音頻上傳**: 用戶友好的界面，支援常見音頻格式（MP3、M4A、WAV）
2. **語音轉文字 (STT)**: 高精度的音頻轉錄
3. **AI 分析與摘要**: 處理轉錄文本生成：
   - 簡潔摘要
   - 關鍵決策列表
   - 行動項目表格（任務、負責人、截止日期）
4. **結構化筆記生成**: 以清晰、格式良好的 Markdown 結構呈現分析結果
5. **心智圖視覺化**: 基於討論主題及其關係生成心智圖並視覺化呈現

## 🛠 技術棧

### 前端
- **框架**: Next.js 15 with TypeScript
- **樣式**: Tailwind CSS + Shadcn/ui
- **視覺化**: React Flow (心智圖)

### 後端
- **框架**: Python FastAPI
- **AI 處理**: Google Gemini 2.5 Flash API
- **備用方案**: Ollama (llama3.1:8b)

### 開發環境
- **存儲**: 本地文件系統 (`./backend/local_uploads`)
- **執行**: `npm run dev` (前端) + `uvicorn` (後端)

## 🚀 快速開始

### 前置需求
- Node.js 18+
- Python 3.8+
- Google Gemini API Key

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/ai-smart-meeting-notes-assistant.git
   cd ai-smart-meeting-notes-assistant
   ```

2. **設置後端**
   ```bash
   cd backend
   pip install -r requirements.txt
   
   # 複製環境變數範例文件
   cp .env.example .env
   # 編輯 .env 文件，添加你的 Gemini API Key
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
AI Smart Meeting Notes Assistant/
├── backend/                    # Python FastAPI 後端
│   ├── app/
│   │   ├── models/            # 數據模型
│   │   ├── services/          # 業務邏輯服務
│   │   └── main.py           # FastAPI 應用入口
│   ├── local_uploads/        # 臨時音頻文件存儲
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
# Gemini API 配置
GEMINI_API_KEY=your_gemini_api_key_here

# 可選：Ollama 配置（備用方案）
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

## 🤝 協作開發

### 分支策略
- `main`: 主分支，穩定版本
- `develop`: 開發分支
- `feature/*`: 功能分支
- `bugfix/*`: 錯誤修復分支

### 提交規範
使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
feat: 添加新功能
fix: 修復錯誤
docs: 更新文檔
style: 代碼格式調整
refactor: 重構代碼
test: 添加測試
chore: 構建過程或輔助工具的變動
```

### 開發流程
1. 從 `develop` 分支創建功能分支
2. 完成開發並測試
3. 提交 Pull Request 到 `develop`
4. 代碼審查通過後合併
5. 定期將 `develop` 合併到 `main`

## 📋 API 文檔

### 主要端點

- `POST /api/upload-audio`: 上傳音頻文件
- `GET /api/task/{task_id}`: 獲取處理狀態
- `GET /api/notes/{task_id}`: 獲取生成的筆記
- `POST /api/generate-mindmap`: 生成心智圖

詳細 API 文檔請訪問: http://localhost:8000/docs

## 🧪 測試

```bash
# 後端測試
cd backend
pytest

# 前端測試
cd frontend
npm test
```

## 📝 程式碼註解規範

所有生成的 Python 和 TypeScript/TSX 代碼必須包含繁體中文註解，說明函數用途、複雜邏輯和類型定義。

## 🐛 問題回報

請使用 GitHub Issues 回報問題，並提供：
- 問題描述
- 重現步驟
- 預期行為
- 實際行為
- 環境信息

## 📄 授權

MIT License

## 👥 貢獻者

感謝所有為這個專案做出貢獻的開發者！

---

**注意**: 請確保在提交代碼前已正確配置 `.env` 文件，並且不要將 API 密鑰提交到版本控制系統中。