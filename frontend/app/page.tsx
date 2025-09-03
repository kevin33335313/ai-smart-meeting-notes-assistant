import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mic, FileText, Brain, Sparkles } from "lucide-react"

// AI工具數據
const aiTools = [
  {
    id: "meeting-notes",
    title: "AI 智慧會議筆記",
    description: "上傳會議錄音，自動生成摘要、待辦事項與心智圖",
    icon: <Mic className="h-8 w-8" />,
    color: "from-blue-500 to-indigo-600",
    href: "/tools/meeting-notes",
    status: "available"
  },
  {
    id: "document-analyzer",
    title: "文件智能分析",
    description: "分析PDF、Word文件，提取關鍵信息和洞察",
    icon: <FileText className="h-8 w-8" />,
    color: "from-green-500 to-emerald-600",
    href: "/tools/document-analyzer",
    status: "coming-soon"
  },
  {
    id: "ai-brainstorm",
    title: "AI 創意發想",
    description: "與AI協作進行頭腦風暴，激發創新想法",
    icon: <Brain className="h-8 w-8" />,
    color: "from-purple-500 to-violet-600",
    href: "/tools/ai-brainstorm",
    status: "coming-soon"
  },
  {
    id: "content-generator",
    title: "智能內容生成",
    description: "生成文章、郵件、社交媒體內容等",
    icon: <Sparkles className="h-8 w-8" />,
    color: "from-orange-500 to-red-600",
    href: "/tools/content-generator",
    status: "coming-soon"
  }
]

// 主頁面組件
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* 頁面標題 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI 工具箱
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            探索強大的AI工具集合，提升您的工作效率與創造力
          </p>
        </div>

        {/* 工具網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {aiTools.map((tool) => (
            <Card key={tool.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${tool.color}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {tool.title}
                    </CardTitle>
                    {tool.status === "coming-soon" && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full mt-1">
                        即將推出
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed">
                  {tool.description}
                </CardDescription>
                
                {tool.status === "available" ? (
                  <Link href={tool.href}>
                    <Button className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300`}>
                      開始使用
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full bg-gray-200 text-gray-500 cursor-not-allowed">
                    敬請期待
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* 底部信息 */}
        <div className="text-center mt-16">
          <p className="text-gray-500">
            更多AI工具正在開發中，敬請期待！
          </p>
        </div>
      </div>
    </div>
  )
}
