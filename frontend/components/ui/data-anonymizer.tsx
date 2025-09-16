"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Shield, Eye, EyeOff, Zap, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DataAnonymizerProps {
  onToggle: (enabled: boolean) => void
  className?: string
}

export function DataAnonymizer({ onToggle, className = "" }: DataAnonymizerProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled)
    onToggle(enabled)
  }

  const anonymizationRules = [
    { type: "姓名", pattern: "張三、李四 → [姓名A]、[姓名B]", icon: "👤" },
    { type: "電話", pattern: "0912-345-678 → [電話號碼]", icon: "📞" },
    { type: "Email", pattern: "user@company.com → [電子郵件]", icon: "📧" },
    { type: "地址", pattern: "台北市信義區 → [地址]", icon: "📍" },
    { type: "身分證", pattern: "A123456789 → [身分證號]", icon: "🆔" },
    { type: "公司名", pattern: "ABC科技公司 → [公司名稱]", icon: "🏢" }
  ]

  return (
    <Card className={`border-2 ${isEnabled ? 'border-green-200 bg-green-50/50' : 'border-blue-200 bg-blue-50/50'} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100' : 'bg-blue-100'}`}>
              <Shield className={`h-5 w-5 ${isEnabled ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                智能去識別化
                {isEnabled && <CheckCircle className="h-4 w-4 text-green-600" />}
              </CardTitle>
              <CardDescription>
                自動偵測並替換敏感資訊，保護您的隱私
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-600"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <AnimatePresence>
          {isEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-700">✓ 去識別化已啟用</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                  {showPreview ? '隱藏' : '查看'}規則
                </Button>
              </div>

              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white/80 rounded-lg p-3 border border-green-200"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      自動替換規則
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {anonymizationRules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <span className="text-sm">{rule.icon}</span>
                          <div>
                            <div className="font-medium text-gray-700">{rule.type}</div>
                            <div className="text-gray-500">{rule.pattern}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {!isEnabled && (
          <div className="text-xs text-gray-600 bg-white/60 rounded-lg p-3 border border-gray-200">
            <p className="flex items-center gap-2 mb-1">
              <Shield className="h-3 w-3" />
              <strong>建議啟用去識別化功能</strong>
            </p>
            <p>系統將自動偵測並替換姓名、電話、地址等敏感資訊，確保資料安全。</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}