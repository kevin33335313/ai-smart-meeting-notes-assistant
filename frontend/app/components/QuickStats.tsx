"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface QuickStatsProps {
  totalTools: number
  availableTools: number
  totalUsage?: number
  activeUsers?: number
}

export default function QuickStats({ 
  totalTools, 
  availableTools, 
  totalUsage = 1250, 
  activeUsers = 89 
}: QuickStatsProps) {
  const stats = [
    {
      label: "可用工具",
      value: availableTools,
      total: totalTools,
      icon: "🛠️",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "總使用次數",
      value: totalUsage,
      icon: "📊",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "活躍用戶",
      value: activeUsers,
      icon: "👥",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "成功率",
      value: "98.5%",
      icon: "✅",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
          <CardContent className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3`}>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              {stat.total && (
                <span className="text-sm text-gray-500 font-normal">/{stat.total}</span>
              )}
            </div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}