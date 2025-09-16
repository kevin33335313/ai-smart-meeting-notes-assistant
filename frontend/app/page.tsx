import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, Wand2, MessageSquare, Receipt } from "lucide-react"

const aiTools = [
  {
    id: "meeting-notes",
    title: "AI 智慧會議筆記",
    description: "上傳會議錄音，自動生成摘要、待辦事項與心智圖",
    icon: <Mic className="h-6 w-6" />,
    bgColor: "bg-emerald-500",
    buttonColor: "bg-emerald-500 hover:bg-emerald-600",
    href: "/tools/meeting-notes",
    status: "可立即使用"
  },
  {
    id: "poster-generator", 
    title: "AI 智能海報生成器",
    description: "結合文字內容與上傳圖片，智能生成專業海報",
    icon: <Wand2 className="h-6 w-6" />,
    bgColor: "bg-blue-500",
    buttonColor: "bg-blue-500 hover:bg-blue-600", 
    href: "/tools/poster-generator",
    status: "可立即使用"
  },
  {
    id: "rag-system",
    title: "RAG 文件問答系統", 
    description: "上傳多個文件，智能問答、摘要生成與測驗功能",
    icon: <MessageSquare className="h-6 w-6" />,
    bgColor: "bg-purple-500",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
    href: "/rag-chat",
    status: "可立即使用"
  },
  {
    id: "invoice-manager",
    title: "AI 智能發票管理",
    description: "自動識別發票資訊，智能分類與統計分析", 
    icon: <Receipt className="h-6 w-6" />,
    bgColor: "bg-orange-500",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
    href: "/tools/invoice-manager", 
    status: "可立即使用"
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-16">
        {/* 標題區域 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🤖 AI 智能工具箱
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            探索強大的 AI 工具集合，讓人工智能成為您的得力助手
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>4 個工具可用，更多功能開發中</span>
          </div>
        </div>

        {/* 工具卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {aiTools.map((tool) => (
            <Card key={tool.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`${tool.bgColor} p-3 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform duration-200`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {tool.title}
                    </CardTitle>
                    <div className="text-xs text-green-600 font-medium mt-1">
                      {tool.status}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                  {tool.description}
                </CardDescription>
                
                <Link href={tool.href}>
                  <Button className={`w-full ${tool.buttonColor} text-white font-medium transition-colors duration-200`}>
                    開始使用 →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}