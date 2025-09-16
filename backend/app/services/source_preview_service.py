from typing import List, Dict, Any
from langchain.schema import Document

class SourcePreviewService:
    """處理 RAG 檢索結果的來源預覽服務"""
    
    @staticmethod
    def format_source_preview(
        retrieved_docs: List[Document], 
        max_preview_length: int = 500
    ) -> List[Dict[str, Any]]:
        """
        格式化檢索到的文件片段用於預覽
        
        Args:
            retrieved_docs: 檢索到的文件片段列表
            max_preview_length: 每個預覽片段的最大長度
            
        Returns:
            格式化的來源預覽列表
        """
        source_previews = []
        
        for i, doc in enumerate(retrieved_docs):
            # 獲取文件片段內容
            content = doc.page_content
            metadata = doc.metadata
            
            # 截取適當長度的預覽
            if len(content) > max_preview_length:
                preview_content = content[:max_preview_length] + "..."
            else:
                preview_content = content
            
            # 構建預覽對象
            preview = {
                "id": f"source_{i}",
                "source_file": metadata.get("source", "未知來源"),
                "page_number": metadata.get("page", None),
                "chunk_content": preview_content,  # 實際檢索到的片段
                "relevance_score": getattr(doc, 'relevance_score', None),
                "metadata": metadata
            }
            
            source_previews.append(preview)
        
        return source_previews
    
    @staticmethod
    def highlight_relevant_text(
        content: str, 
        query: str, 
        context_chars: int = 100
    ) -> str:
        """
        在文本中高亮顯示與查詢相關的部分
        
        Args:
            content: 文件內容
            query: 用戶查詢
            context_chars: 高亮部分前後的上下文字符數
            
        Returns:
            包含高亮標記的文本
        """
        import re
        
        # 簡單的關鍵詞匹配和高亮
        query_words = query.lower().split()
        highlighted_content = content
        
        for word in query_words:
            if len(word) > 2:  # 忽略太短的詞
                pattern = re.compile(re.escape(word), re.IGNORECASE)
                highlighted_content = pattern.sub(
                    f"**{word}**", 
                    highlighted_content
                )
        
        return highlighted_content
    
    @staticmethod
    def extract_relevant_sentences(
        content: str, 
        query: str, 
        num_sentences: int = 3
    ) -> str:
        """
        從文件內容中提取最相關的句子
        
        Args:
            content: 文件內容
            query: 用戶查詢
            num_sentences: 要提取的句子數量
            
        Returns:
            最相關的句子組合
        """
        import re
        
        # 將內容分割成句子
        sentences = re.split(r'[.!?。！？]', content)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # 簡單的相關性評分（基於關鍵詞匹配）
        query_words = set(query.lower().split())
        scored_sentences = []
        
        for sentence in sentences:
            sentence_words = set(sentence.lower().split())
            score = len(query_words.intersection(sentence_words))
            if score > 0:
                scored_sentences.append((sentence, score))
        
        # 按分數排序並取前 N 個句子
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        top_sentences = [s[0] for s in scored_sentences[:num_sentences]]
        
        return " ".join(top_sentences) if top_sentences else content[:300]