"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
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
  const taskId = params.taskId as string
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [mindmapGenerating, setMindmapGenerating] = useState(false)

  // 輪詢任務狀態
  useEffect(() => {
    if (!taskId || !isPolling) return

    const pollStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}`)
        if (response.ok) {
          const data = await response.json()
          setTaskStatus(data)
          
          if (data.status === "completed" || data.status === "failed") {
            setIsPolling(false)
          }
        }
      } catch (error) {
        console.error("輪詢錯誤:", error)
      }
    }

    pollStatus()
    const interval = setInterval(pollStatus, 3000)

    return () => clearInterval(interval)
  }, [taskId, isPolling])

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

  // 載入中狀態
  if (!taskStatus || taskStatus.status === "processing" || taskStatus.status === "queued") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="container mx-auto max-w-full px-4">
          {/* 全寬筆記骨架區域 */}
          <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-blue-600">📝</span>
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded w-32 animate-pulse"></div>
            </div>
            
            {/* 浮動心智圖骨架 */}
            <div className="absolute top-6 right-6 z-10 w-80 h-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">🧠</span>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="p-3 h-48">
                <MindMapSkeleton />
              </div>
            </div>
            
            {/* 筆記骨架內容 */}
            <div className="p-8 pr-96">
              <NoteSkeleton />
            </div>
          </div>
          
          {/* 進度指示器 */}
          <div className="fixed bottom-8 right-8 bg-white rounded-xl shadow-lg p-6 w-80">
            <ProgressIndicator stage="processing" />
            <div className="mt-4">
              <LoadingMessages />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (taskStatus.status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">處理失敗：{taskStatus.error}</p>
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