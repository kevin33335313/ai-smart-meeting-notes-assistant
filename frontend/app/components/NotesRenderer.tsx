"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// 待辦事項介面
interface ActionItem {
  task: string
  owner: string
  due_date: string
}

// 內容區塊介面
interface ContentBlock {
  type: string
  content: any
}

// 筆記渲染組件
interface NotesRendererProps {
  notes: {
    content_blocks: ContentBlock[]
    action_items?: ActionItem[]
    mindmap_structure?: any
  }
}

export default function NotesRenderer({ notes }: NotesRendererProps) {
  // 渲染內容區塊
  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading_2':
        return <h2 key={index} className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">{block.content.text}</h2>
      case 'bullet_list':
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-700">
            {block.content.items.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      case 'callout':
        return (
          <div key={index} className={`p-4 rounded-lg mb-6 border-l-4 ${
            block.content.style === 'warning' ? 'bg-yellow-50 border-yellow-400' :
            block.content.style === 'success' ? 'bg-green-50 border-green-400' :
            'bg-blue-50 border-blue-400'
          }`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">{block.content.icon}</span>
              <p className="text-gray-700">{block.content.text}</p>
            </div>
          </div>
        )
      case 'toggle_list':
        return (
          <details key={index} className="mb-6 border border-gray-200 rounded-lg">
            <summary className="p-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50">
              {block.content.summary}
            </summary>
            <div className="p-4 pt-0 text-gray-700">
              {block.content.details}
            </div>
          </details>
        )
      case 'code':
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6 overflow-x-auto">
            <code className={`language-${block.content.language}`}>
              {block.content.text}
            </code>
          </pre>
        )
      default:
        return null
    }
  }

  // 渲染待辦事項
  const renderActionItems = (items: ActionItem[]) => {
    if (!items || items.length === 0) return null

    return (
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
          ✅ 待辦事項 ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-3 bg-white border border-gray-200 rounded-md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.task}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>👤 {item.owner}</span>
                    <span>📅 {item.due_date}</span>
                  </div>
                </div>
                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* 渲染內容區塊 */}
      {notes.content_blocks.map((block, index) => renderContentBlock(block, index))}
      
      {/* 渲染待辦事項 */}
      {renderActionItems(notes.action_items || [])}
    </div>
  )
}