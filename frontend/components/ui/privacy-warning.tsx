"use client"

import { AlertTriangle, Shield, Eye } from "lucide-react"
import { motion } from "framer-motion"

interface PrivacyWarningProps {
  className?: string
}

export function PrivacyWarning({ className = "" }: PrivacyWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-amber-50 border border-amber-200 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Shield className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h4 className="font-semibold text-amber-800 text-sm">資料隱私提醒</h4>
          </div>
          <div className="text-xs text-amber-700 space-y-1">
            <p>• 本服務使用 Google Gemini AI 進行處理，資料將傳送至 Google 伺服器</p>
            <p>• 請避免上傳包含個人隱私、商業機密或敏感資訊的內容</p>
            <p>• 建議先對敏感資料進行去識別化處理</p>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
            <Eye className="h-3 w-3" />
            <span>使用前請確認資料安全性</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}