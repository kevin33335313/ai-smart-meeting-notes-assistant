# RAG 架構說明

## 🏗️ 完整RAG架構組件

### 1. 文檔加載器 (Document Loaders)
```python
# 支援多種文件格式
- PyPDFLoader: PDF文件
- TextLoader: 純文本文件  
- UnstructuredWordDocumentLoader: Word文檔
```

### 2. 文本分割器 (Text Splitter)
```python
RecursiveCharacterTextSplitter(
    chunk_size=1000,        # 每個chunk的大小
    chunk_overlap=200,      # chunk之間的重疊
    length_function=len,    # 長度計算函數
)
```

### 3. 嵌入模型 (Embedding Model)
```python
GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",  # Google的嵌入模型
    google_api_key=GEMINI_API_KEY
)
```

### 4. 向量數據庫 (Vector Store)
```python
Chroma(
    persist_directory="./vector_store",  # 持久化存儲
    embedding_function=embeddings       # 嵌入函數
)
```

### 5. 語言模型 (LLM)
```python
ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",  # Google最新模型
    temperature=0.3                # 控制創造性
)
```

### 6. 檢索器 (Retriever)
```python
vector_store.as_retriever(
    search_kwargs={
        "k": 5,                           # 返回top-k結果
        "filter": {"doc_id": doc_ids}     # 文檔過濾
    }
)
```

### 7. QA鏈 (Question-Answering Chain)
```python
RetrievalQA.from_chain_type(
    llm=llm,                    # 語言模型
    chain_type="stuff",         # 鏈類型
    retriever=retriever,        # 檢索器
    return_source_documents=True # 返回來源文檔
)
```

## 🔄 RAG工作流程

### 1. 文檔攝取 (Document Ingestion)
```
文件上傳 → 文檔加載 → 文本分割 → 向量化 → 存儲到向量庫
```

### 2. 查詢處理 (Query Processing)  
```
用戶問題 → 向量化 → 相似性搜索 → 檢索相關文檔 → LLM生成回答
```

### 3. 回答生成 (Answer Generation)
```
檢索到的文檔 + 用戶問題 → 提示工程 → LLM推理 → 結構化回答
```

## 📁 文件結構

```
backend/
├── app/
│   ├── services/
│   │   ├── rag_service.py          # 核心RAG服務
│   │   └── document_processor.py   # 舊版文檔處理器
│   ├── models/
│   │   └── document_qa.py         # 數據模型
│   └── routers/
│       ├── document_qa.py         # API路由
│       └── rag_stats.py          # RAG統計
├── vector_store/                   # ChromaDB向量庫
├── local_uploads/                  # 文件存儲
└── requirements.txt               # 依賴包
```

## 🔧 核心技術棧

### LangChain框架
- **文檔處理**: 統一的文檔加載和處理接口
- **文本分割**: 智能文本切分策略
- **鏈式操作**: 模塊化的處理流程

### 向量數據庫 (ChromaDB)
- **持久化存儲**: 本地文件系統存儲
- **相似性搜索**: 基於餘弦相似度
- **元數據過濾**: 支援複雜查詢條件

### Google Gemini API
- **嵌入模型**: embedding-001
- **語言模型**: gemini-2.0-flash-exp
- **多模態支援**: 文本、圖像處理

## 🎯 RAG優化策略

### 1. 檢索優化
- **混合搜索**: 結合關鍵詞和語義搜索
- **重排序**: 使用交叉編碼器重新排序
- **查詢擴展**: 自動擴展用戶查詢

### 2. 生成優化  
- **提示工程**: 優化系統提示詞
- **上下文管理**: 智能選擇相關文檔
- **回答驗證**: 檢查回答的準確性

### 3. 性能優化
- **批量處理**: 並行處理多個文檔
- **緩存機制**: 緩存常見查詢結果
- **增量更新**: 支援文檔增量添加

## 📊 監控指標

### 檢索質量
- **召回率**: 相關文檔的檢索比例
- **精確率**: 檢索文檔的相關性
- **MRR**: 平均倒數排名

### 生成質量
- **BLEU分數**: 與參考答案的相似度
- **ROUGE分數**: 摘要質量評估
- **用戶滿意度**: 主觀評價指標

## 🚀 擴展方向

### 1. 多模態RAG
- 支援圖像、表格、圖表
- 跨模態檢索和生成

### 2. 實時RAG
- 流式文檔處理
- 增量索引更新

### 3. 個性化RAG
- 用戶偏好學習
- 個性化檢索策略