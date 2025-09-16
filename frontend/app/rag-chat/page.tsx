'use client'

import { useState, useEffect } from 'react'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import DocumentManager from '../components/DocumentManager'
import ChatInterface from '../components/ChatInterface'
import SourcePreviewer from '../components/SourcePreviewer'
import { Brain, Sparkles, FileText, MessageCircle } from 'lucide-react'
import { BackButton } from "@/components/ui/back-button"
import { PrivacyControls } from "@/components/ui/privacy-controls"

interface Source {
  file_name: string
  page?: number
  chunk_id?: string
}

export default function RAGChatPage() {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [showSourcePreview, setShowSourcePreview] = useState(false)
  const [tokenStats, setTokenStats] = useState({ total_tokens: 0, total_cost_usd: 0 })
  const [anonymizerEnabled, setAnonymizerEnabled] = useState(false)

  const handleSourceClick = (source: Source) => {
    setSelectedSource(source)
    setShowSourcePreview(true)
  }

  const handleSessionChange = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const loadTokenStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/document-qa/stats')
      if (response.ok) {
        const data = await response.json()
        setTokenStats({
          total_tokens: data.token_usage?.total_tokens || 0,
          total_cost_usd: data.token_usage?.total_cost_usd || 0
        })
      }
    } catch (error) {
      // 静默失敗，不顯示錯誤
      setTokenStats({ total_tokens: 0, total_cost_usd: 0 })
    }
  }

  // 定期更新 token 統計
  useEffect(() => {
    loadTokenStats()
    const interval = setInterval(loadTokenStats, 5000) // 每5秒更新
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 緊湊型頁面標題 */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="px-6 py-3">
          <BackButton className="mb-3" />
          <PrivacyControls onAnonymizerToggle={setAnonymizerEnabled} className="mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-md">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 p-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  RAG 智能問答系統
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  基於檢索增強生成的智能文件助手
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs text-gray-500 font-medium mb-1">Token 統計</div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-600">{tokenStats.total_tokens.toLocaleString()} tokens</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-600">${tokenStats.total_cost_usd.toFixed(4)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">就緒</span>
            </div>
          </div>
        </div>
      </div>

      {/* 優化的三欄式佈局 */}
      <div className="h-[calc(100vh-70px)] p-4">
        <ResizablePanelGroup direction="horizontal" className="rounded-2xl overflow-hidden shadow-2xl bg-white/60 backdrop-blur-xl border border-white/20">
          {/* 左側欄：文件管理 */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-gradient-to-b from-white/90 to-gray-50/90 backdrop-blur-sm border-r border-gray-200/50">
              <div className="p-3 h-full overflow-hidden">
                <DocumentManager onSessionChange={handleSessionChange} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-1 bg-gradient-to-b from-blue-200 to-indigo-200 hover:from-blue-300 hover:to-indigo-300 transition-all duration-200" />

          {/* 中間欄：聊天界面 */}
          <ResizablePanel defaultSize={showSourcePreview ? 60 : 80} minSize={45}>
            <div className="h-full bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-sm relative">
              {showSourcePreview && (
                <div className="absolute top-2 right-2 z-10">
                  <button
                    onClick={() => setShowSourcePreview(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 bg-white/80 backdrop-blur-sm border border-gray-200"
                  >
                    關閉預覽
                  </button>
                </div>
              )}
              <div className="p-4 h-full">
                <ChatInterface onSourceClick={handleSourceClick} sessionId={currentSessionId} />
              </div>
            </div>
          </ResizablePanel>

          {showSourcePreview && (
            <>
              <ResizableHandle className="w-1 bg-gradient-to-b from-blue-200 to-indigo-200 hover:from-blue-300 hover:to-indigo-300 transition-all duration-200" />

              {/* 右側欄：來源預覽 */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                <div className="h-full bg-gradient-to-b from-white/90 to-gray-50/90 backdrop-blur-sm">
                  <div className="p-2 border-b border-gray-200/50 bg-white/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 text-emerald-600" />
                        <h2 className="font-medium text-gray-900 text-xs">來源預覽</h2>
                      </div>
                      <button
                        onClick={() => setShowSourcePreview(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-1 py-0.5 rounded hover:bg-gray-100"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="p-4 h-[calc(100%-36px)] overflow-hidden">
                    <SourcePreviewer selectedSource={selectedSource} />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  )
}