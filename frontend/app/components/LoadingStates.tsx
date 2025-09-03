"use client"

import { useState, useEffect } from 'react'

// 骨架屏組件
export function NoteSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* 標題骨架 */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
        <div className="h-px bg-gray-200 w-full"></div>
      </div>
      
      {/* 引言框骨架 */}
      <div className="p-5 bg-gray-100 rounded-xl border-l-4 border-gray-200">
        <div className="flex gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      
      {/* 列表骨架 */}
      <div className="space-y-3 ml-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
      
      {/* 折疊區塊骨架 */}
      <div className="border border-gray-200 rounded-lg">
        <div className="p-4 bg-gray-50">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  )
}

// 心智圖骨架
export function MindMapSkeleton() {
  return (
    <div className="h-full bg-gray-50 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
          <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
        </div>
        {/* 連接線 */}
        <div className="flex justify-center space-x-8">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

// 進度指示器
interface ProgressIndicatorProps {
  stage: 'uploading' | 'processing' | 'analyzing' | 'generating'
}

export function ProgressIndicator({ stage }: ProgressIndicatorProps) {
  const stages = [
    { key: 'uploading', label: '上傳音頻檔案', icon: '📤' },
    { key: 'processing', label: 'AI 聆聽分析', icon: '🎧' },
    { key: 'analyzing', label: '內容理解中', icon: '🧠' },
    { key: 'generating', label: '生成筆記', icon: '📝' }
  ]
  
  const currentIndex = stages.findIndex(s => s.key === stage)
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {stages.map((stageItem, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isPending = index > currentIndex
          
          return (
            <div key={stageItem.key} className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isActive ? 'bg-blue-500 text-white animate-pulse' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                {isCompleted ? '✓' : stageItem.icon}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive ? 'text-blue-600' : isPending ? 'text-gray-400' : 'text-gray-700'}`}>
                  {stageItem.label}
                </p>
                {isActive && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 動態載入訊息
export function LoadingMessages() {
  const messages = [
    "AI 正在仔細聆聽您的會議內容...",
    "分析討論重點和關鍵決策...",
    "整理行動項目和待辦事項...",
    "生成結構化筆記...",
    "準備心智圖視覺化..."
  ]
  
  const [currentMessage, setCurrentMessage] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [messages.length])
  
  return (
    <div className="text-center h-6 flex items-center justify-center">
      <p className="text-gray-600 animate-fade-in-out w-full">
        {messages[currentMessage]}
      </p>
    </div>
  )
}