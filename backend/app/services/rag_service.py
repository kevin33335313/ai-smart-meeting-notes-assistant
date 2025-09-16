import os
import uuid
from typing import List, Dict, Any
from pathlib import Path

# LangChain imports
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.document_loaders.word_document import UnstructuredWordDocumentLoader
import logging

# 配置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局變量緩存 embedding 模型
_cached_embeddings = None

class RAGService:
    """完整的RAG服務實現"""
    
    def __init__(self):
        # 驗證API Key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # 使用緩存的 embedding 模型
        global _cached_embeddings
        if _cached_embeddings is None:
            print("Initializing embedding model (first time)...")
            _cached_embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
        else:
            print("Using cached embedding model...")
        self.embeddings = _cached_embeddings
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",  # 使用更穩定的模型
            google_api_key=api_key,
            temperature=0.1,  # 降低溫度提高準確性
            max_tokens=2048
        )
        
        # 針對考古題優化的文本分割器
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,  # 增大chunk size以包含更多上下文
            chunk_overlap=500,  # 增大重疊確保跨頁內容不遺漏
            length_function=len,
            separators=["\n\n\n", "\n\n", "題目", "問題", "。\n", "\n", "。", "！", "？", ";", ":", "，", " ", ""]  # 考古題友好分割
        )
        
        # 向量數據庫路徑
        self.vector_store_path = Path("./vector_store")
        self.vector_store_path.mkdir(exist_ok=True)
        
        # 文件存儲
        self.upload_dir = Path("./local_uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        # 文檔管理 - 持久化存儲
        self.documents: Dict[str, Dict] = {}
        self.doc_metadata_file = self.vector_store_path / "document_metadata.json"
        
        # 會話管理
        self.sessions: Dict[str, Dict] = {}  # session_id -> {"active_docs": [doc_ids], "created_at": timestamp}
        self.session_metadata_file = self.vector_store_path / "session_metadata.json"
        
        # 初始化向量庫
        self.vector_store = None
        self._init_vector_store()
        self._load_document_metadata()
        self._load_session_metadata()
        
        # Token 統計
        self.total_tokens = {"input": 0, "output": 0, "cost": 0.0}
        self._load_token_stats()
        
        print(f"RAG Service ready: {len(self.documents)} docs, {len(self.sessions)} sessions")
    
    def _init_vector_store(self):
        """初始化向量數據庫"""
        try:
            print("Connecting to vector store...")
            self.vector_store = Chroma(
                collection_name="rag_documents",
                persist_directory=str(self.vector_store_path),
                embedding_function=self.embeddings
            )
            count = self.vector_store._collection.count()
            print(f"Vector store ready with {count} vectors")
        except Exception as e:
            print(f"Vector store error: {e}, creating new...")
            self.vector_store = Chroma(
                collection_name="rag_documents",
                persist_directory=str(self.vector_store_path),
                embedding_function=self.embeddings
            )
    
    def _load_document_metadata(self):
        """加載文檔元數據"""
        try:
            if self.doc_metadata_file.exists():
                import json
                with open(self.doc_metadata_file, 'r', encoding='utf-8') as f:
                    self.documents = json.load(f)
                print(f"Loaded metadata for {len(self.documents)} documents")
        except Exception as e:
            print(f"Failed to load document metadata: {e}")
            self.documents = {}
    
    def _save_document_metadata(self):
        """保存文檔元數據"""
        try:
            import json
            with open(self.doc_metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.documents, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save document metadata: {e}")
    
    def _load_session_metadata(self):
        """加載會話元數據"""
        try:
            if self.session_metadata_file.exists():
                import json
                with open(self.session_metadata_file, 'r', encoding='utf-8') as f:
                    self.sessions = json.load(f)
        except Exception as e:
            print(f"Failed to load session metadata: {e}")
            self.sessions = {}
    
    def _save_session_metadata(self):
        """保存會話元數據"""
        try:
            import json
            with open(self.session_metadata_file, 'w', encoding='utf-8') as f:
                json.dump(self.sessions, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save session metadata: {e}")
    
    def _load_token_stats(self):
        """加載 token 統計"""
        try:
            token_file = self.vector_store_path / "token_stats.json"
            if token_file.exists():
                import json
                with open(token_file, 'r', encoding='utf-8') as f:
                    self.total_tokens = json.load(f)
        except Exception as e:
            print(f"Failed to load token stats: {e}")
    
    def _save_token_stats(self):
        """保存 token 統計"""
        try:
            import json
            token_file = self.vector_store_path / "token_stats.json"
            with open(token_file, 'w', encoding='utf-8') as f:
                json.dump(self.total_tokens, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save token stats: {e}")
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """計算 Gemini API 費用"""
        # Gemini 1.5 Pro 價格 (USD per 1M tokens)
        input_price = 1.25 / 1000000  # $1.25 per 1M input tokens
        output_price = 5.00 / 1000000  # $5.00 per 1M output tokens
        return (input_tokens * input_price) + (output_tokens * output_price)
    
    def _update_token_stats(self, input_tokens: int, output_tokens: int):
        """更新 token 統計"""
        cost = self._calculate_cost(input_tokens, output_tokens)
        self.total_tokens["input"] += input_tokens
        self.total_tokens["output"] += output_tokens
        self.total_tokens["cost"] += cost
        self._save_token_stats()
        return cost
    
    def _load_document(self, file_path: str, content_type: str) -> List[Document]:
        """根據文件類型加載文檔"""
        if content_type == "application/pdf":
            loader = PyPDFLoader(file_path)
        elif content_type == "text/plain":
            loader = TextLoader(file_path, encoding='utf-8')
        elif content_type in ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]:
            loader = UnstructuredWordDocumentLoader(file_path)
        else:
            raise ValueError(f"不支援的文件類型: {content_type}")
        
        return loader.load()
    
    async def add_document(self, file_content: bytes, filename: str, content_type: str) -> str:
        """添加文檔到RAG系統"""
        doc_id = str(uuid.uuid4())
        file_path = self.upload_dir / f"{doc_id}_{filename}"
        
        # 保存文件
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # 記錄文檔信息（先設為processing狀態）
        from datetime import datetime
        self.documents[doc_id] = {
            "id": doc_id,
            "filename": filename,
            "content_type": content_type,
            "file_path": str(file_path),
            "status": "processing",
            "upload_time": datetime.now().isoformat()
        }
        
        try:
            # 使用LangChain文檔加載器處理不同文件類型
            documents = self._load_document(str(file_path), content_type)
            
            # 文本分割
            chunks = self.text_splitter.split_documents(documents)
            
            # 為每個chunk添加metadata（保留原有的頁碼信息）
            for i, chunk in enumerate(chunks):
                chunk.metadata.update({
                    "doc_id": doc_id,
                    "filename": filename,
                    "content_type": content_type,
                    "chunk_index": i  # 添加chunk索引
                })
                # 保留原有頁碼或估算頁碼
                if 'page' not in chunk.metadata:
                    if content_type == "application/pdf":
                        # 根據原始文檔頁數估算
                        estimated_page = max(1, i // 3 + 1)  # 每3個chunk約為1頁
                        chunk.metadata['page'] = estimated_page
                    else:
                        chunk.metadata['page'] = 1
            
            # 添加到向量庫並強制持久化
            if chunks:
                # 為每個chunk生成唯一ID
                chunk_ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
                self.vector_store.add_documents(chunks, ids=chunk_ids)
                
                # 新版ChromaDB自動持久化，無需手動persist()
                
                # 驗證添加成功
                total_count = self.vector_store._collection.count()
                print(f"Added {len(chunks)} chunks. Total documents in vector store: {total_count}")
                
                # 測試檢索功能
                test_docs = self.vector_store.similarity_search("test", k=1)
                print(f"Vector store test retrieval returned {len(test_docs)} documents")
            
            # 更新狀態為ready並保存元數據
            self.documents[doc_id]["status"] = "ready"
            self.documents[doc_id]["chunks_count"] = len(chunks)
            self._save_document_metadata()
            return doc_id
            
        except Exception as e:
            print(f"文檔處理錯誤: {e}")
            self.documents[doc_id]["status"] = "error"
            self.documents[doc_id]["error"] = str(e)
            self._save_document_metadata()
            return doc_id
    
    def create_session(self, session_id: str = None) -> str:
        """創建新會話或獲取現有會話"""
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        # 如果會話已存在，直接返回
        if session_id in self.sessions:
            return session_id
            
        from datetime import datetime
        self.sessions[session_id] = {
            "active_docs": [],
            "created_at": datetime.now().isoformat(),
            "name": f"會話 {session_id}"
        }
        self._save_session_metadata()
        return session_id
    
    def add_document_to_session(self, session_id: str, doc_id: str) -> bool:
        """將文檔添加到會話"""
        # 如果會話不存在，自動創建
        if session_id not in self.sessions:
            self.create_session(session_id)
            
        if doc_id not in self.documents:
            return False
        if doc_id not in self.sessions[session_id]["active_docs"]:
            self.sessions[session_id]["active_docs"].append(doc_id)
            self._save_session_metadata()
            print(f"Added document {doc_id} to session {session_id}")
        return True
    
    def remove_document_from_session(self, session_id: str, doc_id: str) -> bool:
        """從會話中移除文檔"""
        if session_id not in self.sessions:
            return False
        if doc_id in self.sessions[session_id]["active_docs"]:
            self.sessions[session_id]["active_docs"].remove(doc_id)
            self._save_session_metadata()
        return True
    
    def get_session_documents(self, session_id: str) -> List[str]:
        """獲取會話中的文檔列表"""
        if session_id not in self.sessions:
            return []
        return self.sessions[session_id]["active_docs"]
    
    def list_sessions(self) -> List[Dict[str, Any]]:
        """列出所有會話"""
        return [
            {
                "id": session_id,
                "name": session_data.get("name", f"會話 {session_id[:8]}"),
                "created_at": session_data.get("created_at"),
                "document_count": len(session_data.get("active_docs", []))
            }
            for session_id, session_data in self.sessions.items()
        ]
    
    async def query_documents(self, question: str, session_id: str = None, k: int = 8) -> Dict[str, Any]:
        """企業級RAG查詢實現"""
        query_id = str(uuid.uuid4())
        timestamp = __import__('datetime').datetime.now().isoformat()
        
        try:
            # 1. 檢查會話和文檔
            active_doc_ids = []
            if session_id:
                active_doc_ids = self.get_session_documents(session_id)
                if not active_doc_ids:
                    return {
                        "id": query_id,
                        "question": question,
                        "answer": "當前會話中沒有文檔。請先選擇要查詢的文檔。",
                        "sources": [],
                        "timestamp": timestamp,
                        "source_documents": []
                    }
            
            # 2. 驗證向量庫狀態
            collection = self.vector_store._collection
            total_docs = collection.count()
            print(f"[Query {query_id[:8]}] Vector store: {total_docs} total, session docs: {len(active_doc_ids)}")
            
            if total_docs == 0:
                return {
                    "id": query_id,
                    "question": question,
                    "answer": "系統中暫無文檔數據。請先上傳相關文件後再進行查詢。",
                    "sources": [],
                    "timestamp": timestamp,
                    "source_documents": []
                }
            
            # 3. 增強型多策略檢索 - 確保覆蓋整個文檔
            doc_filter = {"doc_id": {"$in": active_doc_ids}} if active_doc_ids else None
            
            # 策略1: 相似度搜索（增加檢索數量）
            similarity_docs = self.vector_store.similarity_search(
                question, 
                k=k*2,  # 增加檢索數量
                filter=doc_filter
            )
            
            # 策略2: 關鍵詞搜索（針對考古題）
            keyword_docs = []
            try:
                import re
                keywords = re.findall(r'[\u4e00-\u9fff]+', question)
                if keywords:
                    keyword_query = " ".join(keywords[:3])
                    keyword_docs = self.vector_store.similarity_search(
                        keyword_query,
                        k=k,
                        filter=doc_filter
                    )
                    print(f"[Query {query_id[:8]}] Keyword search with '{keyword_query}' returned {len(keyword_docs)} documents")
            except Exception as e:
                print(f"[Query {query_id[:8]}] Keyword search failed: {e}")
            
            # 策略3: MMR搜索（最大邊際相關性）
            mmr_docs = []
            try:
                mmr_docs = self.vector_store.max_marginal_relevance_search(
                    question,
                    k=k,
                    fetch_k=k*3,  # 增加候選數量
                    filter=doc_filter
                )
                print(f"[Query {query_id[:8]}] MMR search returned {len(mmr_docs)} documents")
            except Exception as e:
                print(f"[Query {query_id[:8]}] MMR search failed: {e}")
            
            # 策略4: 基於相似度分數的搜索（降低閾值以包含更多內容）
            score_docs = []
            try:
                score_docs = self.vector_store.similarity_search_with_score(
                    question,
                    k=k*2,
                    filter=doc_filter
                )
                # 只保留文檔，忽略分數
                score_docs = [doc for doc, score in score_docs]
                print(f"[Query {query_id[:8]}] Score-based search returned {len(score_docs)} documents")
            except Exception as e:
                print(f"[Query {query_id[:8]}] Score-based search failed: {e}")
            
            # 合併並去重（保持更多樣性）
            all_docs = similarity_docs + keyword_docs + mmr_docs + score_docs
            seen_content = set()
            unique_docs = []
            for doc in all_docs:
                content_hash = hash(doc.page_content[:200])  # 增加hash長度提高精確度
                if content_hash not in seen_content:
                    seen_content.add(content_hash)
                    unique_docs.append(doc)
            
            # 按頁碼排序（如果有的話）確保覆蓋文檔各部分
            try:
                unique_docs.sort(key=lambda x: x.metadata.get('page', 0))
            except:
                pass
            
            # 策略5: 全文檔檢索（確保覆蓋整個文檔）
            full_doc_search = []
            try:
                collection = self.vector_store._collection
                for doc_id in active_doc_ids:
                    results = collection.get(
                        where={"doc_id": {"$eq": doc_id}},
                        include=["documents", "metadatas"]
                    )
                    if results['documents']:
                        for content, metadata in zip(results['documents'], results['metadatas']):
                            doc_obj = Document(page_content=content, metadata=metadata)
                            full_doc_search.append(doc_obj)
                print(f"[Query {query_id[:8]}] Full document search returned {len(full_doc_search)} chunks")
            except Exception as e:
                print(f"[Query {query_id[:8]}] Full document search failed: {e}")
            

            
            # 合併所有結果
            all_docs = similarity_docs + keyword_docs + mmr_docs + score_docs + full_doc_search
            
            docs = unique_docs[:k*4]  # 增加保留文檔數量
            print(f"[Query {query_id[:8]}] Retrieved {len(docs)} unique documents from {len(all_docs)} total")
            
            if not docs:
                return {
                    "id": query_id,
                    "question": question,
                    "answer": "在當前文檔中未找到與您問題直接相關的內容。可能的原因：\n1. 題目可能被分割在不同的文本片段中\n2. 問題的表述方式與文檔中的不完全一致\n3. 文檔的OCR識別可能有誤\n\n建議：請嘗試使用題目中的關鍵詞重新提問，或檢查文檔是否完整上傳。",
                    "sources": [],
                    "timestamp": timestamp,
                    "source_documents": []
                }
            
            # 3. 構建高質量上下文 - 按文件名稱分組
            file_groups = {}
            for doc in docs:
                filename = doc.metadata.get("filename", "未知文件")
                if filename not in file_groups:
                    file_groups[filename] = []
                file_groups[filename].append(doc.page_content)
            
            context_parts = []
            for filename, contents in file_groups.items():
                combined_content = "\n\n".join(contents)
                context_parts.append(f"[文件: {filename}]\n{combined_content}")
            
            context = "\n\n---\n\n".join(context_parts)
            
            # 4. 針對考古題優化的提示詞工程
            prompt = f"""你是一個專業的文檔分析助手，特別擅長處理考試題目和學習資料。請仔細分析提供的文檔內容來回答用戶問題。

## 文檔內容：
{context}

## 用戶問題：
{question}

## 回答要求：
1. 仔細搜尋文檔中是否有與問題相關的內容，包括：
   - 完全相同的題目
   - 類似的題目或概念
   - 相關的知識點或解釋
2. 如果找到相關內容，請詳細引用並說明
3. 如果是考試題目，請提供完整的題目內容和選項（如果有）
4. 引用具體的文件名稱和內容片段
5. 如果確實沒有相關信息，請明確說明並建議可能的原因
6. 使用繁體中文回答

## 回答："""
            
            # 5. LLM生成回答
            print(f"[Query {query_id[:8]}] Generating answer with {len(context)} characters of context")
            
            # 估算 input tokens (簡化計算)
            input_tokens = len(prompt) // 4  # 簡化估算，1 token 約 4 字元
            
            response = self.llm.invoke(prompt)
            
            # 估算 output tokens
            output_tokens = len(response.content) // 4
            
            # 更新 token 統計
            cost = self._update_token_stats(input_tokens, output_tokens)
            
            # 6. 提取來源信息 - 只顯示主要來源
            sources = []
            seen_files = set()
            
            # 只取前5個最相關的文檔片段作為來源
            for doc in docs[:5]:
                filename = doc.metadata.get("filename", "未知文件")
                page = doc.metadata.get("page", 1)
                
                # 每個文件只顯示一次
                if filename not in seen_files:
                    seen_files.add(filename)
                    sources.append({
                        "file_name": filename,
                        "page": page,
                        "chunk_id": f"page_{page}"
                    })
            
            # 7. 構建響應 - 優化來源預覽
            source_documents = []
            for filename, contents in file_groups.items():
                combined_content = "\n\n".join(contents)
                
                # 智能片段提取
                snippet = self._extract_relevant_snippet(combined_content, question, 200)
                highlighted = self._highlight_keywords(snippet, question)
                
                # 計算相關度分數
                relevance_score = self._calculate_relevance_score(combined_content, question)
                
                source_documents.append({
                    "snippet": snippet,
                    "highlighted": highlighted,
                    "full_content": combined_content,  # 完整內容供展開使用
                    "metadata": {
                        "filename": filename,
                        "chunks_count": len(contents),
                        "relevance_score": relevance_score,
                        "expandable": len(combined_content) > 200
                    }
                })
            
            # 按相關度排序
            source_documents.sort(key=lambda x: x["metadata"]["relevance_score"], reverse=True)
            
            result = {
                "id": query_id,
                "question": question,
                "answer": response.content,
                "sources": sources,
                "timestamp": timestamp,
                "token_usage": {
                    "input_tokens": input_tokens,
                    "output_tokens": output_tokens,
                    "total_tokens": input_tokens + output_tokens,
                    "cost_usd": cost
                },
                "source_documents": source_documents
            }
            
            print(f"[Query {query_id[:8]}] Query completed successfully")
            return result
            
        except Exception as e:
            error_msg = f"RAG查詢系統錯誤: {str(e)}"
            print(f"[Query {query_id[:8]}] Error: {error_msg}")
            import traceback
            traceback.print_exc()
            
            return {
                "id": query_id,
                "question": question,
                "answer": f"系統暫時無法處理您的查詢，請稍後再試。錯誤信息：{error_msg}",
                "sources": [],
                "timestamp": timestamp,
                "source_documents": []
            }
    
    async def generate_summary(self, session_id: str = None) -> Dict[str, Any]:
        """生成文檔摘要"""
        print(f"Generating summary for session: {session_id}")
        
        # 獲取會話中的文檔
        active_doc_ids = []
        if session_id:
            active_doc_ids = self.get_session_documents(session_id)
            print(f"Active docs in session {session_id}: {active_doc_ids}")
        
        if not active_doc_ids:
            print("No active documents found")
            return {
                "summary": "無法生成摘要，請先上傳文檔並添加到會話中。",
                "key_points": [],
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
        
        doc_filter = {"doc_id": {"$in": active_doc_ids}}
        
        # 獲取會話中所有文檔的完整內容
        try:
            collection = self.vector_store._collection
            all_content = []
            
            for doc_id in active_doc_ids:
                results = collection.get(
                    where={"doc_id": doc_id},
                    include=["documents", "metadatas"]
                )
                
                if results['documents']:
                    filename = results['metadatas'][0].get('filename', 'unknown') if results['metadatas'] else 'unknown'
                    combined_content = "\n\n".join(results['documents'])
                    all_content.append(f"=== {filename} ===\n{combined_content}")
            
            if not all_content:
                return {
                    "summary": "無法生成摘要，文檔內容為空。",
                    "key_points": [],
                    "timestamp": __import__('datetime').datetime.now().isoformat()
                }
            
            content = "\n\n" + "="*50 + "\n\n".join(all_content)
            print(f"Summary generation using {len(content)} characters from {len(all_content)} documents")
            
        except Exception as e:
            print(f"Error getting full document content for summary: {e}")
            # fallback到原本的方法
            docs = self.vector_store.similarity_search(
                "摘要 總結 主要內容", 
                k=30,
                filter=doc_filter
            )
            
            if not docs:
                return {
                    "summary": "無法生成摘要，請先上傳文檔並添加到會話中。",
                    "key_points": [],
                    "timestamp": __import__('datetime').datetime.now().isoformat()
                }
            
            content = "\n\n".join([doc.page_content for doc in docs])
        
        # 大幅限制內容長度
        if len(content) > 8000:
            content = content[:8000] + "..."
        
        prompt = f"請為以下文檔生成摘要：\n\n{content}\n\n請用繁體中文回答，包含：\n1. 主要內容摘要（2-3句話）\n2. 關鍵要點（用 • 開頭，3-5個要點）"
        
        try:
            # 計算 tokens
            input_tokens = len(prompt) // 4
            print(f"Invoking LLM for summary with {input_tokens} estimated input tokens")
            
            response = self.llm.invoke(prompt)
            
            print(f"Raw response type: {type(response)}")
            print(f"Raw response: {response}")
            
            if hasattr(response, 'content'):
                summary_text = response.content.strip()
            else:
                summary_text = str(response).strip()
            
            output_tokens = len(summary_text) // 4
            self._update_token_stats(input_tokens, output_tokens)
            
            print(f"Summary text: '{summary_text}'")
            print(f"Summary length: {len(summary_text)}")
            
            if not summary_text or len(summary_text.strip()) == 0:
                return {
                    "summary": "LLM 未返回摘要內容，請重試。可能是內容過長或API問題。",
                    "key_points": [],
                    "timestamp": __import__('datetime').datetime.now().isoformat()
                }
            
        except Exception as e:
            print(f"Error generating summary: {e}")
            import traceback
            traceback.print_exc()
            return {
                "summary": f"生成摘要時發生錯誤：{str(e)}",
                "key_points": [],
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
        
        key_points = []
        lines = summary_text.split('\n')
        for line in lines:
            if line.strip().startswith('•'):
                key_points.append(line.strip())
        
        from datetime import datetime
        result = {
            "summary": summary_text,
            "key_points": key_points,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"Summary generation completed: {len(key_points)} key points extracted")
        return result
    
    async def generate_quiz(self, session_id: str = None, num_questions: int = 3) -> Dict[str, Any]:
        """生成測驗題目"""
        print(f"Generating quiz for session: {session_id}, num_questions: {num_questions}")
        
        # 獲取會話中的文檔
        active_doc_ids = []
        if session_id:
            active_doc_ids = self.get_session_documents(session_id)
            print(f"Active docs in session {session_id}: {active_doc_ids}")
        
        if not active_doc_ids:
            print("No active documents found for quiz generation")
            return {
                "questions": [],
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
        
        # 獲取會話中所有文檔的完整內容（簡化版）
        content = ""
        try:
            collection = self.vector_store._collection
            print(f"Getting content for doc_ids: {active_doc_ids}")
            
            for doc_id in active_doc_ids:
                print(f"Processing doc_id: {doc_id}")
                results = collection.get(
                    where={"doc_id": {"$eq": doc_id}},
                    include=["documents", "metadatas"]
                )
                
                print(f"Got {len(results.get('documents', []))} chunks for doc {doc_id}")
                
                if results.get('documents'):
                    doc_content = "\n\n".join(results['documents'])
                    content += doc_content + "\n\n"
            
            print(f"Total content length: {len(content)} characters")
            
            if len(content.strip()) < 100:
                print("Fallback: Using similarity search")
                doc_filter = {"doc_id": {"$in": active_doc_ids}}
                docs = self.vector_store.similarity_search(
                    "內容 文字 資料", 
                    k=50,
                    filter=doc_filter
                )
                content = "\n\n".join([doc.page_content for doc in docs])
                print(f"Fallback content length: {len(content)} characters")
            
        except Exception as e:
            print(f"Error getting document content: {e}")
            import traceback
            traceback.print_exc()
            content = ""
        
        # 添加隨機性和時間戳
        import random
        import time
        random_seed = int(time.time() * 1000) % 10000
        
        # 限制內容長度
        if len(content) > 15000:
            content = content[:15000] + "..."
        
        # 檢查內容是否足夠生成題目
        if len(content.strip()) < 100:
            print(f"Content too short for quiz generation: {len(content.strip())} characters")
            print(f"Content preview: {content[:200]}...")
            return {
                "questions": [],
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
        
        # 隨機選擇內容片段增加多樣性
        import random
        import time
        random.seed(int(time.time()))
        
        if len(content) > 5000:
            # 隨機選擇起始位置
            max_start = len(content) - 3000
            start_pos = random.randint(0, max(0, max_start))
            short_content = content[start_pos:start_pos + 3000]
        else:
            short_content = content
        
        # 添加隨機性到提示詞
        random_seed = random.randint(1000, 9999)
        
        prompt = f"Based on this content, create {num_questions} multiple choice questions. Return only JSON array.\n\nContent:\n{short_content}\n\nFormat: [{{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_answer\": 0}}]"
        
        try:
            # 計算 tokens
            input_tokens = len(prompt) // 4
            print(f"Invoking LLM for quiz with {input_tokens} estimated input tokens")
            
            # 使用主 LLM 實例
            response = self.llm.invoke(prompt)
            
            print(f"Raw LLM response: '{response.content}'")
            print(f"Response length: {len(response.content)}")
            
            if not response.content or len(response.content.strip()) < 10:
                print("LLM returned empty or very short response")
                return {
                    "questions": [],
                    "timestamp": __import__('datetime').datetime.now().isoformat()
                }
            
            output_tokens = len(response.content) // 4
            self._update_token_stats(input_tokens, output_tokens)
            
            import json
            import re
            
            # 提取JSON部分
            response_text = response.content.strip()
            
            # 多種方式提取 JSON
            questions_data = []
            
            # 方法1: 清理 markdown 和特殊字符
            clean_text = response_text
            if '```json' in clean_text:
                clean_text = clean_text.split('```json')[1].split('```')[0]
            elif '```' in clean_text:
                parts = clean_text.split('```')
                for part in parts:
                    if '[' in part and ']' in part:
                        clean_text = part
                        break
            
            # 移除可能的特殊字符
            clean_text = clean_text.replace('\n', ' ').replace('\t', ' ').strip()
            
            # 方法2: 嘗試直接解析
            for text in [clean_text, response_text]:
                try:
                    if '[' in text and ']' in text:
                        start = text.find('[')
                        end = text.rfind(']') + 1
                        json_str = text[start:end]
                        questions_data = json.loads(json_str)
                        if questions_data:
                            break
                except:
                    continue
            
            # 方法3: 正則匹配所有可能的 JSON
            if not questions_data:
                patterns = [
                    r'\[\s*\{.*?\}\s*\]',
                    r'\[.*?\]'
                ]
                for pattern in patterns:
                    matches = re.findall(pattern, response_text, re.DOTALL)
                    for match in matches:
                        try:
                            data = json.loads(match)
                            if isinstance(data, list) and len(data) > 0:
                                questions_data = data
                                break
                        except:
                            continue
                    if questions_data:
                        break
            
            if not questions_data:
                print(f"Failed to parse JSON from response: {response_text[:300]}")
                questions_data = []
            
            print(f"Parsed {len(questions_data)} questions from LLM response")
            
            questions = [
                {
                    "id": i + 1,
                    "question": q.get("question", f"題目{i+1}"),
                    "options": q.get("options", ["選項A", "選項B", "選項C", "選項D"]),
                    "correct_answer": q.get("correct_answer", 0)
                }
                for i, q in enumerate(questions_data[:num_questions])
            ]
                
        except Exception as e:
            print(f"Quiz generation error: {e}")
            import traceback
            traceback.print_exc()
            questions = []
        
        from datetime import datetime
        result = {
            "questions": questions,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"Quiz generation completed: {len(questions)} questions generated")
        return result
    
    def get_document_info(self, doc_id: str) -> Dict[str, Any]:
        """獲取文檔信息"""
        if doc_id not in self.documents:
            raise ValueError("文檔不存在")
        return self.documents[doc_id]
    
    def list_documents(self) -> List[Dict[str, Any]]:
        """列出所有文檔"""
        return list(self.documents.values())
    
    def delete_document(self, doc_id: str) -> bool:
        """完全刪除文檔"""
        if doc_id not in self.documents:
            return False
            
        try:
            # 1. 從所有會話中移除
            for session_id in list(self.sessions.keys()):
                if doc_id in self.sessions[session_id].get("active_docs", []):
                    self.sessions[session_id]["active_docs"].remove(doc_id)
            self._save_session_metadata()
            
            # 2. 刪除物理文件
            if "file_path" in self.documents[doc_id]:
                file_path = Path(self.documents[doc_id]["file_path"])
                if file_path.exists():
                    file_path.unlink()
            
            # 3. 從向量庫強制刪除
            collection = self.vector_store._collection
            results = collection.get(where={"doc_id": {"$eq": doc_id}})
            if results['ids']:
                collection.delete(ids=results['ids'])
                print(f"Deleted {len(results['ids'])} chunks")
            
            # 4. 從元數據刪除
            del self.documents[doc_id]
            self._save_document_metadata()
            return True
            
        except Exception as e:
            print(f"Delete error: {e}")
            return False
    
    def get_vector_store_stats(self) -> Dict[str, Any]:
        """獲取企業級向量庫統計信息"""
        try:
            collection = self.vector_store._collection
            total_vectors = collection.count()
            
            # 獲取文檔狀態統計
            status_counts = {}
            for doc in self.documents.values():
                status = doc.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1
            
            # 文件類型統計
            type_counts = {}
            for doc in self.documents.values():
                content_type = doc.get("content_type", "unknown")
                type_counts[content_type] = type_counts.get(content_type, 0) + 1
            
            return {
                "vector_store": {
                    "total_vectors": total_vectors,
                    "collection_name": "rag_documents",
                    "persist_directory": str(self.vector_store_path)
                },
                "documents": {
                    "total_uploaded": len(self.documents),
                    "status_breakdown": status_counts,
                    "type_breakdown": type_counts
                },
                "token_usage": {
                    "total_input_tokens": self.total_tokens["input"],
                    "total_output_tokens": self.total_tokens["output"],
                    "total_tokens": self.total_tokens["input"] + self.total_tokens["output"],
                    "total_cost_usd": self.total_tokens["cost"]
                },
                "configuration": {
                    "chunk_size": self.text_splitter._chunk_size,
                    "chunk_overlap": self.text_splitter._chunk_overlap,
                    "embedding_model": "paraphrase-multilingual-MiniLM-L12-v2",
                    "llm_model": "gemini-2.5-flash"
                }
            }
        except Exception as e:
            return {
                "error": f"Failed to get stats: {str(e)}",
                "total_documents": 0, 
                "total_chunks": 0
            }
    
    def reset_system(self) -> Dict[str, Any]:
        """完全重置系統到初始狀態"""
        try:
            import shutil
            
            # 1. 清空內存數據
            self.documents.clear()
            self.sessions.clear()
            
            # 2. 清理上傳文件
            if self.upload_dir.exists():
                shutil.rmtree(self.upload_dir)
            self.upload_dir.mkdir(exist_ok=True)
            
            # 3. 清理向量庫
            if self.vector_store_path.exists():
                shutil.rmtree(self.vector_store_path)
            self.vector_store_path.mkdir(exist_ok=True)
            
            # 4. 重新初始化向量庫
            self._init_vector_store()
            
            # 5. 保存空的元數據
            self._save_document_metadata()
            self._save_session_metadata()
            
            return {
                "status": "success",
                "message": "系統已完全重置到初始狀態",
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"重置失敗: {str(e)}",
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
    
    def health_check(self) -> Dict[str, Any]:
        """系統健康檢查"""
        health_status = {
            "status": "healthy",
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "components": {}
        }
        
        try:
            # 檢查API Key
            api_key = os.getenv("GEMINI_API_KEY")
            health_status["components"]["api_key"] = "configured" if api_key else "missing"
            
            # 檢查向量庫
            try:
                count = self.vector_store._collection.count()
                health_status["components"]["vector_store"] = f"operational ({count} docs)"
            except Exception as e:
                health_status["components"]["vector_store"] = f"error: {str(e)}"
                health_status["status"] = "degraded"
            
            # 檢查LLM連接
            try:
                test_response = self.llm.invoke("測試")
                health_status["components"]["llm"] = "operational"
            except Exception as e:
                health_status["components"]["llm"] = f"error: {str(e)}"
                health_status["status"] = "unhealthy"
            
            # 檢查文件存儲
            health_status["components"]["file_storage"] = "operational" if self.upload_dir.exists() else "missing"
            
        except Exception as e:
            health_status["status"] = "unhealthy"
            health_status["error"] = str(e)
        
        return health_status
    
    def _extract_relevant_snippet(self, content: str, query: str, max_length: int = 200) -> str:
        """提取與查詢相關的文本片段"""
        sentences = content.replace('\n', ' ').split('。')
        if not sentences:
            return content[:max_length] + "..." if len(content) > max_length else content
        
        # 找到最相關的句子
        query_words = set(query.lower().split())
        best_sentence_idx = 0
        best_score = 0
        
        for i, sentence in enumerate(sentences):
            sentence_words = set(sentence.lower().split())
            score = len(query_words.intersection(sentence_words))
            if score > best_score:
                best_score = score
                best_sentence_idx = i
        
        # 提取前後文
        start_idx = max(0, best_sentence_idx - 1)
        end_idx = min(len(sentences), best_sentence_idx + 2)
        snippet = '。'.join(sentences[start_idx:end_idx])
        
        if len(snippet) > max_length:
            snippet = snippet[:max_length] + "..."
        
        return snippet if snippet else content[:max_length]
    
    def _highlight_keywords(self, text: str, query: str) -> str:
        """高亮關鍵詞"""
        import re
        keywords = re.findall(r'[\u4e00-\u9fff]+', query)  # 提取中文關鍵詞
        
        highlighted = text
        for keyword in keywords:
            if keyword in highlighted:
                highlighted = highlighted.replace(keyword, f"**{keyword}**")
        
        return highlighted
    
    def _calculate_relevance_score(self, content: str, query: str) -> float:
        """計算相關度分數"""
        import re
        query_words = set(re.findall(r'[\u4e00-\u9fff]+', query.lower()))
        content_words = set(re.findall(r'[\u4e00-\u9fff]+', content.lower()))
        
        if not query_words:
            return 0.0
        
        intersection = query_words.intersection(content_words)
        return len(intersection) / len(query_words)
    
    def get_source_content(self, file_name: str, chunk_id: str = None) -> str:
        """獲取指定文件的完整內容（用於展開查看）"""
        try:
            collection = self.vector_store._collection
            
            # 使用正確的ChromaDB查詢語法
            results = collection.get(
                where={"filename": {"$eq": file_name}},
                include=["documents", "metadatas"]
            )
            
            if results['documents']:
                # 合併所有相關的文本片段
                content = "\n\n".join(results['documents'])
                return content[:2000] + "..." if len(content) > 2000 else content
            else:
                return "無法找到相關內容"
                
        except Exception as e:
            print(f"Error getting source content: {e}")
            return f"獲取內容時發生錯誤: {str(e)}"