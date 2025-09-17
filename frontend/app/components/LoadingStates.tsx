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
    { key: 'uploading', label: '上傳音頻檔案', icon: '📤', description: '檔案上傳至伺服器' },
    { key: 'processing', label: 'AI 聆聽分析', icon: '🎧', description: '轉換音頻為文字' },
    { key: 'analyzing', label: '內容理解中', icon: '🧠', description: '分析會議重點與決策' },
    { key: 'generating', label: '生成筆記', icon: '📝', description: '結構化筆記與心智圖' }
  ]
  
  const currentIndex = stages.findIndex(s => s.key === stage)
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="space-y-6">
        {stages.map((stageItem, index) => {
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          const isPending = index > currentIndex
          
          return (
            <div key={stageItem.key} className="relative">
              <div className="flex items-center gap-4">
                <div className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-500
                  ${isCompleted ? 'bg-green-500 text-white shadow-lg scale-110' : ''}
                  ${isActive ? 'bg-blue-500 text-white animate-pulse shadow-lg shadow-blue-500/50' : ''}
                  ${isPending ? 'bg-gray-200 text-gray-400' : ''}
                `}>
                  {isCompleted ? '✓' : stageItem.icon}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-lg transition-colors ${
                    isActive ? 'text-blue-600' : 
                    isPending ? 'text-gray-400' : 
                    'text-green-600'
                  }`}>
                    {stageItem.label}
                  </p>
                  <p className={`text-sm transition-colors ${
                    isActive ? 'text-blue-500' : 
                    isPending ? 'text-gray-400' : 
                    'text-green-500'
                  }`}>
                    {stageItem.description}
                  </p>
                  {isActive && (
                    <div className="w-full bg-blue-100 rounded-full h-2 mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full animate-pulse" 
                           style={{ width: '70%', animation: 'progress 2s ease-in-out infinite' }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 連接線 */}
              {index < stages.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-6 transition-colors ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
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
    { text: "AI 正在仔細聆聽您的會議內容...", icon: "🎧" },
    { text: "識別語音中的關鍵詞彙和語調...", icon: "🔍" },
    { text: "分析討論重點和關鍵決策...", icon: "🧠" },
    { text: "整理行動項目和待辦事項...", icon: "✅" },
    { text: "生成結構化筆記和摘要...", icon: "📝" },
    { text: "準備心智圖視覺化...", icon: "🗺️" }
  ]
  
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentMessage(prev => (prev + 1) % messages.length)
        setIsVisible(true)
      }, 300)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [messages.length])
  
  return (
    <div className="text-center h-16 flex items-center justify-center">
      <div className={`transition-all duration-300 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl animate-bounce">{messages[currentMessage].icon}</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-600 font-medium">
          {messages[currentMessage].text}
        </p>
      </div>
    </div>
  )
}