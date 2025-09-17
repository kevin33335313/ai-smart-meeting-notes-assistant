"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { X, RefreshCw, AlertTriangle, Wifi, WifiOff, ArrowLeft, Zap, FileText } from "lucide-react"
import Link from "next/link"
import MindMap from "../../components/MindMap"
import SimpleMindMap from "../../components/SimpleMindMap"
import ReactFlowMindMap from "../../components/ReactFlowMindMap"
import MindMapGenerator from "../../components/MindMapGenerator"
import NotesRenderer from "../../components/NotesRenderer"
import { BlockRenderer } from "../../components/BlockRenderer"
import MindMapPreview from "../../components/MindMapPreview"
import FloatingMindMap from "../../components/FloatingMindMap"
import ContentActions from "../../components/ContentActions"
import TableOfContents from "../../components/TableOfContents"
import { NoteSkeleton, MindMapSkeleton, ProgressIndicator, LoadingMessages } from "../../components/LoadingStates"

// 任務狀態介面
interface TaskResult {
  summary?: string
  key_decisions?: string[]
  action_items?: Array<{
    task: string
    owner: string
    due_date: string
  }>
  content_blocks?: Array<{
    type: string
    content: any
  }>
  mindmap_structure?: any
}

interface TaskStatus {
  task_id: string
  status: string
  filename?: string
  result?: TaskResult
  error?: string
}

// 結果頁面組件
export default function NotesPage() {
  const params = useParams()
  const router = useRouter()
  const taskId = params.taskId as string
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [mindmapGenerating, setMindmapGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('uploading')
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [fileInfo, setFileInfo] = useState<{name: string, size: number, duration?: number} | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const [isCancelling, setIsCancelling] = useState(false)

  // 網路狀態監控
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 進度追蹤
  useEffect(() => {
    if (!taskStatus) return
    
    const elapsed = Date.now() - startTimeRef.current
    let progressValue = 0
    let stageValue = 'uploading'
    let estimatedTotal = 120000
    
    switch (taskStatus.status) {
      case 'queued':
        progressValue = 15
        stageValue = 'uploading'
        estimatedTotal = 100000
        break
      case 'processing':
        progressValue = Math.min(85, 25 + (elapsed / 60000) * 60) // 25-85% 在60秒內
        stageValue = elapsed < 20000 ? 'processing' : elapsed < 40000 ? 'analyzing' : 'generating'
        estimatedTotal = Math.max(10000, 90000 - elapsed)
        break
      case 'completed':
        progressValue = 100
        stageValue = 'generating'
        estimatedTotal = 0
        break
      case 'failed':
        progressValue = 0
        break
    }
    
    setProgress(progressValue)
    setCurrentStage(stageValue)
    setEstimatedTime(estimatedTotal)
  }, [taskStatus])

  // 輪詢任務狀態
  useEffect(() => {
    if (!taskId || !isPolling || !isOnline) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}`)
        if (response.ok) {
          const data = await response.json()
          console.log('任務狀態:', data) // 調試用
          setTaskStatus(data)
          setRetryCount(0)
          
          // 獲取檔案資訊
          if (data.filename && !fileInfo) {
            setFileInfo({
              name: data.filename,
              size: data.file_size || Math.random() * 10 * 1024 * 1024,
              duration: data.duration || Math.random() * 3600
            })
          }
          
          if (data.status === "completed" || data.status === "failed") {
            setIsPolling(false)
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error("輪詢錯誤:", error)
        setRetryCount(prev => prev + 1)
        if (retryCount >= 3) {
          setIsPolling(false)
          setTaskStatus(prev => prev ? {...prev, status: 'failed', error: '網路連線失敗'} : null)
        }
      }
    }

    pollStatus()
    const interval = setInterval(pollStatus, isOnline ? 1500 : 5000)

    return () => clearInterval(interval)
  }, [taskId, isPolling, isOnline, retryCount, fileInfo])

  // 自動生成心智圖
  useEffect(() => {
    if (taskStatus?.status === 'completed' && 
        taskStatus.result?.content_blocks && 
        !taskStatus.result.mindmap_structure && 
        !mindmapGenerating) {
      
      setMindmapGenerating(true)
      
      const generateMindmap = async () => {
        try {
          const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/mindmap`, {
            method: 'POST',
          })
          
          if (response.ok) {
            const data = await response.json()
            setTaskStatus(prev => prev ? {
              ...prev,
              result: prev.result ? {
                ...prev.result,
                mindmap_structure: data.mindmap
              } : prev.result
            } : prev)
          }
        } catch (error) {
          console.error('心智圖生成錯誤:', error)
        } finally {
          setMindmapGenerating(false)
        }
      }
      
      generateMindmap()
    }
  }, [taskStatus, taskId, mindmapGenerating])

  // 取消處理
  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await fetch(`http://localhost:8000/api/v1/notes/${taskId}`, { method: 'DELETE' })
      router.push('/tools/meeting-notes')
    } catch (error) {
      console.error('取消失敗:', error)
    } finally {
      setIsCancelling(false)
    }
  }

  // 重試處理
  const handleRetry = () => {
    setIsPolling(true)
    setRetryCount(0)
    startTimeRef.current = Date.now()
  }

  // 音頻波形組件
  const AudioWaveform = () => {
    const [waveData, setWaveData] = useState<Array<{height: number, delay: number, duration: number}>>([])
    
    useEffect(() => {
      // 客戶端生成隨機數據
      const data = [...Array(20)].map((_, i) => ({
        height: Math.random() * 40 + 10,
        delay: i * 0.1,
        duration: 0.8 + Math.random() * 0.4
      }))
      setWaveData(data)
    }, [])
    
    if (waveData.length === 0) {
      return (
        <div className="flex items-center justify-center gap-1 h-16">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="w-1 h-6 bg-gray-300 rounded-full" />
          ))}
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center gap-1 h-16">
        {waveData.map((wave, i) => (
          <div
            key={i}
            className="w-1 bg-gradient-to-t from-blue-400 to-blue-600 rounded-full animate-pulse"
            style={{
              height: `${wave.height}px`,
              animationDelay: `${wave.delay}s`,
              animationDuration: `${wave.duration}s`
            }}
          />
        ))}
      </div>
    )
  }

  // 載入中狀態
  if (!taskStatus || (taskStatus.status !== "completed" && taskStatus.status !== "failed")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* 導航按鈕 */}
          <div className="flex gap-4 mb-6">
            <Link href="/">
              <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-indigo-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  <ArrowLeft className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  工具箱
                </span>
                <div className="text-yellow-500">
                  <Zap className="h-3 w-3" />
                </div>
              </div>
            </Link>
            <Link href="/tools/meeting-notes">
              <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-green-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                  <FileText className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  筆記總覽
                </span>
              </div>
            </Link>
          </div>
          
          {/* 頂部控制欄 */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <span className="text-sm text-gray-600">
                {isOnline ? '連線正常' : '網路中斷'}
                {retryCount > 0 && ` (重試 ${retryCount}/3)`}
              </span>
            </div>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              {isCancelling ? '取消中...' : '取消處理'}
            </button>
          </div>

          {/* 主要處理區域 */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* 檔案資訊區 */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">AI 智能分析中</h1>
                  {fileInfo && (
                    <div className="space-y-1 text-blue-100">
                      <p>檔案：{fileInfo.name}</p>
                      <p>大小：{(fileInfo.size / 1024 / 1024).toFixed(1)} MB</p>
                      {fileInfo.duration && (
                        <p>時長：{Math.floor(fileInfo.duration / 60)}:{String(Math.floor(fileInfo.duration % 60)).padStart(2, '0')}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{Math.round(progress)}%</div>
                  {estimatedTime > 1000 && (
                    <div className="text-sm text-blue-200">
                      預估剩餘：{Math.ceil(estimatedTime / 1000)}秒
                    </div>
                  )}
                  <div className="text-xs text-blue-300 mt-1">
                    狀態：{taskStatus?.status || '處理中'}
                  </div>
                </div>
              </div>
              
              {/* 進度條 */}
              <div className="mt-6">
                <div className="bg-blue-400/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-200 mt-2">
                  <span>開始</span>
                  <span>{Math.round(progress)}%</span>
                  <span>完成</span>
                </div>
              </div>
            </div>

            {/* 音頻波形區 */}
            <div className="p-8 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
              {/* 背景動畫 */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="relative z-10 text-center mb-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xl">🎧</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">AI 正在聆聽分析</h3>
                    <p className="text-sm text-gray-500">深度理解會議內容</p>
                  </div>
                </div>
              </div>
              <AudioWaveform />
              
              {/* 處理提示 */}
              <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  語音識別
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  內容分析
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  結構化處理
                </div>
              </div>
            </div>

            {/* 處理步驟 */}
            <div className="p-8 bg-white">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">處理進度</h4>
                  <p className="text-sm text-gray-600">AI 正在執行多階段智能分析</p>
                </div>
                <ProgressIndicator stage={currentStage as any} />
              </div>
            </div>

            {/* 動態訊息 */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-purple-100/20 animate-pulse"></div>
              <div className="relative z-10">
                <LoadingMessages />
              </div>
              
              {/* 底部裝飾 */}
              <div className="flex justify-center mt-4 gap-2">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{animationDelay: `${i * 0.2}s`}}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 網路狀態提示 */}
          {!isOnline && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-amber-800 font-medium">網路連線中斷</p>
                <p className="text-amber-700 text-sm">處理將在網路恢復後繼續</p>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                重試
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (taskStatus.status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* 導航按鈕 */}
          <div className="flex gap-4 mb-6">
            <Link href="/">
              <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-indigo-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                  <ArrowLeft className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  工具箱
                </span>
                <div className="text-yellow-500">
                  <Zap className="h-3 w-3" />
                </div>
              </div>
            </Link>
            <Link href="/tools/meeting-notes">
              <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-green-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
                <div className="p-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                  <FileText className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  筆記總覽
                </span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">處理失敗</h2>
            <p className="text-gray-600 mb-6">{taskStatus.error || '未知錯誤，請重試'}</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/tools/meeting-notes')}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                返回列表
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新處理
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 完成狀態 - 顯示結果
  const result = taskStatus.result
  if (!result) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-full px-4">
        {/* 導航按鈕 */}
        <div className="flex gap-4 mb-6">
          <Link href="/">
            <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-indigo-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
              <div className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                <ArrowLeft className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                工具箱
              </span>
              <div className="text-yellow-500">
                <Zap className="h-3 w-3" />
              </div>
            </div>
          </Link>
          <Link href="/tools/meeting-notes">
            <div className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-green-500/10 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-green-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer">
              <div className="p-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <FileText className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                筆記總覽
              </span>
            </div>
          </Link>
        </div>
        
        {/* 全寬筆記區域 */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="text-blue-600">📝</span>
              會議洞察筆記
            </h2>
            <p className="text-gray-600 text-sm">由 AI 智能分析生成 • 點擊區塊可展開詳細內容</p>
          </div>
          
          {/* 浮動心智圖視窗 */}
          <FloatingMindMap 
            key={taskId}
            data={result.mindmap_structure} 
            taskId={taskId}
          />
          

          
          {/* 筆記內容區域 */}
          <div className="p-8 pr-96">
            {/* 目錄導航 */}
            {result.content_blocks && Array.isArray(result.content_blocks) && (
              <div className="mb-8">
                <TableOfContents content={result.content_blocks} />
              </div>
            )}
            
            {result.content_blocks && Array.isArray(result.content_blocks) ? (
              <BlockRenderer blocks={result.content_blocks} />
            ) : (
              <NotesRenderer 
                summary={result.summary}
                keyDecisions={result.key_decisions}
                actionItems={result.action_items}
              />
            )}
          </div>
          
          {/* 內容操作工具欄 */}
          {result.content_blocks && Array.isArray(result.content_blocks) && (
            <ContentActions content={result.content_blocks} taskId={taskId} />
          )}
        </div>
      </div>
    </div>
  )
}