"use client"

import { useState } from "react"
import { Shield, ChevronDown, Eye } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PrivacyControlsProps {
  onAnonymizerToggle: (enabled: boolean) => void
  className?: string
}

export function PrivacyControls({ onAnonymizerToggle, className = "" }: PrivacyControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* 主控制列 */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">隱私保護</span>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>已自動去識別化</span>
            </div>
            <div className="text-xs text-amber-600 mt-1">
              使用第三方 API，請勿上傳機密資料
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Eye className="h-3 w-3" />
          詳情
          <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>


      {/* 展開的詳細資訊 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-3">
              {/* 隱私保護說明 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs font-medium text-green-700 mb-2">自動隱私保護</p>
                <div className="space-y-1 text-xs text-green-600">
                  <div>• 王小明 → [姓名]</div>
                  <div>• 0912-345-678 → [電話號碼]</div>
                  <div>• abc123@gmail.com → [電子郵件]</div>
                  <div>• 台北市內湖區 → [地址]</div>
                </div>
              </div>
              

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}