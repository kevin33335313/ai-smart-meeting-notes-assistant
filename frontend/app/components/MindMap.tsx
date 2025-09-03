"use client"

import { useEffect, useRef } from 'react'
import { Markmap } from 'markmap-view'
import { Transformer } from 'markmap-lib'

// 心智圖節點介面
interface MindMapNode {
  name: string
  children?: MindMapNode[]
}

interface MindMapProps {
  data: MindMapNode
}

// 將樹狀結構轉換為 Markdown
function convertToMarkdown(data: MindMapNode, level = 1): string {
  const prefix = '#'.repeat(level)
  let markdown = `${prefix} ${data.name}\n`
  
  if (data.children) {
    data.children.forEach(child => {
      markdown += convertToMarkdown(child, level + 1)
    })
  }
  
  return markdown
}

// 專業心智圖組件
export default function MindMap({ data }: MindMapProps) {
  const refSvg = useRef<SVGSVGElement>(null)
  const refMm = useRef<Markmap>()

  useEffect(() => {
    const loadMarkmap = async () => {
      if (!refSvg.current) return

      try {
        const transformer = new Transformer()
        const markdown = convertToMarkdown(data)
        const { root } = transformer.transform(markdown)

        if (!refMm.current) {
          refMm.current = Markmap.create(refSvg.current, {
            colorFreezeLevel: 2,
            duration: 500,
            maxWidth: 300,
            initialExpandLevel: 3,
            paddingX: 8,
            spacingHorizontal: 80,
            spacingVertical: 20,
          })
        }

        refMm.current.setData(root)
        refMm.current.fit()
      } catch (error) {
        console.error('Markmap 載入錯誤:', error)
      }
    }

    loadMarkmap()
  }, [data])

  return (
    <div className="h-96 w-full border rounded-lg bg-white relative">
      <svg
        ref={refSvg}
        className="w-full h-full"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
        }}
      />
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          載入心智圖中...
        </div>
      )}
    </div>
  )
}