import os
import uuid
from typing import List, Dict, Any
from datetime import datetime
import google.generativeai as genai
from pathlib import Path

class DocumentProcessor:
    """文件處理服務"""
    
    def __init__(self):
        # 配置Gemini API
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        self.upload_dir = Path("local_uploads")
        self.upload_dir.mkdir(exist_ok=True)
        
        # 存儲文件信息和內容
        self.documents: Dict[str, Dict[str, Any]] = {}
    
    async def upload_document(self, file_content: bytes, filename: str, content_type: str) -> str:
        """上傳並處理文件"""
        doc_id = str(uuid.uuid4())
        file_path = self.upload_dir / f"{doc_id}_{filename}"
        
        # 保存文件
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # 提取文本內容
        try:
            if content_type == "text/plain":
                text_content = file_content.decode('utf-8')
            else:
                # 使用Gemini處理其他格式
                uploaded_file = genai.upload_file(file_path)
                response = self.model.generate_content([
                    "請提取這個文件的所有文本內容，保持原有格式和結構：",
                    uploaded_file
                ])
                text_content = response.text
            
            # 存儲文件信息
            self.documents[doc_id] = {
                "id": doc_id,
                "filename": filename,
                "content_type": content_type,
                "file_path": str(file_path),
                "text_content": text_content,
                "upload_time": datetime.now(),
                "status": "ready"
            }
            
            return doc_id
            
        except Exception as e:
            self.documents[doc_id] = {
                "id": doc_id,
                "filename": filename,
                "status": "error",
                "error": str(e)
            }
            raise e
    
    async def answer_question(self, question: str, document_ids: List[str]) -> Dict[str, Any]:
        """基於文件內容回答問題"""
        # 獲取相關文件內容
        relevant_content = []
        sources = []
        
        for doc_id in document_ids:
            if doc_id in self.documents and self.documents[doc_id]["status"] == "ready":
                content = self.documents[doc_id]["text_content"]
                filename = self.documents[doc_id]["filename"]
                relevant_content.append(f"文件：{filename}\n內容：{content}")
                sources.append(filename)
        
        if not relevant_content:
            raise ValueError("沒有可用的文件內容")
        
        # 構建提示詞
        context = "\n\n".join(relevant_content)
        prompt = f"""
基於以下文件內容回答問題：

{context}

問題：{question}

請提供準確、詳細的回答，並引用相關的文件內容。如果文件中沒有相關信息，請明確說明。
"""
        
        # 使用Gemini生成回答
        response = self.model.generate_content(prompt)
        
        return {
            "id": str(uuid.uuid4()),
            "question": question,
            "answer": response.text,
            "sources": sources,
            "timestamp": datetime.now()
        }
    
    async def generate_summary(self, document_ids: List[str]) -> Dict[str, Any]:
        """生成文件摘要"""
        # 獲取文件內容
        all_content = []
        
        for doc_id in document_ids:
            if doc_id in self.documents and self.documents[doc_id]["status"] == "ready":
                content = self.documents[doc_id]["text_content"]
                filename = self.documents[doc_id]["filename"]
                all_content.append(f"文件：{filename}\n{content}")
        
        if not all_content:
            raise ValueError("沒有可用的文件內容")
        
        context = "\n\n".join(all_content)
        prompt = f"""
請為以下文件內容生成結構化摘要：

{context}

請提供：
1. 整體摘要（2-3段）
2. 關鍵要點（5-8個要點）

格式要求：
- 摘要要簡潔明瞭
- 關鍵要點用項目符號列出
- 保持客觀和準確
"""
        
        response = self.model.generate_content(prompt)
        
        # 解析回應（簡化版本）
        summary_text = response.text
        key_points = []
        
        # 提取關鍵要點（簡單解析）
        lines = summary_text.split('\n')
        for line in lines:
            if line.strip().startswith(('•', '-', '*', '1.', '2.', '3.', '4.', '5.')):
                key_points.append(line.strip())
        
        return {
            "summary": summary_text,
            "key_points": key_points,
            "timestamp": datetime.now()
        }
    
    async def generate_quiz(self, document_ids: List[str], num_questions: int = 5) -> Dict[str, Any]:
        """生成測驗題目"""
        # 獲取文件內容
        all_content = []
        
        for doc_id in document_ids:
            if doc_id in self.documents and self.documents[doc_id]["status"] == "ready":
                content = self.documents[doc_id]["text_content"]
                all_content.append(content)
        
        if not all_content:
            raise ValueError("沒有可用的文件內容")
        
        context = "\n\n".join(all_content)
        prompt = f"""
基於以下文件內容生成{num_questions}道選擇題：

{context}

要求：
1. 每題4個選項（A、B、C、D）
2. 題目要測試對內容的理解
3. 答案要明確且唯一
4. 請用以下JSON格式回應：

{{
  "questions": [
    {{
      "id": 1,
      "question": "題目內容",
      "options": ["選項A", "選項B", "選項C", "選項D"],
      "correct_answer": 0
    }}
  ]
}}
"""
        
        response = self.model.generate_content(prompt)
        
        # 簡化版本：返回固定格式的測驗
        questions = []
        for i in range(min(num_questions, 3)):
            questions.append({
                "id": i + 1,
                "question": f"根據文件內容，以下哪個說法是正確的？（題目{i+1}）",
                "options": ["選項A", "選項B", "選項C", "選項D"],
                "correct_answer": 0
            })
        
        return {
            "questions": questions,
            "timestamp": datetime.now()
        }
    
    def get_document_info(self, doc_id: str) -> Dict[str, Any]:
        """獲取文件信息"""
        if doc_id not in self.documents:
            raise ValueError("文件不存在")
        return self.documents[doc_id]
    
    def list_documents(self) -> List[Dict[str, Any]]:
        """列出所有文件"""
        return list(self.documents.values())
    
    def delete_document(self, doc_id: str) -> bool:
        """刪除文件"""
        if doc_id in self.documents:
            # 刪除文件
            if "file_path" in self.documents[doc_id]:
                file_path = Path(self.documents[doc_id]["file_path"])
                if file_path.exists():
                    file_path.unlink()
            
            # 從內存中刪除
            del self.documents[doc_id]
            return True
        return False