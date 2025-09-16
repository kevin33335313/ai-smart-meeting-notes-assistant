'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Eye } from "lucide-react"

interface Source {
  file_name: string
  page?: number
  chunk_id?: string
}

interface SourcePreviewerProps {
  selectedSource: Source | null
}

export default function SourcePreviewer({ selectedSource }: SourcePreviewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedSource) {
      fetchSourceContent()
    }
  }, [selectedSource])

  const fetchSourceContent = async () => {
    if (!selectedSource) return
    
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8000/api/document-qa/source-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: selectedSource.file_name,
          chunk_id: selectedSource.chunk_id
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setContent(data.content || '無法獲取文件內容')
      } else {
        setContent('無法獲取文件內容')
      }
    } catch (error) {
      setContent('網路錯誤，無法獲取內容')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        <div className="h-full flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {selectedSource ? (
              <div className="space-y-5">
                {/* 來源信息 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200/50 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 text-sm">
                        {selectedSource.file_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        {selectedSource.page && (
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                            第 {selectedSource.page} 頁
                          </span>
                        )}
                        {selectedSource.chunk_id && (
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                            片段 {selectedSource.chunk_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 內容預覽 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100">
                      <Eye className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">內容預覽</h4>
                  </div>
                  <div className="bg-gradient-to-b from-gray-50 to-white p-5 rounded-xl border border-gray-200/50 shadow-sm">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="ml-2 text-sm text-gray-600">正在載入...</span>
                      </div>
                    ) : (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm max-h-96 overflow-y-auto">
                        {content || '無內容'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-xs">
                  <div className="p-4 rounded-full bg-gradient-to-r from-gray-100 to-blue-100 w-fit mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">選擇來源查看</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    點擊AI回答中的來源標籤，即可查看相關文件內容的詳細預覽
                  </p>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700 font-medium">
                      ✨ 支援即時預覽和上下文查看
                    </p>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}