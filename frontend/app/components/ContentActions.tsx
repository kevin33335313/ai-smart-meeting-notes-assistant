"use client"

import { useState } from 'react'
import { Copy, Download, Share2, Check, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button'

interface ContentActionsProps {
  content: any[]
  taskId: string
}

// 內容操作工具欄
export default function ContentActions({ content, taskId }: ContentActionsProps) {
  const [copied, setCopied] = useState(false)

  // 處理toggle區塊的details內容
  const processToggleDetails = (details: any): string => {
    if (typeof details === 'string') {
      return details
    }
    
    if (Array.isArray(details)) {
      return details.map(item => {
        if (item?.type === 'bullet_list' && item?.content?.items) {
          return item.content.items.map((listItem: string) => `  • ${listItem}`).join('\n')
        }
        if (typeof item === 'string') {
          return item
        }
        return JSON.stringify(item)
      }).join('\n')
    }
    
    return JSON.stringify(details)
  }

  // 將內容轉換為純文本
  const convertToText = () => {
    return content.map(block => {
      switch (block.type) {
        case 'heading_2':
          return `## ${block.content.text}\n\n`
        case 'bullet_list':
          return block.content.items.map((item: string) => {
            // 處理雙星號子標題
            if (item.startsWith('**') && item.includes('**') && item.length > 4) {
              const cleanTitle = item.replace(/\*\*(.*?)\*\*/g, '$1')
              return `\n### ${cleanTitle}`
            }
            return `• ${item}`
          }).join('\n') + '\n\n'
        case 'callout':
          return `${block.content.icon} ${block.content.text}\n\n`
        case 'toggle_list':
          const details = processToggleDetails(block.content.details)
          return `▶ ${block.content.summary}\n${details}\n\n`
        case 'code':
          return `\`\`\`${block.content.language || ''}\n${block.content.text}\n\`\`\`\n\n`
        default:
          return JSON.stringify(block.content) + '\n\n'
      }
    }).join('')
  }

  // 複製到剪貼板
  const handleCopy = async () => {
    try {
      const text = convertToText()
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('複製失敗:', error)
    }
  }

  // 下載為文本文件
  const handleDownload = () => {
    const text = convertToText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `會議筆記_${taskId}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 分享功能
  const handleShare = async () => {
    const text = convertToText()
    const shareData = {
      title: '會議筆記',
      text: text.substring(0, 200) + '...',
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('分享失敗:', error)
        // 降級到複製連結
        await navigator.clipboard.writeText(window.location.href)
        alert('連結已複製到剪貼板')
      }
    } else {
      // 降級到複製連結
      await navigator.clipboard.writeText(window.location.href)
      alert('連結已複製到剪貼板')
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <FileText className="h-4 w-4" />
        <span>內容操作：</span>
      </div>
      
      <Button
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        {copied ? '已複製' : '複製全文'}
      </Button>
      
      <Button
        onClick={handleDownload}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        下載TXT
      </Button>
      
      <Button
        onClick={handleShare}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        分享
      </Button>
    </div>
  )
}