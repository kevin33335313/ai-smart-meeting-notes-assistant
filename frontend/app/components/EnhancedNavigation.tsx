"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "工具箱",
    href: "/",
    icon: "🏠",
    description: "AI 工具總覽"
  },
  {
    name: "會議筆記",
    href: "/tools/meeting-notes",
    icon: "🎤",
    description: "智能會議記錄",
    badge: "熱門"
  },
  {
    name: "文件問答",
    href: "/rag-chat",
    icon: "💬",
    description: "RAG 智能問答"
  },
  {
    name: "海報生成",
    href: "/tools/poster-generator",
    icon: "✨",
    description: "AI 海報設計"
  },
  {
    name: "發票管理",
    href: "/tools/invoice-manager",
    icon: "🧾",
    description: "智能發票處理"
  }
]

export default function EnhancedNavigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo 區域 */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-2xl">🤖</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold gradient-text">AI 工具箱</h1>
              <p className="text-xs text-gray-500">智能助手集合</p>
            </div>
          </Link>

          {/* 導航選單 */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 h-auto transition-all duration-200",
                      isActive 
                        ? "bg-blue-50 text-blue-700 shadow-sm" 
                        : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {item.name}
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 hidden lg:block">
                        {item.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full" />
                    )}
                  </Button>
                </Link>
              )
            })}
          </div>

          {/* 移動端選單按鈕 */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <span className="text-lg">☰</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}