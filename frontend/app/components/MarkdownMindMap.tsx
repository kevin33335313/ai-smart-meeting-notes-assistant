"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, Eye, EyeOff, Maximize2, Minimize2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface MarkdownMindMapProps {
  taskId: string
  className?: string
}

export default function MarkdownMindMap({ taskId, className = "" }: MarkdownMindMapProps) {
  const [markdownContent, setMarkdownContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState("rendered")

  // 獲取markdown心智圖內容
  useEffect(() => {
    const fetchMarkdownMindMap = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/markdown-mindmap`)
        
        if (response.ok) {
          const data = await response.json()
          setMarkdownContent(data.markdown_mindmap || "")
        } else {
          setError("無法獲取心智圖內容")
        }
      } catch (err) {
        console.error("獲取markdown心智圖錯誤:", err)
        setError("網路連接錯誤")
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      fetchMarkdownMindMap()
    }
  }, [taskId])

  // 複製到剪貼板
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      // 可以添加成功提示
    } catch (err) {
      console.error("複製失敗:", err)
    }
  }

  // 下載為markdown文件
  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `mindmap-${taskId}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // 在心智圖預覽中的簡化版本
  const isInMindMapPreview = className?.includes('h-full')
  
  if (isInMindMapPreview) {
    return (
      <div className="h-full flex flex-col bg-white rounded-lg">
        {/* 簡化的標題列 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">🧠</span>
            <span className="text-sm font-semibold text-gray-800">結構化心智圖</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 text-xs"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadMarkdown}
              className="h-6 px-2 text-xs"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {/* 內容區域 */}
        <div className="flex-1 overflow-auto p-3">
          <div className="prose prose-xs max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-gray-800 mb-3 pb-1 border-b border-purple-200">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold text-gray-700 mt-4 mb-2 flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
                    {children}
                  </h2>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-800 bg-yellow-100 px-1 py-0.5 rounded text-xs">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 ml-3">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span className="text-gray-700 text-xs leading-relaxed">{children}</span>
                  </li>
                ),
                p: ({ children }) => (
                  <p className="text-gray-600 leading-relaxed mb-2 text-xs">
                    {children}
                  </p>
                )
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={`${className} ${isExpanded ? 'fixed inset-4 z-50 max-w-none max-h-none' : ''} transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="text-purple-600">🧠</span>
              Markdown 心智圖
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              結構化筆記
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8 px-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadMarkdown}
              className="h-8 px-2"
            >
              <Download className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isExpanded ? 'flex-1 overflow-auto' : ''}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="rendered" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              預覽模式
            </TabsTrigger>
            <TabsTrigger value="source" className="flex items-center gap-2">
              <EyeOff className="w-4 h-4" />
              原始碼
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rendered" className={`${isExpanded ? 'h-full overflow-auto' : 'max-h-96 overflow-auto'}`}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-700 mt-6 mb-3 flex items-center gap-2">
                      <span className="w-2 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></span>
                      {children}
                    </h2>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-800 bg-yellow-100 px-1 py-0.5 rounded">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2 ml-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{children}</span>
                    </li>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-600 leading-relaxed mb-3">
                      {children}
                    </p>
                  )
                }}
              >
                {markdownContent}
              </ReactMarkdown>
            </div>
          </TabsContent>
          
          <TabsContent value="source" className={`${isExpanded ? 'h-full' : 'max-h-96'}`}>
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto h-full">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {markdownContent}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}