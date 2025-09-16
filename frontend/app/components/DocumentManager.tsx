'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Clock, MessageSquare, Plus } from "lucide-react"

interface Document {
  id: string
  filename: string
  status: 'uploading' | 'processing' | 'ready' | 'error'
  progress?: number
  inSession?: boolean
}

interface Session {
  id: string
  name: string
  created_at: string
  document_count: number
}

interface DocumentManagerProps {
  onSessionChange?: (sessionId: string) => void
}

export default function DocumentManager({ onSessionChange }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type === 'text/plain' || file.type === 'application/pdf') {
        uploadFile(file)
      }
    })
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(uploadFile)
  }

  useEffect(() => {
    // 檢查後端是否可用並初始化
    const initializeApp = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/document-qa/health')
        if (response.ok) {
          await loadSessions()
          await loadDocuments()
          
          // 如果沒有會話，自動創建一個
          const sessionsResponse = await fetch('http://localhost:8000/api/document-qa/sessions')
          if (sessionsResponse.ok) {
            const sessionsData = await sessionsResponse.json()
            if (sessionsData.length === 0) {
              await createSession()
            } else {
              // 自動選擇第一個會話
              setCurrentSession(sessionsData[0].id)
            }
          }
        }
      } catch (error) {
        console.warn('後端服務不可用，正在等待服務啟動...')
        // 等待一段時間後自動重試
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }
    initializeApp()
  }, [])

  useEffect(() => {
    if (currentSession) {
      loadSessionDocuments()
      onSessionChange?.(currentSession)
    }
  }, [currentSession])

  const loadSessions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-qa/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setSessions([]) // 設置空數組避免錯誤
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-qa/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.map((doc: any) => ({ ...doc, inSession: false })))
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      setDocuments([]) // 設置空數組避免錯誤
    }
  }

  const loadSessionDocuments = async () => {
    if (!currentSession) return
    try {
      const response = await fetch(`http://localhost:8000/api/document-qa/sessions/${currentSession}/documents`)
      if (response.ok) {
        const sessionDocs = await response.json()
        const sessionDocIds = sessionDocs.map((doc: any) => doc.id)
        setDocuments(prev => prev.map(doc => ({
          ...doc,
          inSession: sessionDocIds.includes(doc.id)
        })))
      }
    } catch (error) {
      console.error('Failed to load session documents:', error)
      // 不更新狀態，保持現有數據
    }
  }

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-qa/sessions', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        await loadSessions()
        setCurrentSession(data.session_id)
      }
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const toggleDocumentInSession = async (docId: string, inSession: boolean) => {
    if (!currentSession) return
    
    try {
      const url = `http://localhost:8000/api/document-qa/sessions/${currentSession}/documents/${docId}`
      const method = inSession ? 'DELETE' : 'POST'
      
      const response = await fetch(url, { method })
      if (response.ok) {
        setDocuments(prev => prev.map(doc => 
          doc.id === docId ? { ...doc, inSession: !inSession } : doc
        ))
        await loadSessions()
      }
    } catch (error) {
      console.error('Failed to toggle document in session:', error)
    }
  }

  const uploadFile = async (file: File) => {
    // 如果沒有會話，先創建一個
    if (!currentSession) {
      await createSession()
    }
    
    const docId = Math.random().toString(36).substr(2, 9)
    
    setDocuments(prev => [...prev, {
      id: docId,
      filename: file.name,
      status: 'uploading',
      progress: 0,
      inSession: false
    }])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/document-qa/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setDocuments(prev => prev.map(doc => 
          doc.id === docId 
            ? { ...doc, id: result.id, status: 'ready', progress: 100 }
            : doc
        ))
        
        // 自動添加到當前會話
        if (currentSession) {
          setTimeout(async () => {
            await toggleDocumentInSession(result.id, false)
          }, 500)
        }
        
        await loadDocuments()
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setDocuments(prev => prev.map(doc => 
        doc.id === docId 
          ? { ...doc, status: 'error' }
          : doc
      ))
    }
  }

  const removeDocument = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/document-qa/documents/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== id))
        await loadSessions() // 重新載入會話以更新文檔數量
      } else {
        console.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* 會話選擇 */}
          <div className="space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">對話會話</label>
              <Button 
                size="sm" 
                onClick={createSession} 
                className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md"
              >
                <Plus className="h-3 w-3 mr-1" />
                新建
              </Button>
            </div>
            <Select value={currentSession} onValueChange={setCurrentSession}>
              <SelectTrigger className="h-10 text-sm border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white transition-all">
                <SelectValue placeholder="選擇或創建會話" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-xl border-gray-200">
                {sessions.map(session => (
                  <SelectItem key={session.id} value={session.id} className="text-sm hover:bg-blue-50">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      <span>{session.name}</span>
                      <span className="text-xs text-gray-500">({session.document_count})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 會話中的文檔列表 */}
          {currentSession && (
            <div className="space-y-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-blue-100">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-sm text-gray-800">
                  活躍文檔 
                  <span className="ml-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    {documents.filter(doc => doc.inSession).length}
                  </span>
                </h4>
              </div>
              {documents.filter(doc => doc.inSession).length > 0 ? (
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-3 max-h-32 overflow-y-auto border border-emerald-200/50">
                  <div className="space-y-2">
                    {documents.filter(doc => doc.inSession).map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-lg p-2.5 border border-white/50 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="p-1 rounded bg-blue-100">
                            <FileText className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 break-all" title={doc.filename}>{doc.filename}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDocumentInSession(doc.id, true)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0 flex-shrink-0 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 text-center border border-gray-200/50">
                  <div className="p-2 rounded-full bg-gray-100 w-fit mx-auto mb-2">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">尚未添加文檔</p>
                  <p className="text-xs text-gray-500 mt-1">上傳文檔並添加到會話中</p>
                </div>
              )}
            </div>
          )}

          {/* 上傳區域 */}
          <div className="flex-shrink-0">
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <div className="mb-3">
                <div className={`p-3 rounded-full w-fit mx-auto transition-all ${
                  isDragging ? 'bg-blue-500 scale-110' : 'bg-gray-100 hover:bg-blue-100'
                }`}>
                  <Upload className={`h-6 w-6 transition-colors ${
                    isDragging ? 'text-white' : 'text-gray-500 hover:text-blue-500'
                  }`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                拖拽文件到此處
              </p>
              <p className="text-xs text-gray-500 mb-4">
                支援 PDF 和 TXT 格式
              </p>
              <input
                type="file"
                accept=".txt,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 h-9 px-4 text-sm font-medium"
              >
                <Upload className="h-4 w-4 mr-2" />
                選擇文件
              </Button>
            </div>
          </div>

          {/* 文件庫 */}
          {documents.filter(doc => !doc.inSession).length > 0 && (
            <div className="space-y-3 flex-1 min-h-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-semibold text-sm text-gray-800">
                  文件庫
                  <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {documents.filter(doc => !doc.inSession).length}
                  </span>
                </h4>
              </div>
              <div className="space-y-2 overflow-y-auto">
                {documents.filter(doc => !doc.inSession).map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl border bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-1 rounded bg-blue-100">
                            <FileText className="h-3 w-3 text-blue-600 flex-shrink-0" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 break-all" title={doc.filename}>{doc.filename}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(doc.status)}
                          <Badge variant="outline" className={`text-xs h-5 px-2 font-medium border-0 ${getStatusColor(doc.status)}`}>
                            {doc.status === 'uploading' ? '上傳中' : 
                             doc.status === 'processing' ? '處理中' :
                             doc.status === 'ready' ? '就緒' : '錯誤'}
                          </Badge>
                        </div>
                        {doc.status === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={doc.progress} className="h-2 bg-gray-100" />
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0 ml-3">
                        {currentSession && doc.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() => toggleDocumentInSession(doc.id, false)}
                            className="text-xs px-3 py-1 h-7 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-sm"
                          >
                            添加
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 h-7 w-7 p-0 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}