# AI Smart Meeting Notes Assistant 技術文檔

## 📋 專案概述

AI Smart Meeting Notes Assistant 是一個智能會議筆記助手，能將音頻錄音轉換為結構化、易於理解的筆記。該系統採用 Google Gemini 2.5 Flash API 進行直接音頻理解，提供高品質的轉錄和分析服務。

## 🎯 核心功能

### 主要特性
1. **音頻上傳與處理**: 支援 MP3、M4A、WAV 等常見格式
2. **智能語音轉文字**: 使用 Gemini 2.5 Flash 進行高精度轉錄
3. **AI 分析與摘要**: 自動生成會議摘要、關鍵決策和行動項目
4. **結構化筆記生成**: 以豐富的區塊結構呈現分析結果
5. **心智圖視覺化**: 基於討論主題生成互動式心智圖
6. **去識別化處理**: 可選的敏感資訊匿名化功能

### 技術亮點
- **一步式音頻理解**: 直接上傳音頻到 Gemini API，無需預處理
- **動態內容結構**: 根據音頻長度和複雜度調整筆記結構
- **繁體中文優化**: 特別針對繁體中文輸出進行優化
- **Token 使用追蹤**: 完整的 API 使用量監控和成本控制

## 🏗️ 系統架構

### 技術棧
```
前端: Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui + React Flow
後端: Python FastAPI + Google Gemini API
存儲: 本地文件系統 + JSON 數據存儲
處理: 異步任務處理 + 實時狀態更新
```

### 核心模組

#### 1. 音頻處理服務 (`gemini_processor.py`)
```python
async def process_audio_with_gemini(
    audio_file_path: str, 
    task_id: str, 
    anonymize: bool = False
) -> NoteResult
```
- **功能**: 使用 Gemini 2.5 Flash 處理音頻檔案
- **輸入**: 音頻檔案路徑、任務 ID、去識別化選項
- **輸出**: 結構化的筆記結果
- **特色**: 支援動態提示詞生成，根據音頻長度調整分析深度

#### 2. 去識別化服務 (`anonymizer_service.py`)
```python
class AnonymizerService:
    def anonymize_text(self, text: str) -> Tuple[str, Dict[str, List[str]]]
```
- **功能**: 自動識別並匿名化敏感資訊
- **支援類型**: 人名、電話、電子郵件、地址、身分證號等
- **處理方式**: 使用正則表達式和 NLP 技術進行識別

#### 3. 使用量追蹤服務 (`usage_tracker.py`)
```python
class UsageTracker:
    @staticmethod
    def extract_token_usage_from_response(response, input_type: str) -> TokenUsage
```
- **功能**: 追蹤 API 使用量和成本
- **監控項目**: 輸入/輸出 Token 數量、音頻處理時間、成本估算
- **報告生成**: 詳細的使用報告和統計分析

#### 4. 心智圖生成服務 (`mindmap_service.py`)
```python
async def generate_mindmap_from_notes(notes_content: List[ContentBlock]) -> ReactFlowMindMap
```
- **功能**: 從筆記內容生成 React Flow 格式的心智圖
- **算法**: 基於內容層次結構和關鍵詞提取
- **輸出**: 可視化的節點和連接關係

## 📊 數據模型

### 核心數據結構

#### ContentBlock (內容區塊)
```python
class ContentBlock(BaseModel):
    type: str  # "heading_2", "bullet_list", "callout", "toggle_list"
    content: Dict[str, Any]
```

#### NoteResult (筆記結果)
```python
class NoteResult(BaseModel):
    content_blocks: List[ContentBlock]
    action_items: List[ActionItem]
    usage_report: UsageReport
    processing_time: float
```

#### ActionItem (行動項目)
```python
class ActionItem(BaseModel):
    task: str
    owner: str
    due_date: str
```

## 🚀 API 端點

### 主要 API 路由

#### 1. 上傳音頻
```http
POST /api/upload-audio
Content-Type: multipart/form-data

{
  "file": <audio_file>,
  "anonymize": false
}
```

#### 2. 獲取處理狀態
```http
GET /api/task/{task_id}
```

#### 3. 獲取筆記結果
```http
GET /api/notes/{task_id}
```

#### 4. 生成心智圖
```http
POST /api/generate-mindmap
Content-Type: application/json

{
  "task_id": "uuid",
  "content_blocks": [...]
}
```

#### 5. 獲取使用統計
```http
GET /api/usage-stats
```

## 🔧 配置與部署

### 環境變數
```env
# Gemini API 配置
GEMINI_API_KEY=your_gemini_api_key_here

# 檔案存儲配置
UPLOAD_DIR=./local_uploads
NOTES_STORAGE_DIR=./notes_storage

# 應用配置
MAX_FILE_SIZE=100MB
SUPPORTED_FORMATS=mp3,m4a,wav,mp4

# 去識別化配置
ENABLE_ANONYMIZATION=true
```

### 部署需求
- **Python**: 3.8+
- **Node.js**: 18+
- **磁盤空間**: 至少 10GB (用於音頻檔案暫存)
- **記憶體**: 建議 4GB+ (處理大型音頻檔案)
- **網路**: 穩定的網際網路連接 (上傳到 Gemini API)

---

**維護者**: AI Tools 開發團隊  
**最後更新**: 2024年12月  
**版本**: v1.0.0