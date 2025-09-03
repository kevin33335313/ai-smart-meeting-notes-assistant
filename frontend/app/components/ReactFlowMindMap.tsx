"use client"

import { useEffect, useMemo, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { CustomNode } from './mindmap/CustomNode'
import { CustomEdge } from './mindmap/CustomEdge'
import { useMindMapLayout } from '../hooks/useMindMapLayout'
import { Maximize2, Minimize2, X } from 'lucide-react'
import { Button } from '../../components/ui/button'

// 註冊自定義節點和邊線類型
const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
  straight: 'straight',
};

// React Flow 心智圖數據介面
interface ReactFlowMindMapData {
  nodes: Array<{
    id: string
    data: {
      label: string
      level: number
      direction?: 'left' | 'right'
      color?: string
      icon?: string
    }
    position: { x: number; y: number }
  }>
  edges: Array<{
    id: string
    source: string
    target: string
  }>
}

interface ReactFlowMindMapProps {
  data: ReactFlowMindMapData
}



// React Flow 心智圖組件
export default function ReactFlowMindMap({ data }: ReactFlowMindMapProps) {
  // 全螢幕狀態管理
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // 使用自定義佈局 hook
  const { layoutedNodes, layoutedEdges } = useMindMapLayout(data.nodes, data.edges)
  
  // 轉換為 React Flow 格式並設定自定義節點和邊線類型
  const reactFlowNodes: Node[] = useMemo(() => 
    layoutedNodes.map(node => ({
      ...node,
      type: 'custom',
    })), [layoutedNodes]
  )
  
  const reactFlowEdges = useMemo(() => 
    layoutedEdges.map(edge => ({
      ...edge,
      type: 'custom',
    })), [layoutedEdges]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

  // 當數據變化時更新節點和邊線
  useEffect(() => {
    setNodes(reactFlowNodes)
    setEdges(reactFlowEdges)
  }, [reactFlowNodes, reactFlowEdges, setNodes, setEdges])

  // 處理 ESC 鍵退出全螢幕
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  // 切換全螢幕狀態
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <>
      {/* 緊湊模式 */}
      <div className="relative h-full w-full border rounded-lg bg-white">
        {/* 展開按鈕 */}
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white"
          title="展開心智圖"
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 0.8 }}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
        >
          <Background color="#f1f5f9" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      {/* 全螢幕模式 */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* 全螢幕工具列 */}
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white"
            title="收合心智圖"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.1, maxZoom: 2 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            className="h-full w-full"
          >
            <Background color="#f1f5f9" gap={20} />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </>
  )
}