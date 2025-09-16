"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, Clock, Users, Target, AlertCircle, CheckCircle2, Calendar, User,
  Bookmark, Eye, EyeOff, ChevronDown, ChevronUp, Download, Share2,
  Copy, ExternalLink, MoreHorizontal, Clipboard, FileDown
} from 'lucide-react'
import MarkdownMindMap from './MarkdownMindMap'
import ReactFlowMindMap from './ReactFlowMindMap'

// 待辦事項介面
interface ActionItem {
  task: string
  owner: string
  due_date: string
}

// 內容區塊介面
interface ContentBlock {
  type: string
  content: any
}

// 筆記渲染組件
interface ModernNotesRendererProps {
  notes: {
    content_blocks: ContentBlock[]
    action_items?: ActionItem[]
    mindmap_structure?: any
    reactflow_mindmap?: any
  }
  filename?: string
  taskId?: string
  usageReport?: {
    input_tokens: number
    output_tokens: number
    total_cost: number
  }
}

export default function ModernNotesRenderer({ notes, filename, taskId, usageReport }: ModernNotesRendererProps) {
  const [viewMode, setViewMode] = useState<'full' | 'summary' | 'focus'>('full')
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set())
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<number>>(new Set())
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showStats, setShowStats] = useState(true)
  const currentTime = new Date() // 靜態時間，不會更新

  // 獲取會議統計數據
  const getStats = () => {
    const blocks = notes.content_blocks || []
    const decisions = blocks.filter(b => b.type === 'callout' && b.content.style === 'success').length
    const discussions = blocks.filter(b => b.type === 'toggle_list').length
    const warnings = blocks.filter(b => b.type === 'callout' && b.content.style === 'warning').length
    const participants = notes.action_items ? new Set(notes.action_items.map(item => item.owner)).size : 0
    
    return { decisions, discussions, warnings, participants, tasks: notes.action_items?.length || 0 }
  }

  const stats = getStats()
  
  // 滾動到指定區塊的函數
  const scrollToSection = (target: string) => {
    const element = document.querySelector(`[data-section="${target}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 專業化標題區塊
  const ProfessionalHeader = () => (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl mb-8 overflow-hidden">
      {/* 頂部漸層裝飾 */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <FileText className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                AI 智能會議筆記
              </h1>
              <div className="text-gray-600 mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  {filename || '智能分析生成'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm">{currentTime.toLocaleString('zh-TW')}</span>
              </div>
            </div>
          </div>
          
          {/* 主要操作按鈕 */}
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const content = document.querySelector('.max-w-5xl')?.textContent || ''
                navigator.clipboard.writeText(content)
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <Copy className="w-4 h-4" />
              複製
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const content = document.querySelector('.max-w-5xl')?.textContent || ''
                const blob = new Blob([content], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${filename || '會議筆記'}.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <FileDown className="w-4 h-4" />
              下載
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: '會議筆記',
                    text: document.querySelector('.max-w-5xl')?.textContent || '',
                    url: window.location.href
                  })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
              分享
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowStats(!showStats)}
              className="p-2.5 text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200"
            >
              {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
        
      {/* 統計卡片 */}
      {showStats && (
        <div className="grid grid-cols-5 gap-3 mt-6 pt-6 border-t border-gray-100">
          {[
            { label: '決策', value: stats.decisions, color: 'bg-green-50 text-green-700 border-green-200', target: 'success' },
            { label: '討論', value: stats.discussions, color: 'bg-blue-50 text-blue-700 border-blue-200', target: 'toggle' },
            { label: '警示', value: stats.warnings, color: 'bg-amber-50 text-amber-700 border-amber-200', target: 'warning' },
            { label: '參與者', value: stats.participants, color: 'bg-purple-50 text-purple-700 border-purple-200', target: 'participants' },
            { label: '任務', value: stats.tasks, color: 'bg-pink-50 text-pink-700 border-pink-200', target: 'tasks' }
          ].map((stat) => (
            <button
              key={stat.label}
              onClick={() => scrollToSection(stat.target)}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm ${stat.color}`}
            >
              <div className="text-lg font-semibold">{stat.value}</div>
              <div className="text-xs font-medium">{stat.label}</div>
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  )

  // 渲染內容區塊
  const renderContentBlock = (block: ContentBlock, index: number) => {
    // 檢查 content 是否存在
    if (!block.content) {
      return null
    }
    
    switch (block.type) {
      case 'heading_2':
        if (!block.content.text) return null
        const headingIndex = notes.content_blocks.slice(0, index).filter(b => b.type === 'heading_2').length
        const colors = [
          { border: 'border-l-blue-500', text: 'text-gray-900', bg: 'bg-blue-50', icon: '📋' },
          { border: 'border-l-green-500', text: 'text-gray-900', bg: 'bg-green-50', icon: '✅' },
          { border: 'border-l-purple-500', text: 'text-gray-900', bg: 'bg-purple-50', icon: '💡' },
          { border: 'border-l-orange-500', text: 'text-gray-900', bg: 'bg-orange-50', icon: '⚠️' },
          { border: 'border-l-pink-500', text: 'text-gray-900', bg: 'bg-pink-50', icon: '📝' },
          { border: 'border-l-indigo-500', text: 'text-gray-900', bg: 'bg-indigo-50', icon: '🎯' }
        ]
        const color = colors[headingIndex % colors.length]
        const isBookmarked = bookmarkedSections.has(index)
        
        return (
          <div key={index} className="mb-6 mt-8 first:mt-0">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className={`flex items-center justify-between p-4 ${color.bg} border-l-4 ${color.border}`}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{color.icon}</span>
                  <h2 
                    id={`heading-${index}`}
                    className={`text-xl font-semibold ${color.text} scroll-mt-24`}
                  >
                    {block.content.text}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const newBookmarks = new Set(bookmarkedSections)
                      if (isBookmarked) {
                        newBookmarks.delete(index)
                      } else {
                        newBookmarks.add(index)
                      }
                      setBookmarkedSections(newBookmarks)
                    }}
                    className={`p-1.5 rounded transition-colors ${
                      isBookmarked 
                        ? 'text-yellow-600 bg-yellow-100' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'bullet_list':
        if (!block.content.items || !Array.isArray(block.content.items)) return null
        const renderBulletItems = (items: string[]) => {
          return items.map((item: string, i: number) => {
            const leadingSpaces = item.match(/^ */)[0].length
            const level = Math.floor(leadingSpaces / 2)
            const cleanItem = item.trim()
            
            const levelConfig = [
              { margin: '', text: 'text-gray-900', bullet: '•' },
              { margin: 'ml-6', text: 'text-gray-700', bullet: '◦' },
              { margin: 'ml-12', text: 'text-gray-600', bullet: '▪' }
            ]
            
            const config = levelConfig[Math.min(level, levelConfig.length - 1)]
            
            return (
              <div key={i} className={`flex items-start gap-3 ${config.margin}`}>
                <span className="text-gray-400 mt-1 select-none">{config.bullet}</span>
                <p className={`${config.text} leading-relaxed`}>
                  {cleanItem}
                </p>
              </div>
            )
          })
        }
        
        return (
          <div key={index} className="mb-6">
            <div className="space-y-2">
              {renderBulletItems(block.content.items || [])}
            </div>
          </div>
        )

      case 'callout':
        if (!block.content.text || !block.content.style) return null
        const calloutStyles = {
          warning: { 
            bg: 'bg-amber-50', 
            border: 'border-amber-200', 
            text: 'text-amber-800',
            icon: 'text-amber-600'
          },
          success: { 
            bg: 'bg-green-50', 
            border: 'border-green-200', 
            text: 'text-green-800',
            icon: 'text-green-600'
          },
          info: { 
            bg: 'bg-blue-50', 
            border: 'border-blue-200', 
            text: 'text-blue-800',
            icon: 'text-blue-600'
          },
          default: { 
            bg: 'bg-gray-50', 
            border: 'border-gray-200', 
            text: 'text-gray-800',
            icon: 'text-gray-600'
          }
        }

        const styleConfig = calloutStyles[block.content.style as keyof typeof calloutStyles] || calloutStyles.default

        return (
          <div
            key={index}
            data-section={block.content.style}
            className={`p-4 rounded-lg border ${styleConfig.border} ${styleConfig.bg} mb-6`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-white border ${styleConfig.border} flex items-center justify-center flex-shrink-0 ${styleConfig.icon}`}>
                <span className="text-lg">{block.content.icon}</span>
              </div>
              <div className="flex-1">
                <p className={`font-medium leading-relaxed ${styleConfig.text}`}>
                  {block.content.text}
                </p>
              </div>
            </div>
          </div>
        )

      case 'toggle_list':
        if (!block.content.summary) return null
        const renderDetails = () => {
          const details = block.content.details
          
          if (typeof details === 'string') {
            const sentences = details.split(/[。；，]/).filter(s => s.trim().length > 0)
            if (sentences.length > 1) {
              return (
                <ul className="space-y-1">
                  {sentences.map((sentence, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      <span className="text-gray-700 leading-relaxed text-sm">{sentence.trim()}</span>
                    </li>
                  ))}
                </ul>
              )
            }
            return <p className="text-gray-700 leading-relaxed text-sm">{details}</p>
          }
          
          if (details && typeof details === 'object' && details.type === 'bullet_list' && details.items) {
            return (
              <ul className="space-y-1">
                {details.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            )
          }
          
          if (Array.isArray(details)) {
            return (
              <ul className="space-y-1">
                {details.map((item: any, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className="text-gray-700 leading-relaxed text-sm">
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          }
          
          return <p className="text-gray-700 leading-relaxed text-sm">{JSON.stringify(details)}</p>
        }
        
        return (
          <div key={index} data-section="toggle" className="mb-6">
            <details className="group border border-gray-200 rounded-lg overflow-hidden">
              <summary className="p-4 cursor-pointer font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                {block.content.summary}
              </summary>
              <div className="p-4 bg-white">
                {renderDetails()}
              </div>
            </details>
          </div>
        )

      default:
        return null
    }
  }

  // 專業化待辦事項渲染
  const renderActionItems = (items: ActionItem[]) => {
    if (!items || items.length === 0) return null

    const completedCount = completedTasks.size
    const progressPercentage = (completedCount / items.length) * 100

    return (
      <div data-section="tasks" className="mt-12">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    行動項目
                  </h3>
                  <p className="text-sm text-gray-500">{items.length} 項任務，{completedCount} 項已完成</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {items.map((item, index) => {
              const isCompleted = completedTasks.has(index)
              return (
                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => {
                        const newCompleted = new Set(completedTasks)
                        if (isCompleted) {
                          newCompleted.delete(index)
                        } else {
                          newCompleted.add(index)
                        }
                        setCompletedTasks(newCompleted)
                      }}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted 
                          ? 'bg-green-600 border-green-600' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium leading-relaxed ${
                        isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {item.task}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{item.owner}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{item.due_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      
      <div className="flex">
        {/* Token 統計 */}
        {usageReport && (
          <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-20">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-xs text-gray-500 mb-2">統計</div>
              <div className="space-y-1 text-xs">
                <div className="text-gray-700">{(usageReport.input_tokens + usageReport.output_tokens).toLocaleString()} tokens</div>
                <div className="text-gray-700">${usageReport.total_cost.toFixed(4)}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 主要內容區域 */}
        <div className="flex-1 max-w-4xl mx-auto p-8">
          <ProfessionalHeader />
          
          <div className="space-y-6">
            {/* 渲染內容區塊 */}
            {notes.content_blocks.map((block, index) => renderContentBlock(block, index))}
            
            {/* 渲染待辦事項 */}
            {renderActionItems(notes.action_items || [])}
            


          </div>
        </div>
      </div>
    </div>
  )
}