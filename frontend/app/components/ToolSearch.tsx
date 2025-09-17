"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ToolSearchProps {
  categories: string[]
  onCategoryFilter: (category: string | null) => void
  onSearch: (query: string) => void
}

export default function ToolSearch({ categories, onCategoryFilter, onSearch }: ToolSearchProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleCategoryClick = (category: string) => {
    const newCategory = activeCategory === category ? null : category
    setActiveCategory(newCategory)
    onCategoryFilter(newCategory)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  return (
    <div className="mb-8 space-y-4">
      {/* 搜索框 */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          placeholder="搜索 AI 工具..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* 分類篩選 */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={activeCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryClick("")}
          className="rounded-full"
        >
          全部工具
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* 活躍篩選器顯示 */}
      {(activeCategory || searchQuery) && (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">當前篩選:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              搜索: {searchQuery}
              <button
                onClick={() => {
                  setSearchQuery("")
                  onSearch("")
                }}
                className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
          {activeCategory && (
            <Badge variant="secondary" className="gap-1">
              分類: {activeCategory}
              <button
                onClick={() => {
                  setActiveCategory(null)
                  onCategoryFilter(null)
                }}
                className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}