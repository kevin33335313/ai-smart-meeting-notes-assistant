"use client"

import Link from "next/link"
import { ArrowLeft, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({ 
  href = "/", 
  label = "工具箱",
  className = "" 
}: BackButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      className={className}
    >
      <Link href={href}>
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="group inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:via-purple-500/20 hover:to-indigo-500/20 backdrop-blur-sm border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer"
        >
          <motion.div
            whileHover={{ rotate: -180 }}
            transition={{ duration: 0.3 }}
            className="p-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
          >
            <ArrowLeft className="h-3 w-3" />
          </motion.div>
          <span className="text-sm font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {label}
          </span>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-yellow-500"
          >
            <Zap className="h-3 w-3" />
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}