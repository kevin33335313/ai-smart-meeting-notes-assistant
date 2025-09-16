const API_BASE_URL = 'http://localhost:8000'

// 會話管理 API
export interface SessionInfo {
  id: string
  name: string
  created_at: string
  document_count: number
}

export class SessionAPI {
  static async createSession(): Promise<{ session_id: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/sessions`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`創建會話失敗: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async listSessions(): Promise<SessionInfo[]> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/sessions`)
    
    if (!response.ok) {
      throw new Error(`獲取會話列表失敗: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async addDocumentToSession(sessionId: string, docId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/sessions/${sessionId}/documents/${docId}`, {
      method: 'POST',
    })
    
    if (!response.ok) {
      throw new Error(`添加文檔失敗: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async removeDocumentFromSession(sessionId: string, docId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/sessions/${sessionId}/documents/${docId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error(`移除文檔失敗: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  static async getSessionDocuments(sessionId: string): Promise<DocumentInfo[]> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/sessions/${sessionId}/documents`)
    
    if (!response.ok) {
      throw new Error(`獲取會話文檔失敗: ${response.statusText}`)
    }
    
    return response.json()
  }
}

export interface DocumentInfo {
  id: string
  filename: string
  size: number
  content_type: string
  upload_time: string
  status: string
}

export interface SourceInfo {
  file_name: string
  page?: number
  chunk_id?: string
}

export interface SourceDocumentMetadata {
  filename: string
  chunks_count: number
  relevance_score: number
  expandable: boolean
}

export interface SourceDocument {
  snippet: string              // 相關片段 (150-200字)
  highlighted: string          // 高亮版本
  full_content: string         // 完整內容（供展開使用）
  metadata: SourceDocumentMetadata
}

export interface QuestionResponse {
  id: string
  question: string
  answer: string
  sources: SourceInfo[]        // 保留原有格式兼容性
  source_documents?: SourceDocument[]  // 新增優化的來源預覽
  timestamp: string
}

export interface SummaryResponse {
  summary: string
  key_points: string[]
  timestamp: string
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct_answer: number
}

export interface QuizResponse {
  questions: QuizQuestion[]
  timestamp: string
}

// 文檔問答 API
export class DocumentQAAPI {
  static async uploadDocument(file: File): Promise<DocumentInfo> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/document-qa/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`上傳失敗: ${response.statusText}`)
    }

    return response.json()
  }

  static async listDocuments(): Promise<DocumentInfo[]> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/documents`)
    
    if (!response.ok) {
      throw new Error(`獲取文件列表失敗: ${response.statusText}`)
    }

    return response.json()
  }

  static async deleteDocument(docId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/documents/${docId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`刪除文件失敗: ${response.statusText}`)
    }
  }

  static async askQuestion(question: string, documentIds: string[], sessionId?: string): Promise<QuestionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        document_ids: documentIds,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`問答失敗: ${response.statusText}`)
    }

    return response.json()
  }

  static async expandSourceContent(fileName: string, query?: string): Promise<{
    file_name: string
    content: string
    highlighted_content: string
    length: number
  }> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/expand-source`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: fileName,
        query: query || '',
      }),
    })

    if (!response.ok) {
      throw new Error(`展開內容失敗: ${response.statusText}`)
    }

    return response.json()
  }

  static async generateSummary(documentIds?: string[], sessionId?: string): Promise<SummaryResponse> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_ids: documentIds,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`生成摘要失敗: ${response.statusText}`)
    }

    return response.json()
  }

  static async generateQuiz(documentIds?: string[], numQuestions: number = 5, sessionId?: string): Promise<QuizResponse> {
    const response = await fetch(`${API_BASE_URL}/api/document-qa/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_ids: documentIds,
        num_questions: numQuestions,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error(`生成測驗失敗: ${response.statusText}`)
    }

    return response.json()
  }
}