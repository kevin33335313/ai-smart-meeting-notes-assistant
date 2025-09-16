import { motion } from "framer-motion"
import { Loader2, Sparkles, Zap, Brain } from "lucide-react"

// 基礎載入動畫
export function LoadingSpinner({ size = "md", className = "" }: { 
  size?: "sm" | "md" | "lg"
  className?: string 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

// 脈衝載入點
export function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// 波浪載入動畫
export function LoadingWave({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-1 ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
          animate={{
            height: ["8px", "24px", "8px"]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

// 骨架屏組件
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 rounded"></div>
          <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  )
}

// AI 處理載入動畫
export function AIProcessingLoader({ 
  message = "AI 正在處理中...", 
  className = "" 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={`flex flex-col items-center gap-6 p-8 ${className}`}>
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-blue-200 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <LoadingDots />
      </div>
    </div>
  )
}

// 進度條載入
export function ProgressLoader({ 
  progress = 0, 
  message = "處理中...", 
  className = "" 
}: { 
  progress?: number
  message?: string
  className?: string 
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// 浮動載入卡片
export function FloatingLoadingCard({ 
  title = "處理中", 
  description = "請稍候，系統正在處理您的請求...",
  className = "" 
}: { 
  title?: string
  description?: string
  className?: string 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-xl ${className}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white"
        >
          <Sparkles className="w-5 h-5" />
        </motion.div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <LoadingWave />
        <span className="text-xs text-gray-500 ml-2">正在運算中</span>
      </div>
    </motion.div>
  )
}

// 全屏載入覆蓋層
export function LoadingOverlay({ 
  isVisible = false, 
  message = "載入中...",
  className = "" 
}: { 
  isVisible?: boolean
  message?: string
  className?: string 
}) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}
    >
      <FloatingLoadingCard title="處理中" description={message} />
    </motion.div>
  )
}