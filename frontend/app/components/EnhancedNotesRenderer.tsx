"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Clock, Users, Target, AlertCircle, CheckCircle2, Calendar, User } from 'lucide-react'

interface ActionItem {
  task: string
  owner: string
  due_date: string
}

interface ContentBlock {
  type: string
  content: any
}

interface EnhancedNotesRendererProps {
  notes: {
    content_blocks: ContentBlock[]
    action_items?: ActionItem[]
    mindmap_structure?: any
  }
  filename?: string
}

export default function EnhancedNotesRenderer({ notes, filename }: EnhancedNotesRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  // 會議元數據提取
  const getMeetingMetadata = () => {
    const blocks = notes.content_blocks || []
    const actionItems = notes.action_items || []
    
    return {
      duration: filename ? "45分鐘" : "未知",
      participants: actionItems.length > 0 ? new Set(actionItems.map(item => item.owner)).size : 0,
      decisions: blocks.filter(b => b.type === 'callout' && b.content.style === 'success').length,
      tasks: actionItems.length
    }
  }

  const metadata = getMeetingMetadata()

  // 會議概覽卡片
  const MeetingOverview = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        會議概覽
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white rounded-xl">
          <div className="text-2xl font-bold text-blue-600">{metadata.duration}</div>
          <div className="text-sm text-gray-600">會議時長</div>
        </div>
        <div className="text-center p-3 bg-white rounded-xl">
          <div className="text-2xl font-bold text-green-600">{metadata.participants}</div>
          <div className="text-sm text-gray-600">參與人數</div>
        </div>
        <div className="text-center p-3 bg-white rounded-xl">
          <div className="text-2xl font-bold text-purple-600">{metadata.decisions}</div>
          <div className="text-sm text-gray-600">重要決策</div>
        </div>
        <div className="text-center p-3 bg-white rounded-xl">
          <div className="text-2xl font-bold text-orange-600">{metadata.tasks}</div>
          <div className="text-sm text-gray-600">待辦事項</div>
        </div>
      </div>
    </motion.div>
  )

  // 增強的待辦事項區塊
  const EnhancedActionItems = ({ items }: { items: ActionItem[] }) => {
    if (!items || items.length === 0) return null

    const priorityItems = items.slice(0, 3)
    const otherItems = items.slice(3)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-orange-600" />
            行動計劃 ({items.length})
          </h3>
          <div className="text-sm text-gray-600">
            {priorityItems.length} 項優先任務
          </div>
        </div>

        {/* 優先任務 */}
        <div className="space-y-3 mb-4">
          {priorityItems.map((item, index) => (
            <div key={index} className="p-4 bg-white rounded-xl border-l-4 border-orange-400 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">{item.task}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
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
                <CheckCircle2 className="w-5 h-5 text-gray-400 hover:text-green-500 cursor-pointer" />
              </div>
            </div>
          ))}
        </div>

        {/* 其他任務（可摺疊） */}
        {otherItems.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
              <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
              查看其他 {otherItems.length} 項任務
            </summary>
            <div className="mt-3 space-y-2">
              {otherItems.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="font-medium text-gray-800">{item.task}</div>
                  <div className="text-gray-600 mt-1">{item.owner} • {item.due_date}</div>
                </div>
              ))}
            </div>
          </details>
        )}
      </motion.div>
    )
  }

  // 智能內容分類
  const categorizeContent = (blocks: ContentBlock[]) => {
    const categories = {
      decisions: blocks.filter(b => b.type === 'callout' && b.content.style === 'success'),
      discussions: blocks.filter(b => b.type === 'toggle_list'),
      summaries: blocks.filter(b => b.type === 'callout' && b.content.style === 'info'),
      warnings: blocks.filter(b => b.type === 'callout' && b.content.style === 'warning'),
      other: blocks.filter(b => !['callout', 'toggle_list'].includes(b.type))
    }
    return categories
  }

  const categories = categorizeContent(notes.content_blocks || [])

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* 會議概覽 */}
      <MeetingOverview />

      {/* 重要決策區塊 */}
      {categories.decisions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            重要決策 ({categories.decisions.length})
          </h3>
          <div className="grid gap-4">
            {categories.decisions.map((block, index) => (
              <div key={index} className="p-4 bg-green-50 border-l-4 border-green-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{block.content.icon}</span>
                  <p className="font-semibold text-green-900">{block.content.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 行動計劃 */}
      <EnhancedActionItems items={notes.action_items || []} />

      {/* 討論詳情 */}
      {categories.discussions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            討論詳情
          </h3>
          <div className="space-y-4">
            {categories.discussions.map((block, index) => (
              <details key={index} className="group border border-gray-200 rounded-xl overflow-hidden">
                <summary className="p-4 cursor-pointer font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                  {block.content.summary}
                </summary>
                <div className="p-4 bg-white">
                  {/* 渲染詳細內容 */}
                  <div className="text-gray-700 leading-relaxed">
                    {typeof block.content.details === 'string' 
                      ? block.content.details 
                      : JSON.stringify(block.content.details)
                    }
                  </div>
                </div>
              </details>
            ))}
          </div>
        </motion.div>
      )}

      {/* 注意事項 */}
      {categories.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            注意事項
          </h3>
          <div className="space-y-3">
            {categories.warnings.map((block, index) => (
              <div key={index} className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-xl">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{block.content.icon}</span>
                  <p className="font-semibold text-amber-900">{block.content.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}