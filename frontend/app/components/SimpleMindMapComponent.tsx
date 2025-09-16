'use client'

import React from 'react'

interface SimpleMindMapProps {
  markdown: string
  width?: number
  height?: number
}

// 簡單的心智圖組件，避免使用有問題的 markmap 套件
export default function SimpleMindMapComponent({ markdown, width = 1200, height = 800 }: SimpleMindMapProps) {
  // 解析 markdown 為簡單的樹狀結構
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const nodes: any[] = []
    
    lines.forEach((line, index) => {
      const level = (line.match(/^#+/) || [''])[0].length
      const content = line.replace(/^#+\s*/, '').replace(/^-\s*/, '')
      
      if (content) {
        nodes.push({
          id: index,
          level,
          content,
          x: 100 + (level - 1) * 200,
          y: 100 + index * 60
        })
      }
    })
    
    return nodes
  }

  const nodes = parseMarkdown(markdown)

  return (
    <div className="w-full h-full flex justify-center items-center bg-white rounded-lg border overflow-auto">
      <svg width={width} height={height} className="rounded-lg">
        {/* 繪製節點 */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* 節點背景 */}
            <rect
              x={node.x - 5}
              y={node.y - 15}
              width={node.content.length * 8 + 20}
              height={30}
              rx={15}
              fill={node.level === 1 ? '#3b82f6' : node.level === 2 ? '#10b981' : '#8b5cf6'}
              opacity={0.1}
            />
            {/* 節點文字 */}
            <text
              x={node.x + 5}
              y={node.y + 5}
              fontSize={node.level === 1 ? '16' : '14'}
              fontWeight={node.level === 1 ? 'bold' : 'normal'}
              fill={node.level === 1 ? '#1e40af' : node.level === 2 ? '#059669' : '#7c3aed'}
            >
              {node.content}
            </text>
          </g>
        ))}
        
        {/* 繪製連接線 */}
        {nodes.map((node, index) => {
          const nextNode = nodes[index + 1]
          if (nextNode && nextNode.level > node.level) {
            return (
              <line
                key={`line-${index}`}
                x1={node.x + node.content.length * 4}
                y1={node.y}
                x2={nextNode.x - 10}
                y2={nextNode.y}
                stroke="#d1d5db"
                strokeWidth="2"
              />
            )
          }
          return null
        })}
      </svg>
    </div>
  )
}