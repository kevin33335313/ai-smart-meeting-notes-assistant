"use client"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// 筆記渲染組件
interface NotesRendererProps {
  summary?: string
  keyDecisions?: string[]
  actionItems?: Array<{
    task: string
    owner: string
    due_date: string
  }>
}

export default function NotesRenderer({ summary, keyDecisions, actionItems }: NotesRendererProps) {
  // 生成專業的 Markdown 格式筆記
  const generateMarkdown = () => {
    let markdown = `## 📋 智慧摘要\n\n${summary || '暫無摘要'}\n\n`
    
    markdown += `## 🎯 關鍵決策\n\n`
    if (keyDecisions && keyDecisions.length > 0) {
      keyDecisions.forEach((decision, index) => {
        markdown += `${index + 1}. **${decision}**\n`
      })
    } else {
      markdown += '暫無關鍵決策\n'
    }
    markdown += '\n'
    
    markdown += `## ✅ 待辦事項\n\n`
    if (actionItems && actionItems.length > 0) {
      markdown += '| 任務 | 負責人 | 截止日期 |\n'
      markdown += '|------|--------|----------|\n'
      actionItems.forEach(item => {
        markdown += `| ${item.task} | ${item.owner} | ${item.due_date} |\n`
      })
    } else {
      markdown += '暫無待辦事項\n'
    }
    
    return markdown
  }

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-2">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-6">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-800">{children}</strong>
          ),
        }}
      >
        {generateMarkdown()}
      </ReactMarkdown>
    </div>
  )
}