# AI Tools 專案技術文檔總覽

## 📋 專案概述

本專案是一個綜合性的 AI 工具集合，包含五個核心應用程式，每個都專注於不同的 AI 應用領域。所有工具都採用現代化的技術棧，並遵循統一的架構設計原則。

## 🏗️ 整體架構

### 技術棧統一性
- **前端框架**: Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui
- **後端框架**: Python FastAPI
- **AI 服務**: Google Gemini API 系列
- **開發模式**: 前後端分離，RESTful API 設計
- **部署方式**: 本地開發 + 雲端部署支援

### 專案結構
```
AI Tools/
├── backend/                    # 共享後端服務
├── frontend/                   # 共享前端組件
├── AI Invoice Manager/         # 智能發票管理系統
├── docs/                       # 技術文檔目錄
├── .amazonq/                   # Amazon Q 規則配置
├── *.md                       # 各種技術文檔
└── 各工具獨立目錄
```

## 🛠️ 核心工具清單

### 1. [AI Smart Meeting Notes Assistant](./docs/01_AI_Smart_Meeting_Notes_Assistant.md)
**智能會議筆記助手**
- **核心功能**: 音頻轉文字、AI 分析摘要、結構化筆記生成、心智圖視覺化
- **技術亮點**: Gemini 2.5 Flash 直接音頻理解、動態內容結構、繁體中文優化
- **應用場景**: 會議記錄、講座筆記、訪談整理、學術研究

### 2. [AI Icon & Illustration Generator](./docs/02_AI_Icon_Illustration_Generator.md)
**AI 圖標與插畫生成器**
- **核心功能**: 引導式創意輸入、AI 提示詞增強、高品質圖像生成、多樣化風格
- **技術亮點**: 隱藏提示詞複雜性、工作流程導向設計、透明背景處理
- **應用場景**: UI/UX 設計、簡報製作、品牌設計、創意項目

### 3. [Interactive Document Knowledge Base (RAG)](./docs/03_Interactive_Document_Knowledge_Base.md)
**互動式文檔知識庫**
- **核心功能**: 多文檔問答、智能摘要、測驗生成、來源引用
- **技術亮點**: 完整 RAG 管道、LangChain 框架、ChromaDB 向量存儲
- **應用場景**: 企業知識管理、學術研究、法律文檔分析、技術文檔查詢

### 4. [AI Invoice Manager](./docs/04_AI_Invoice_Manager.md)
**智能發票管理系統**
- **核心功能**: OCR 識別、AI 資訊提取、自動分類、報銷管理、稅務報表
- **技術亮點**: Google Vision + Gemini 雙 AI 引擎、自動化流程、合規管理
- **應用場景**: 企業財務管理、個人記帳、稅務申報、費用控制

### 5. [AI Poster Generation System](./docs/05_AI_Poster_Generation_System.md)
**AI 智能海報生成系統**
- **核心功能**: 智能提示詞引擎、概念轉化、風格解構、迭代優化
- **技術亮點**: 七層提示詞架構、風格配方系統、機率性選擇機制
- **應用場景**: 市場營銷、活動宣傳、品牌設計、創意廣告

## 🔧 共享基礎設施

### 環境配置
```env
# Google AI 服務
GEMINI_API_KEY=your_gemini_api_key_here

# 資料庫配置
DATABASE_URL=sqlite:///./database/app.db

# 應用配置
SECRET_KEY=your_secret_key_here
UPLOAD_DIR=./uploads
```

### 共享服務模組
- **Token 使用追蹤**: 統一的 API 使用量監控和成本控制
- **檔案上傳處理**: 標準化的檔案處理和驗證流程
- **錯誤處理**: 統一的錯誤處理和日誌記錄機制
- **安全認證**: JWT 基礎的用戶認證和授權系統

### 通用工具類
```python
# 使用量追蹤服務
class UsageTracker:
    @staticmethod
    def extract_token_usage_from_response(response, input_type: str) -> TokenUsage
    
    @staticmethod
    def create_usage_report(task_id: str, service_type: str, token_usage: TokenUsage) -> UsageReport

# Token 服務管理
class TokenService:
    def record_usage(self, service_name: str, input_tokens: int, output_tokens: int)
    
    def get_usage_stats(self, service_name: str = None) -> Dict[str, Any]

# 檔案處理工具
class FileHandler:
    @staticmethod
    def validate_file(file_path: str, allowed_extensions: List[str]) -> bool
    
    @staticmethod
    def save_uploaded_file(file, upload_dir: str) -> str
```

## 📊 統一數據模型

### 基礎模型
```python
# Token 使用量模型
class TokenUsage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    audio_input_tokens: int = 0
    total_tokens: int = 0

# 使用報告模型
class UsageReport(BaseModel):
    task_id: str
    service_type: str
    token_usage: TokenUsage
    estimated_cost: float
    timestamp: datetime

# 處理結果基礎模型
class ProcessingResult(BaseModel):
    task_id: str
    status: str
    processing_time: float
    created_at: datetime
```

## 📊 開發與部署指南

### 快速啟動
```bash
# 1. 克隆專案
git clone <repository-url>
cd AI Tools

# 2. 設置後端
cd backend
pip install -r requirements.txt
cp .env.example .env
# 編輯 .env 文件，添加必要的 API 金鑰

# 3. 設置前端
cd ../frontend
npm install

# 4. 啟動服務
# 後端 (在 backend 目錄)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端 (在 frontend 目錄)
npm run dev
```

### 開發規範
- **代碼註解**: 所有代碼必須包含繁體中文註解，說明函數用途和複雜邏輯
- **提交規範**: 遵循 Conventional Commits 標準
- **測試要求**: 每個功能模組都需要對應的單元測試和整合測試
- **文檔更新**: 功能變更時同步更新技術文檔

### 代碼品質標準
```python
# 範例：符合規範的函數註解
async def process_audio_with_gemini(
    audio_file_path: str, 
    task_id: str, 
    anonymize: bool = False
) -> NoteResult:
    """
    使用 Gemini 2.5 Flash 處理音頻檔案並返回結構化結果
    
    Args:
        audio_file_path: 音頻檔案的完整路徑
        task_id: 唯一的任務識別碼
        anonymize: 是否啟用去識別化處理
    
    Returns:
        NoteResult: 包含結構化筆記內容和元數據的結果對象
    
    Raises:
        ValueError: 當音頻檔案處理失敗時
        APIError: 當 Gemini API 調用失敗時
    """
```

## 🔒 安全與合規

### 數據安全
- **API 金鑰管理**: 所有敏感資訊通過環境變數管理，絕不硬編碼
- **檔案上傳安全**: 嚴格的檔案類型驗證和大小限制
- **數據加密**: 敏感數據的傳輸和存儲加密
- **去識別化**: 可選的個人資訊匿名化處理

### 隱私保護
```python
# 去識別化服務範例
class AnonymizerService:
    def anonymize_text(self, text: str) -> Tuple[str, Dict[str, List[str]]]:
        """
        自動識別並匿名化文本中的敏感資訊
        
        支援的敏感資訊類型：
        - 人名、電話號碼、電子郵件
        - 身分證號、地址資訊
        - 銀行帳號、信用卡號
        """
```

## 📈 監控與維護

### 系統監控
- **API 使用量監控**: 實時追蹤各服務的 API 調用次數和成本
- **性能監控**: 響應時間、錯誤率、系統資源使用情況
- **用戶行為分析**: 功能使用頻率、用戶滿意度調查
- **安全監控**: 異常訪問檢測、潛在安全威脅識別

### 維護任務
```python
# 定期維護任務範例
class MaintenanceTasks:
    def cleanup_temp_files(self, days_old: int = 7):
        """清理超過指定天數的暫存檔案"""
        
    def backup_important_data(self):
        """備份重要的用戶數據和配置"""
        
    def update_usage_statistics(self):
        """更新使用統計和成本分析"""
        
    def check_system_health(self) -> HealthReport:
        """檢查系統各組件的健康狀態"""
```

## 🧪 測試策略

### 測試層級
1. **單元測試**: 個別函數和類別的功能測試
2. **整合測試**: 模組間的協作測試
3. **端到端測試**: 完整用戶流程的測試
4. **性能測試**: 負載和壓力測試
5. **安全測試**: 漏洞掃描和滲透測試

### 測試工具
```bash
# Python 後端測試
pytest tests/ -v --cov=app

# JavaScript 前端測試
npm test

# API 測試
newman run api-tests.postman_collection.json
```

## 🔮 未來發展規劃

### 短期目標 (3-6個月)
1. **性能優化**: 提升各工具的處理速度和準確性
2. **用戶體驗**: 改善前端界面和交互設計
3. **功能擴展**: 為每個工具添加更多實用功能
4. **多語言支援**: 擴展到英文、日文等其他語言

### 中期目標 (6-12個月)
1. **雲端部署**: 提供 SaaS 版本的服務
2. **企業版功能**: 多用戶管理、權限控制、審計日誌
3. **API 服務**: 為第三方開發者提供 API 接口
4. **行動應用**: 開發 iOS 和 Android 應用程式

### 長期願景 (1-2年)
1. **AI 能力升級**: 整合更先進的 AI 模型和技術
2. **生態系統建設**: 建立開發者社群和插件市場
3. **國際化**: 進軍國際市場，支援更多語言和地區
4. **產業解決方案**: 針對特定行業提供定制化解決方案

## 🔗 相關文檔連結

- [部署指南](./DEPLOYMENT.md)
- [貢獻指南](./CONTRIBUTING.md)
- [RAG 架構說明](./RAG_ARCHITECTURE.md)
- [海報生成框架](./backend/提示詞優化海報生成框架.md)

## 📞 技術支援

### 開發團隊聯繫方式
- **技術負責人**: AI Tools 開發團隊
- **問題回報**: 請使用 GitHub Issues
- **功能建議**: 歡迎提交 Pull Request
- **技術討論**: 加入我們的開發者社群

### 文檔維護
- **最後更新**: 2024年12月
- **文檔版本**: v1.0.0
- **維護週期**: 每月更新一次
- **反饋渠道**: 歡迎提供文檔改進建議

---

**© 2024 AI Tools 開發團隊 - 保留所有權利**