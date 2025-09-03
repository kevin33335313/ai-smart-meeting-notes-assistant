"use client"

import { useState } from 'react'
import { Maximize2, Eye } from 'lucide-react'
import { Button } from '../../components/ui/button'
import ReactFlowMindMap from './ReactFlowMindMap'
import SimpleMindMap from './SimpleMindMap'

interface MindMapPreviewProps {
  data: any
  taskId?: string
}

// 心智圖預覽組件 - 專為30%寬度設計
export default function MindMapPreview({ data, taskId }: MindMapPreviewProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)



  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        <div className="text-center">
          <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>心智圖生成中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 緊湊預覽模式 */}
      <div className="relative h-full">
        <Button
          onClick={() => setShowFullscreen(true)}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
          title="展開心智圖"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        
        <div className="h-full rounded-lg overflow-hidden">
          {data.nodes ? (
            <ReactFlowMindMap data={data} />
          ) : (
            <SimpleMindMap data={data} />
          )}
        </div>
      </div>

      {/* 全螢幕模式 */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-white">
          <Button
            onClick={() => setShowFullscreen(false)}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
            title="收合心智圖"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          
          <div className="h-full w-full">
            {data.nodes ? (
              <ReactFlowMindMap data={data} />
            ) : (
              <SimpleMindMap data={data} />
            )}
          </div>
        </div>
      )}
    </>
  )
}