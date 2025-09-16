"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

// 導航組件 - 提供返回首頁的功能
export default function Navigation() {
  const pathname = usePathname()
  
  // 如果在首頁就不顯示導航
  if (pathname === "/") {
    return null
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Link href="/">
        <Button 
          variant="outline" 
          size="sm"
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-gray-200"
        >
          <Home className="h-4 w-4 mr-2" />
          回到首頁
        </Button>
      </Link>
    </div>
  )
}