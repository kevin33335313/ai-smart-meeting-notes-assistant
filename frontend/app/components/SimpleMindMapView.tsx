"use client"

import { useState, useEffect } from "react"
import { RefreshCw, Image } from "lucide-react"

interface MindMapNode {
  id: string
  label: string
  level: number
  color: string
  children?: MindMapNode[]
}

interface SimpleMindMapViewProps {
  taskId: string
}

export default function SimpleMindMapView({ taskId }: SimpleMindMapViewProps) {
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pngMindMapUrl, setPngMindMapUrl] = useState<string | null>(null)
  const [isGeneratingPng, setIsGeneratingPng] = useState(false)
  const [showPngView, setShowPngView] = useState(false)

  useEffect(() => {
    // 獲取markdown心智圖並轉換為簡單的樹狀結構
    const fetchAndParseMindMap = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/markdown-mindmap`)
        if (response.ok) {
          const data = await response.json()
          const parsed = parseMarkdownToMindMap(data.markdown_mindmap)
          setMindMapData(parsed)
        }
      } catch (error) {
        console.error("獲取心智圖失敗:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndParseMindMap()
  }, [taskId])

  // 生成 PNG 心智圖
  const generatePngMindMap = async () => {
    setIsGeneratingPng(true)
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/regenerate-mindmap`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        const imageUrl = `http://localhost:8000${data.png_path}?t=${data.timestamp}`
        setPngMindMapUrl(imageUrl)
        setShowPngView(true)
      } else {
        console.error('生成 PNG 心智圖失敗')
      }
    } catch (error) {
      console.error('生成 PNG 心智圖錯誤:', error)
    } finally {
      setIsGeneratingPng(false)
    }
  }

  const parseMarkdownToMindMap = (markdown: string): MindMapNode => {
    const lines = markdown.split('\n').filter(line => line.trim())
    const root: MindMapNode = {
      id: 'root',
      label: '會議心智圖',
      level: 0,
      color: '#3b82f6',
      children: []
    }

    let currentH2: MindMapNode | null = null
    const colors = ['#16a34a', '#dc2626', '#ca8a04', '#9333ea', '#c2410c']
    let colorIndex = 0

    for (const line of lines) {
      if (line.startsWith('# ')) {
        root.label = line.replace('# ', '').trim()
      } else if (line.startsWith('## ')) {
        currentH2 = {
          id: `h2-${colorIndex}`,
          label: line.replace('## ', '').trim(),
          level: 1,
          color: colors[colorIndex % colors.length],
          children: []
        }
        root.children!.push(currentH2)
        colorIndex++
      } else if (line.startsWith('**') && line.endsWith('**') && currentH2) {
        const label = line.replace(/\*\*/g, '').trim()
        if (label && !label.includes('：')) {
          currentH2.children!.push({
            id: `item-${Date.now()}-${Math.random()}`,
            label,
            level: 2,
            color: currentH2.color
          })
        }
      }
    }

    return root
  }

  const renderNode = (node: MindMapNode, isRoot = false) => {
    if (isRoot) {
      return (
        <div className="flex flex-col items-center">
          <div 
            className="px-6 py-3 rounded-2xl text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: node.color }}
          >
            {node.label}
          </div>
          <div className="flex mt-8 gap-12">
            {node.children?.slice(0, Math.ceil(node.children.length / 2)).map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {renderBranch(child, 'left')}
              </div>
            ))}
            {node.children?.slice(Math.ceil(node.children.length / 2)).map(child => (
              <div key={child.id} className="flex flex-col items-center">
                {renderBranch(child, 'right')}
              </div>
            ))}
          </div>
        </div>
      )
    }
  }

  const renderBranch = (node: MindMapNode, side: 'left' | 'right') => {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="px-4 py-2 rounded-lg bg-white border-2 font-medium shadow-md"
          style={{ borderColor: node.color, color: node.color }}
        >
          {node.label}
        </div>
        {node.children && node.children.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {node.children.map(child => (
              <div 
                key={child.id}
                className="px-3 py-1 rounded-md bg-gray-50 border text-sm"
                style={{ borderColor: node.color }}
              >
                {child.label}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">生成心智圖中...</p>
        </div>
      </div>
    )
  }

  if (!mindMapData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">無法生成心智圖</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 控制按鈕 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b p-4 flex gap-2">
        <button
          onClick={generatePngMindMap}
          disabled={isGeneratingPng}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isGeneratingPng ? 'animate-spin' : ''}`} />
          {isGeneratingPng ? '生成中...' : '重新生成 PNG 心智圖'}
        </button>
        
        {pngMindMapUrl && (
          <button
            onClick={() => setShowPngView(!showPngView)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Image className="h-4 w-4" />
            {showPngView ? '顯示互動版' : '顯示 PNG 版'}
          </button>
        )}
      </div>

      {/* 心智圖內容 */}
      <div className="p-8">
        {showPngView && pngMindMapUrl ? (
          <div className="flex justify-center">
            <img 
              src={pngMindMapUrl} 
              alt="PNG 心智圖" 
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            />
          </div>
        ) : (
          <div className="min-h-full flex items-center justify-center">
            {renderNode(mindMapData, true)}
          </div>
        )}
      </div>
    </div>
  )
}