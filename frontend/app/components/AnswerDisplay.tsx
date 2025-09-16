'use client'

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface Source {
  file_name: string
  page?: number
  chunk_id?: string
}

interface AnswerDisplayProps {
  answer: string
  sources: Source[]
  onSourceClick: (source: Source) => void
}

export default function AnswerDisplay({ answer, sources, onSourceClick }: AnswerDisplayProps) {
  const formatMarkdown = (text: string) => {
    // 簡單的 Markdown 渲染
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl rounded-tl-md border border-gray-200/50 relative">
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-white/95 transform rotate-45 border-l border-t border-gray-200/50"></div>
      <CardContent className="p-6">
        {/* AI 回答 */}
        <div className="mb-6">
          <div 
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(answer) }}
          />
        </div>

        {/* 參考來源 */}
        {sources.length > 0 && (
          <div className="border-t border-gray-200/50 pt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-blue-100">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">參考來源</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {sources.length} 個文件
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-gray-700 border-gray-300 bg-white/80 backdrop-blur-sm px-3 py-1.5 text-sm font-medium"
                  onClick={() => onSourceClick(source)}
                >
                  <FileText className="h-3 w-3 mr-1.5 text-blue-500" />
                  {source.file_name}
                  {source.page && ` • 第${source.page}頁`}
                  {source.chunk_id && ` • 片段${source.chunk_id}`}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}