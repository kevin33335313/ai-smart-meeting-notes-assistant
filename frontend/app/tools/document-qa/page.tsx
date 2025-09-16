'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DocumentQAAPI, DocumentInfo, QuestionResponse, SummaryResponse, QuizResponse, SourceDocument } from "@/lib/api/document-qa"
import { 
  Upload, 
  MessageSquare, 
  FileText, 
  Brain, 
  Trash2, 
  Send,
  BookOpen,
  HelpCircle,
  Sparkles,
  Database,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react"

interface QARecord {
  id: string
  question: string
  answer: string
  sources: string[]
  source_documents?: SourceDocument[]
  timestamp: Date
}

interface SourceDocument {
  snippet: string
  highlighted: string
  full_content: string
  metadata: {
    filename: string
    chunks_count: number
    relevance_score: number
    expandable: boolean
  }
}

// 來源預覽組件
function SourcePreview({ document, query }: { document: SourceDocument; query: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [fullContent, setFullContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExpand = async () => {
    if (!isExpanded && !fullContent) {
      setIsLoading(true)
      try {
        const response = await DocumentQAAPI.expandSourceContent(document.metadata.filename, query)
        setFullContent(response.highlighted_content)
      } catch (error) {
        console.error('獲取完整內容失敗:', error)
        setFullContent(document.full_content)
      } finally {
        setIsLoading(false)
      }
    }
    setIsExpanded(!isExpanded)
  }

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm text-blue-800">{document.metadata.filename}</span>
          <Badge variant="outline" className="text-xs">
            {(document.metadata.relevance_score * 100).toFixed(0)}%
          </Badge>
        </div>
        {document.metadata.expandable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="h-6 w-6 p-0"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent" />
            ) : isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      
      <div className="text-sm text-gray-700">
        {isExpanded && fullContent ? (
          <div className="max-h-64 overflow-y-auto bg-white p-2 rounded border">
            <div dangerouslySetInnerHTML={{ 
              __html: fullContent.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200">$1</mark>') 
            }} />
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ 
            __html: document.highlighted.replace(/\*\*(.*?)\*\*/g, '<mark class="bg-yellow-200">$1</mark>') 
          }} />
        )}
      </div>
    </div>
  )
}

export default function DocumentQAPage() {
  const [uploadedFiles, setUploadedFiles] = useState<DocumentInfo[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [qaHistory, setQAHistory] = useState<QARecord[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [summary, setSummary] = useState('')
  const [quiz, setQuiz] = useState<any[]>([])

  useEffect(() => {
    loadDocuments()
    // 初始化 session_1
    initSession()
  }, [])
  
  const initSession = async () => {
    try {
      // 嘗試創建 session_1
      await fetch('http://localhost:8000/api/document-qa/sessions', {
        method: 'POST'
      })
      console.log('Session 初始化完成')
    } catch (error) {
      console.log('Session 可能已存在')
    }
  }

  const loadDocuments = async () => {
    try {
      const docs = await DocumentQAAPI.listDocuments()
      setUploadedFiles(docs)
    } catch (error) {
      console.error('載入文件失敗:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setIsProcessing(true)
      try {
        for (const file of Array.from(files)) {
          const uploadedDoc = await DocumentQAAPI.uploadDocument(file)
          setUploadedFiles(prev => [...prev, uploadedDoc])
          
          // 自動添加到 session_1
          try {
            await fetch('http://localhost:8000/api/document-qa/sessions/session_1/documents/' + uploadedDoc.id, {
              method: 'POST'
            })
            console.log('文檔已添加到 session_1:', uploadedDoc.filename)
          } catch (sessionError) {
            console.error('添加到會話失敗:', sessionError)
          }
        }
      } catch (error) {
        console.error('上傳失敗:', error)
        alert('文件上傳失敗，請重試')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const removeFile = async (fileId: string) => {
    try {
      await DocumentQAAPI.deleteDocument(fileId)
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    } catch (error) {
      console.error('刪除文件失敗:', error)
      alert('刪除文件失敗，請重試')
    }
  }

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim() || uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    try {
      const documentIds = uploadedFiles.map(file => file.id)
      // 使用 session_id 而不是 document_ids
      const response = await DocumentQAAPI.askQuestion(currentQuestion, [], 'session_1')
      
      console.log('API Response:', response)
      
      const newQA: QARecord = {
        id: response.id,
        question: response.question,
        answer: response.answer,
        sources: Array.isArray(response.sources) ? response.sources.map((s: any) => 
          typeof s === 'string' ? s : s.file_name || s
        ) : [],
        source_documents: response.source_documents || [],
        timestamp: new Date(response.timestamp)
      }
      
      setQAHistory(prev => [newQA, ...prev])
      setCurrentQuestion('')
    } catch (error) {
      console.error('問答失敗:', error)
      alert('問答失敗，請重試')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateSummary = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    try {
      const response = await DocumentQAAPI.generateSummary([], 'session_1')
      setSummary(response.summary)
    } catch (error) {
      console.error('生成摘要失敗:', error)
      alert('生成摘要失敗，請重試')
    } finally {
      setIsProcessing(false)
    }
  }

  const generateQuiz = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    try {
      const response = await DocumentQAAPI.generateQuiz([], 5, 'session_1')
      setQuiz(response.questions)
    } catch (error) {
      console.error('生成測驗失敗:', error)
      alert('生成測驗失敗，請重試')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/5 to-indigo-600/5 border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-2xl">
                  <Database className="h-10 w-10" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  RAG 智能問答
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  基於檢索增強生成的文件問答系統
                </p>
              </div>
            </div>
            
            {/* 功能特色 */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>智能檢索</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-500" />
                <span>AI 生成</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>多格式支援</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左側：文件管理區 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* 文件上傳卡片 */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                      <Upload className="h-5 w-5" />
                    </div>
                    文件上傳
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    支援 PDF、TXT 格式
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-300 cursor-pointer">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors">
                            <Plus className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">拖拽文件到此處</p>
                            <p className="text-sm text-gray-500">或點擊選擇文件</p>
                          </div>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept=".txt,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isProcessing}
                          id="file-upload-main"
                        />
                      </div>
                    </div>

                    {/* 處理狀態 */}
                    {isProcessing && (
                      <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded-xl">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                        <span>處理中...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 文件列表 */}
              {uploadedFiles.length > 0 && (
                <Card className="border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                        <FileText className="h-5 w-5" />
                      </div>
                      文件庫 ({uploadedFiles.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {uploadedFiles.map(file => (
                        <div key={file.id} className="group relative p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                <p className="font-medium text-sm truncate text-gray-800">{file.filename}</p>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <div className="flex items-center gap-1">
                                  {file.status === 'ready' ? (
                                    <><CheckCircle className="h-3 w-3 text-green-500" /><span className="text-green-600">就緒</span></>
                                  ) : file.status === 'error' ? (
                                    <><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-red-600">錯誤</span></>
                                  ) : (
                                    <><Clock className="h-3 w-3 text-yellow-500" /><span className="text-yellow-600">處理中</span></>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 右側：主要功能區 */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="qa" className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-3 w-fit bg-white shadow-lg border-0 p-1 rounded-2xl">
                  <TabsTrigger value="qa" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
                    <MessageSquare className="h-4 w-4" />
                    智能問答
                  </TabsTrigger>
                  <TabsTrigger value="summary" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
                    <FileText className="h-4 w-4" />
                    文件摘要
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">
                    <HelpCircle className="h-4 w-4" />
                    智能測驗
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* 問答功能 */}
              <TabsContent value="qa" className="space-y-8">
                {/* 問答輸入區 */}
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-purple-50/20">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">智能問答</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          基於 RAG 技術的文件智能問答系統
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative">
                        <Textarea
                          placeholder="請輸入您的問題，例如：這份文件的主要內容是什麼？"
                          value={currentQuestion}
                          onChange={(e) => setCurrentQuestion(e.target.value)}
                          className="min-h-[120px] text-lg border-2 border-purple-100 focus:border-purple-400 rounded-2xl resize-none bg-white/80 backdrop-blur-sm"
                          disabled={isProcessing}
                        />
                        <div className="absolute bottom-4 right-4">
                          <Button
                            onClick={handleSubmitQuestion}
                            disabled={!currentQuestion.trim() || uploadedFiles.length === 0 || isProcessing}
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {uploadedFiles.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>請先上傳文件才能開始問答</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 問答歷史 */}
                {qaHistory.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                        <Clock className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">問答記錄</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {qaHistory.length} 條記錄
                      </Badge>
                    </div>
                    
                    <div className="space-y-6">
                      {qaHistory.map((qa, index) => (
                        <Card key={qa.id} className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/20 overflow-hidden">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* 問題 */}
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex-shrink-0">
                                  <MessageSquare className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                      #{qaHistory.length - index}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {qa.timestamp.toLocaleTimeString()}
                                    </Badge>
                                  </div>
                                  <p className="font-semibold text-gray-800 text-lg">{qa.question}</p>
                                </div>
                              </div>
                              
                              {/* 回答 */}
                              <div className="flex items-start gap-4">
                                <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white flex-shrink-0">
                                  <Brain className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gradient-to-r from-gray-50 to-green-50/30 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-gray-700 leading-relaxed">{qa.answer}</p>
                                    {/* 優化後的來源預覽 */}
                                    {qa.source_documents && qa.source_documents.length > 0 ? (
                                      <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                          <FileText className="h-4 w-4" />
                                          <span className="font-medium">參考來源:</span>
                                        </div>
                                        <div className="space-y-2">
                                          {qa.source_documents.map((doc, idx) => (
                                            <SourcePreview key={idx} document={doc} query={qa.question} />
                                          ))}
                                        </div>
                                      </div>
                                    ) : qa.sources.length > 0 && (
                                      <div className="mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                          <FileText className="h-4 w-4" />
                                          <span className="font-medium">參考來源:</span>
                                          <div className="flex flex-wrap gap-1">
                                            {qa.sources.map((source, idx) => (
                                              <Badge key={idx} variant="outline" className="text-xs">
                                                {source}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 摘要功能 */}
              <TabsContent value="summary" className="space-y-8">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-blue-50/20">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">智能摘要</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          AI 自動提取文件關鍵信息並生成結構化摘要
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Button
                        onClick={generateSummary}
                        disabled={uploadedFiles.length === 0 || isProcessing}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3 text-lg"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                        ) : (
                          <Sparkles className="h-5 w-5 mr-3" />
                        )}
                        生成智能摘要
                      </Button>
                      
                      {uploadedFiles.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">請先上傳文件才能生成摘要</p>
                        </div>
                      )}
                      
                      {summary && (
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-xl">
                              <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                <FileText className="h-5 w-5" />
                              </div>
                              文件摘要報告
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-gray max-w-none">
                              <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 p-6 rounded-2xl border border-gray-100">
                                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">{summary}</pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 測驗功能 */}
              <TabsContent value="quiz" className="space-y-8">
                <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-green-50/20">
                  <CardHeader className="pb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">智能測驗</CardTitle>
                        <CardDescription className="text-gray-600 mt-1">
                          基於文件內容自動生成測驗題目，檢驗理解程度
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <Button
                        onClick={generateQuiz}
                        disabled={uploadedFiles.length === 0 || isProcessing}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3 text-lg"
                      >
                        {isProcessing ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                        ) : (
                          <Brain className="h-5 w-5 mr-3" />
                        )}
                        生成智能測驗
                      </Button>
                      
                      {uploadedFiles.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">請先上傳文件才能生成測驗</p>
                        </div>
                      )}
                      
                      {quiz.length > 0 && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white">
                              <Brain className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">測驗題目</h3>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {quiz.length} 題
                            </Badge>
                          </div>
                          
                          {quiz.map((q, index) => (
                            <Card key={q.id} className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
                              <CardContent className="p-6">
                                <div className="space-y-4">
                                  <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white flex-shrink-0 font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <h4 className="font-semibold text-lg text-gray-800 leading-relaxed">
                                      {q.question}
                                    </h4>
                                  </div>
                                  
                                  <div className="ml-12 space-y-3">
                                    {q.options.map((option: string, optIndex: number) => (
                                      <label key={optIndex} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <input 
                                          type="radio" 
                                          name={`q${q.id}`} 
                                          value={optIndex}
                                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-gray-700 group-hover:text-gray-900">
                                          {String.fromCharCode(65 + optIndex)}. {option}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          <div className="text-center pt-6">
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8 py-3">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              提交答案
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      {/* 背景裝飾 */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}