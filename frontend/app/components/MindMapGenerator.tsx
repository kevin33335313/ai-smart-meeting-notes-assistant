"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

// 心智圖生成器組件
interface MindMapGeneratorProps {
  taskId: string
  onMindMapGenerated: (mindmap: any) => void
}

export default function MindMapGenerator({ taskId, onMindMapGenerated }: MindMapGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState(taskId)

  // 當taskId變化時重置狀態
  useEffect(() => {
    if (taskId !== currentTaskId) {
      setIsGenerating(false)
      setCurrentTaskId(taskId)
    }
  }, [taskId, currentTaskId])

  const handleGenerateMindMap = async () => {
    // 確保只有當前的taskId可以生成
    if (taskId !== currentTaskId) return
    
    setIsGenerating(true)
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/mindmap`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        // 再次確認是當前taskId才回調
        if (taskId === currentTaskId) {
          onMindMapGenerated(data.mindmap)
        }
      } else {
        console.error('心智圖生成失敗:', response.status)
      }
    } catch (error) {
      console.error('心智圖生成錯誤:', error)
    } finally {
      // 只有當前taskId才更新狀態
      if (taskId === currentTaskId) {
        setIsGenerating(false)
      }
    }
  }

  return (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300">
      <div className="text-center">
        <div className="text-6xl mb-4">🧠</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">心智圖視覺化</h3>
        <p className="text-gray-500 mb-6">點擊按鈕生成互動式心智圖</p>
        <Button 
          onClick={handleGenerateMindMap}
          disabled={isGenerating}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成中...
            </>
          ) : (
            '🎨 生成心智圖'
          )}
        </Button>
      </div>
    </div>
  )
}