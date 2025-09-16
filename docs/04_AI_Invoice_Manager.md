# AI Invoice Manager 技術文檔

## 📋 專案概述

AI Invoice Manager 是一個基於 AI 的智能發票與收據管理系統，旨在幫助企業自動化處理報銷流程。系統結合 OCR 技術和 AI 分析，能夠自動提取發票資訊、分類費用類型，並產生標準化的報銷單據。

## 🎯 核心功能

### 主要特性
1. **智能 OCR 識別**: 使用 Google Vision API 進行高精度文字識別
2. **AI 資訊提取**: 使用 Gemini API 智能提取和結構化發票資訊
3. **自動分類歸檔**: AI 判斷費用類別，自動產生報銷分類
4. **報銷流程管理**: 完整的審核流程與狀態追蹤
5. **稅務報表生成**: 自動計算稅額，產生申報表格
6. **數據分析視覺化**: 費用統計與預算控制圖表

### 業務價值
- **效率提升**: 減少 90% 的手動資料輸入時間
- **準確性保證**: AI 驗證確保資料準確性
- **合規管理**: 自動化稅務合規檢查
- **成本控制**: 即時費用分析和預算監控

## 🏗️ 系統架構

### 技術棧
```
前端: Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui + Recharts
後端: Python FastAPI + SQLAlchemy
AI 服務: Google Vision API + Google Gemini API
資料庫: SQLite (開發) / PostgreSQL (生產)
檔案存儲: 本地文件系統 / 雲端存儲
```

### 核心模組

#### 1. OCR 處理服務 (`ocr_service.py`)
```python
class OCRService:
    def __init__(self):
        self.vision_client = vision.ImageAnnotatorClient()
    
    async def extract_text_from_image(
        self, 
        image_path: str
    ) -> OCRResult:
        # 使用 Google Vision API 提取文字
        pass
    
    def preprocess_image(self, image_path: str) -> str:
        # 圖像預處理：去噪、增強對比度、旋轉校正
        pass
```

#### 2. 發票分析服務 (`invoice_analyzer.py`)
```python
class InvoiceAnalyzer:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.1
        )
    
    async def analyze_invoice_text(
        self, 
        ocr_text: str, 
        image_path: str
    ) -> InvoiceData:
        # 使用 Gemini 分析和結構化發票資訊
        pass
    
    def validate_invoice_data(self, data: InvoiceData) -> ValidationResult:
        # 驗證提取的發票資料
        pass
```

#### 3. 費用分類服務 (`expense_classifier.py`)
```python
class ExpenseClassifier:
    EXPENSE_CATEGORIES = {
        "餐飲": ["餐廳", "咖啡", "便當", "飲料"],
        "交通": ["計程車", "捷運", "公車", "停車"],
        "辦公用品": ["文具", "紙張", "墨水", "設備"],
        "差旅": ["飯店", "機票", "住宿", "旅遊"],
        "通訊": ["電話", "網路", "郵寄", "快遞"]
    }
    
    def classify_expense(self, invoice_data: InvoiceData) -> ExpenseCategory:
        # 基於商家名稱和商品描述分類費用
        pass
```

#### 4. 報銷管理服務 (`reimbursement_service.py`)
```python
class ReimbursementService:
    def create_reimbursement_request(
        self, 
        invoices: List[InvoiceData]
    ) -> ReimbursementRequest:
        # 創建報銷申請
        pass
    
    def calculate_tax_deduction(self, invoice: InvoiceData) -> TaxCalculation:
        # 計算稅務扣除額
        pass
    
    def generate_expense_report(
        self, 
        period: DateRange
    ) -> ExpenseReport:
        # 生成費用報表
        pass
```

## 📊 數據模型

### 核心數據結構

#### InvoiceData (發票資料)
```python
class InvoiceData(BaseModel):
    invoice_number: str         # 發票號碼
    date: datetime             # 發票日期
    vendor_name: str           # 商家名稱
    vendor_tax_id: str         # 商家統編
    total_amount: Decimal      # 總金額
    tax_amount: Decimal        # 稅額
    items: List[InvoiceItem]   # 商品項目
    category: ExpenseCategory  # 費用分類
    payment_method: str        # 付款方式
    currency: str              # 幣別
```

#### InvoiceItem (發票項目)
```python
class InvoiceItem(BaseModel):
    description: str           # 商品描述
    quantity: int             # 數量
    unit_price: Decimal       # 單價
    amount: Decimal           # 小計
    tax_rate: float           # 稅率
```

#### ReimbursementRequest (報銷申請)
```python
class ReimbursementRequest(BaseModel):
    request_id: str           # 申請編號
    employee_id: str          # 員工編號
    department: str           # 部門
    invoices: List[InvoiceData] # 發票列表
    total_amount: Decimal     # 總金額
    status: ReimbursementStatus # 狀態
    submitted_date: datetime  # 提交日期
    approved_date: Optional[datetime] # 核准日期
    notes: str               # 備註
```

#### ExpenseReport (費用報表)
```python
class ExpenseReport(BaseModel):
    period: DateRange         # 報表期間
    total_expenses: Decimal   # 總費用
    category_breakdown: Dict[str, Decimal] # 分類明細
    tax_summary: TaxSummary   # 稅務摘要
    top_vendors: List[VendorSummary] # 主要供應商
    monthly_trend: List[MonthlyExpense] # 月度趨勢
```

## 🔄 處理流程

### 發票處理工作流程
```mermaid
graph TD
    A[上傳發票圖片] --> B[圖像預處理]
    B --> C[OCR 文字識別]
    C --> D[AI 資訊提取]
    D --> E[資料驗證]
    E --> F{驗證通過?}
    F -->|是| G[費用分類]
    F -->|否| H[人工審核]
    G --> I[保存到資料庫]
    H --> I
    I --> J[生成報銷單據]
    J --> K[提交審核流程]
```

### AI 資訊提取策略

#### 結構化提示詞設計
```python
INVOICE_EXTRACTION_PROMPT = """
請分析以下發票 OCR 文字，提取結構化資訊：

OCR 文字：
{ocr_text}

請以 JSON 格式返回以下資訊：
{{
  "invoice_number": "發票號碼",
  "date": "YYYY-MM-DD",
  "vendor_name": "商家名稱",
  "vendor_tax_id": "統一編號",
  "total_amount": 總金額數字,
  "tax_amount": 稅額數字,
  "items": [
    {{
      "description": "商品描述",
      "quantity": 數量,
      "unit_price": 單價,
      "amount": 小計
    }}
  ],
  "payment_method": "付款方式"
}}

注意事項：
1. 金額請提取純數字，不包含貨幣符號
2. 日期格式統一為 YYYY-MM-DD
3. 如果某項資訊無法識別，請填入 null
"""
```

#### 多階段驗證機制
```python
class InvoiceValidator:
    def validate_basic_info(self, data: InvoiceData) -> List[ValidationError]:
        errors = []
        
        # 檢查必填欄位
        if not data.invoice_number:
            errors.append(ValidationError("發票號碼不能為空"))
        
        # 檢查金額邏輯
        if data.total_amount <= 0:
            errors.append(ValidationError("總金額必須大於零"))
        
        # 檢查稅額計算
        calculated_tax = data.total_amount * 0.05
        if abs(data.tax_amount - calculated_tax) > 1:
            errors.append(ValidationError("稅額計算可能有誤"))
        
        return errors
    
    def validate_business_rules(self, data: InvoiceData) -> List[ValidationError]:
        # 業務規則驗證
        pass
```

## 🚀 API 端點

### 主要 API 路由

#### 1. 上傳發票
```http
POST /api/invoices/upload
Content-Type: multipart/form-data

{
  "file": <image_file>,
  "employee_id": "EMP001",
  "department": "IT",
  "notes": "出差餐費"
}
```

#### 2. 獲取發票列表
```http
GET /api/invoices
Query Parameters:
- page: 頁碼
- limit: 每頁數量
- category: 費用分類
- date_from: 開始日期
- date_to: 結束日期
- status: 狀態
```

#### 3. 獲取發票詳情
```http
GET /api/invoices/{invoice_id}
```

#### 4. 更新發票資訊
```http
PUT /api/invoices/{invoice_id}
Content-Type: application/json

{
  "vendor_name": "更新的商家名稱",
  "category": "餐飲",
  "notes": "更新的備註"
}
```

#### 5. 創建報銷申請
```http
POST /api/reimbursements
Content-Type: application/json

{
  "employee_id": "EMP001",
  "invoice_ids": ["inv1", "inv2", "inv3"],
  "notes": "12月份出差費用"
}
```

#### 6. 生成費用報表
```http
POST /api/reports/expense
Content-Type: application/json

{
  "period": {
    "start_date": "2024-01-01",
    "end_date": "2024-12-31"
  },
  "group_by": "category",
  "include_tax_summary": true
}
```

#### 7. 獲取統計數據
```http
GET /api/analytics/dashboard
Query Parameters:
- period: 統計期間 (month/quarter/year)
- department: 部門篩選
```

## 🔧 配置與部署

### 環境變數
```env
# Google Cloud API 配置
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
GEMINI_API_KEY=your_gemini_api_key

# 資料庫配置
DATABASE_URL=sqlite:///./database/invoices.db
# DATABASE_URL=postgresql://user:password@localhost/invoices

# 檔案存儲配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf

# 應用配置
SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# OCR 配置
OCR_CONFIDENCE_THRESHOLD=0.8
IMAGE_PREPROCESSING=true

# 稅務配置
DEFAULT_TAX_RATE=0.05
CURRENCY=TWD
```

### 資料庫設計

#### 主要資料表
```sql
-- 發票主表
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE,
    date DATE NOT NULL,
    vendor_name VARCHAR(200),
    vendor_tax_id VARCHAR(20),
    total_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    category VARCHAR(50),
    employee_id VARCHAR(20),
    department VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 發票項目表
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id),
    description TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 報銷申請表
CREATE TABLE reimbursement_requests (
    id UUID PRIMARY KEY,
    employee_id VARCHAR(20),
    department VARCHAR(50),
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'submitted',
    submitted_date TIMESTAMP,
    approved_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 報銷申請與發票關聯表
CREATE TABLE reimbursement_invoices (
    reimbursement_id UUID REFERENCES reimbursement_requests(id),
    invoice_id UUID REFERENCES invoices(id),
    PRIMARY KEY (reimbursement_id, invoice_id)
);
```

### 部署需求
- **Python**: 3.8+
- **Node.js**: 18+
- **資料庫**: SQLite 3.0+ / PostgreSQL 12+
- **磁盤空間**: 至少 20GB (用於圖片存儲)
- **記憶體**: 建議 8GB+ (圖像處理和 AI 分析)
- **網路**: 穩定的網際網路連接 (Google APIs)

## 📈 監控與分析

### 業務指標監控
```python
class BusinessMetrics:
    def calculate_processing_accuracy(self) -> float:
        # 計算 OCR 和 AI 提取的準確率
        pass
    
    def measure_processing_time(self) -> Dict[str, float]:
        # 測量各階段處理時間
        return {
            "ocr_time": 2.5,
            "ai_extraction_time": 1.8,
            "validation_time": 0.3,
            "total_time": 4.6
        }
    
    def analyze_cost_savings(self) -> CostAnalysis:
        # 分析自動化帶來的成本節省
        pass
```

### 品質控制
```python
class QualityControl:
    def audit_extraction_accuracy(self, sample_size: int = 100):
        # 隨機抽樣驗證提取準確性
        pass
    
    def detect_anomalies(self, invoices: List[InvoiceData]) -> List[Anomaly]:
        # 檢測異常發票（金額、日期、供應商等）
        pass
    
    def generate_quality_report(self) -> QualityReport:
        # 生成品質報告
        pass
```

## 🧪 測試策略

### 功能測試
- OCR 文字識別準確性測試
- AI 資訊提取準確性測試
- 費用分類準確性測試
- 報銷流程完整性測試

### 性能測試
- 大量發票並發處理測試
- 圖像處理性能測試
- 資料庫查詢效率測試
- API 響應時間測試

### 整合測試
- Google APIs 整合測試
- 前後端數據傳輸測試
- 完整業務流程測試

## 🔮 未來發展

### 短期目標
1. **行動應用**: 開發手機 App 支援即時拍照上傳
2. **批量處理**: 支援一次上傳多張發票圖片
3. **智能審核**: AI 輔助的異常檢測和審核建議

### 長期規劃
1. **電子發票整合**: 直接對接電子發票系統
2. **ERP 整合**: 與企業 ERP 系統深度整合
3. **預算管理**: 智能預算控制和預警系統

### 企業級功能
1. **多公司支援**: 支援集團企業的多公司管理
2. **權限管理**: 細粒度的角色權限控制
3. **審計追蹤**: 完整的操作日誌和審計功能

---

**維護者**: AI Tools 開發團隊  
**最後更新**: 2024年12月  
**版本**: v1.0.0