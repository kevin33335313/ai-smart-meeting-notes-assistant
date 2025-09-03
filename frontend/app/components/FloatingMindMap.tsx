"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import MindMapPreview from './MindMapPreview'

interface FloatingMindMapProps {
  data: any
  taskId?: string
}

// 可拖拽的浮動心智圖組件
export default function FloatingMindMap({ data, taskId }: FloatingMindMapProps) {
  const [isHidden, setIsHidden] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState(taskId)



  // 當taskId變化時重置狀態
  useEffect(() => {
    if (taskId !== currentTaskId) {
      setIsHidden(false)
      setCurrentTaskId(taskId)
    }
  }, [taskId, currentTaskId])

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="fixed top-6 right-6 z-20 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-colors"
        title="顯示心智圖"
      >
        🧠
      </button>
    )
  }

  return (
    <div className="absolute top-6 right-6 z-10 w-80 h-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* 標題列 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-purple-600">🧠</span>
          <h3 className="text-sm font-bold text-gray-800">心智圖</h3>
        </div>
        
        <Button
          onClick={() => setIsHidden(true)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-100"
          title="隱藏"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      {/* 內容區域 */}
      <div className="p-3 h-48">
        {data ? (
          <MindMapPreview data={data} taskId={taskId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p>生成中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}