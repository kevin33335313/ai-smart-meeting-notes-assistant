import { motion } from "framer-motion"
import { FileText, Clock, Brain, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  totalNotes: number
  totalDuration?: string
  aiProcessed?: number
  className?: string
}

export function StatsCards({ 
  totalNotes, 
  totalDuration = "0 分鐘", 
  aiProcessed = 0,
  className = "" 
}: StatsCardsProps) {
  const stats = [
    {
      icon: FileText,
      label: "總筆記數",
      value: totalNotes.toString(),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: Clock,
      label: "總時長",
      value: totalDuration,
      color: "from-emerald-500 to-emerald-600", 
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      icon: Brain,
      label: "AI 處理",
      value: aiProcessed.toString(),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50", 
      textColor: "text-purple-600"
    },
    {
      icon: TrendingUp,
      label: "本月新增",
      value: Math.floor(totalNotes * 0.3).toString(),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ]

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className={`${stat.bgColor} rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-all duration-200`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${stat.textColor}`}>
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {stat.label}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}