import { motion } from "framer-motion"
import { ReactNode } from "react"

// 淡入動畫組件
export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = "" 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 縮放動畫組件
export function ScaleIn({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  className = "" 
}: { 
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, type: "spring", stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 滑入動畫組件
export function SlideIn({ 
  children, 
  direction = "left",
  delay = 0, 
  duration = 0.6, 
  className = "" 
}: { 
  children: ReactNode
  direction?: "left" | "right" | "up" | "down"
  delay?: number
  duration?: number
  className?: string
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case "left": return { x: -50, y: 0 }
      case "right": return { x: 50, y: 0 }
      case "up": return { x: 0, y: -50 }
      case "down": return { x: 0, y: 50 }
      default: return { x: -50, y: 0 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...getInitialPosition() }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, type: "spring", stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 懸停動畫組件
export function HoverScale({ 
  children, 
  scale = 1.05, 
  className = "" 
}: { 
  children: ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 浮動動畫組件
export function FloatingElement({ 
  children, 
  duration = 3, 
  className = "" 
}: { 
  children: ReactNode
  duration?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{ 
        y: [-10, 10, -10],
        rotate: [-1, 1, -1]
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 脈衝動畫組件
export function PulseGlow({ 
  children, 
  color = "rgba(139, 92, 246, 0.4)", 
  className = "" 
}: { 
  children: ReactNode
  color?: string
  className?: string
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`
        ]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 交錯動畫容器
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1, 
  className = "" 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 交錯動畫項目
export function StaggerItem({ 
  children, 
  className = "" 
}: { 
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}