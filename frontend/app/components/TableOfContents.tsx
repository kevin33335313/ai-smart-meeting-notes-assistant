"use client"

import { useState, useEffect } from 'react'
import { List, ChevronRight, ChevronDown } from 'lucide-react'

interface TableOfContentsProps {
  content: any[]
}

interface TocItem {
  id: string
  title: string
  level: number
  element?: HTMLElement
}

// 目錄導航組件
export default function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 生成目錄項目
  useEffect(() => {
    const items: TocItem[] = []
    
    content.forEach((block, index) => {
      if (block.type === 'heading_2') {
        const id = `heading-${index}`
        items.push({
          id,
          title: block.content.text,
          level: 2
        })
      }
    })
    
    setTocItems(items)
  }, [content])

  // 監聽滾動位置
  useEffect(() => {
    const handleScroll = () => {
      const headings = document.querySelectorAll('[id^="heading-"]')
      let currentActive = ''
      
      headings.forEach((heading) => {
        const rect = heading.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 0) {
          currentActive = heading.id
        }
      })
      
      setActiveId(currentActive)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 滾動到指定標題
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }

  if (tocItems.length === 0) return null

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* 標題列 */}
      <div 
        className="bg-white p-3 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">目錄</span>
        </div>
        {isCollapsed ? 
          <ChevronRight className="h-4 w-4 text-gray-600" /> : 
          <ChevronDown className="h-4 w-4 text-gray-600" />
        }
      </div>
      
      {/* 目錄列表 */}
      {!isCollapsed && (
        <div className="max-h-48 overflow-y-auto bg-white">
          {tocItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                activeId === item.id ? 'bg-blue-50 text-blue-700 border-l-2 border-l-blue-500' : 'text-gray-700'
              }`}
            >
              <div className="truncate" title={item.title}>
                {item.title}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}