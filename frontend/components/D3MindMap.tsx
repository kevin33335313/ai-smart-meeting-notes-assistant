'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface MindMapNode {
  id: string
  label: string
  level: number
  color?: string
  children?: MindMapNode[]
}

interface D3MindMapProps {
  data: MindMapNode
  width?: number
  height?: number
}

export default function D3MindMap({ data, width = 1200, height = 800 }: D3MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    // 清除之前的內容
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // 創建主容器群組
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    // 顏色配置
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    
    // 轉換數據結構為 D3 hierarchy
    const root = d3.hierarchy(data)
    
    // 計算節點位置
    const angleStep = (2 * Math.PI) / (root.children?.length || 1)
    const mainRadius = 200
    const subRadius = 120

    // 繪製中央節點
    g.append('rect')
      .attr('x', -120)
      .attr('y', -25)
      .attr('width', 240)
      .attr('height', 50)
      .attr('rx', 8)
      .attr('fill', '#2C3E50')
      .attr('stroke', '#34495E')
      .attr('stroke-width', 2)

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Microsoft YaHei, SimHei, Arial, sans-serif')
      .text(data.label)

    // 繪製主分支和子節點
    root.children?.forEach((branch, i) => {
      const angle = i * angleStep - Math.PI / 2 // 從頂部開始
      const x = Math.cos(angle) * mainRadius
      const y = Math.sin(angle) * mainRadius
      const color = colors[i % colors.length]

      // 主分支連線
      g.append('path')
        .attr('d', `M 0,0 Q ${x * 0.5},${y * 0.5} ${x},${y}`)
        .attr('stroke', color)
        .attr('stroke-width', 4)
        .attr('fill', 'none')

      // 主分支節點
      const branchGroup = g.append('g')
        .attr('transform', `translate(${x}, ${y})`)

      branchGroup.append('rect')
        .attr('x', -60)
        .attr('y', -20)
        .attr('width', 120)
        .attr('height', 40)
        .attr('rx', 6)
        .attr('fill', color)
        .attr('stroke', d3.color(color)?.darker(0.3)?.toString() || color)
        .attr('stroke-width', 2)

      branchGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '13px')
        .attr('font-weight', '500')
        .attr('font-family', 'Microsoft YaHei, SimHei, Arial, sans-serif')
        .text(branch.data.label)

      // 子節點
      branch.children?.forEach((child, j) => {
        const subAngle = angle + (j - (branch.children!.length - 1) / 2) * 0.3
        const subX = Math.cos(subAngle) * subRadius
        const subY = Math.sin(subAngle) * subRadius
        const lightColor = d3.color(color)?.brighter(1.5)?.toString() || '#f0f0f0'

        // 子節點連線
        g.append('path')
          .attr('d', `M ${x},${y} Q ${x + subX * 0.5},${y + subY * 0.5} ${x + subX},${y + subY}`)
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('fill', 'none')

        // 子節點
        const childGroup = g.append('g')
          .attr('transform', `translate(${x + subX}, ${y + subY})`)

        childGroup.append('ellipse')
          .attr('rx', 50)
          .attr('ry', 20)
          .attr('fill', lightColor)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)

        childGroup.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .attr('fill', '#2C3E50')
          .attr('font-size', '11px')
          .attr('font-family', 'Microsoft YaHei, SimHei, Arial, sans-serif')
          .text(child.data.label)
      })
    })

  }, [data, width, height])

  return (
    <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-lg">
      <svg ref={svgRef} className="border border-gray-200 rounded-lg bg-white shadow-sm" />
    </div>
  )
}