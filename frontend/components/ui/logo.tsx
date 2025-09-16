import { MessageSquare, FileText, Brain, Sparkles } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-14 w-14"
  }
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Logo圖標 - 現代化設計 */}
      <div className="relative group">
        <div className={`p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 text-white shadow-xl group-hover:shadow-2xl transition-all duration-200 ${sizeClasses[size]} relative overflow-hidden`}>
          {/* 背景光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <MessageSquare className="h-full w-full relative z-10 group-hover:scale-110 transition-transform duration-200" />
        </div>
        
        {/* 裝飾元素 */}
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full p-1.5 shadow-lg group-hover:scale-110 transition-transform duration-200">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        
        {/* 脈衝效果 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 opacity-20 animate-ping"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent ${textSizeClasses[size]} hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 transition-all duration-200`}>
            AI 智能工具箱
          </h1>
          {size === 'lg' && (
            <p className="text-sm text-gray-500 font-medium mt-1">
              讓 AI 成為您的得力助手
            </p>
          )}
        </div>
      )}
    </div>
  )
}