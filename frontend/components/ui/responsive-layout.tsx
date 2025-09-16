import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
}

export function ResponsiveLayout({ 
  children, 
  className = "", 
  maxWidth = "xl", 
  padding = "md" 
}: ResponsiveLayoutProps) {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    "2xl": "max-w-7xl",
    full: "max-w-full"
  }

  const paddingClasses = {
    none: "",
    sm: "px-4 py-2",
    md: "px-6 py-4",
    lg: "px-8 py-6", 
    xl: "px-12 py-8"
  }

  return (
    <div className={cn(
      "container mx-auto",
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  )
}

interface GridLayoutProps {
  children: ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: "sm" | "md" | "lg" | "xl"
}

export function GridLayout({ 
  children, 
  className = "", 
  cols = { default: 1, md: 2, xl: 2 },
  gap = "lg"
}: GridLayoutProps) {
  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12"
  }

  const getGridCols = () => {
    const classes = []
    if (cols.default) classes.push(`grid-cols-${cols.default}`)
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
    return classes.join(" ")
  }

  return (
    <div className={cn(
      "grid",
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  )
}

interface FlexLayoutProps {
  children: ReactNode
  className?: string
  direction?: "row" | "col"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  gap?: "sm" | "md" | "lg" | "xl"
  wrap?: boolean
}

export function FlexLayout({ 
  children, 
  className = "", 
  direction = "row",
  align = "start",
  justify = "start",
  gap = "md",
  wrap = false
}: FlexLayoutProps) {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col"
  }

  const alignClasses = {
    start: "items-start",
    center: "items-center", 
    end: "items-end",
    stretch: "items-stretch"
  }

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end", 
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly"
  }

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
    xl: "gap-8"
  }

  return (
    <div className={cn(
      "flex",
      directionClasses[direction],
      alignClasses[align],
      justifyClasses[justify],
      gapClasses[gap],
      wrap && "flex-wrap",
      className
    )}>
      {children}
    </div>
  )
}