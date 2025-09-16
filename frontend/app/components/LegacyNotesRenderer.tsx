"use client"

import React from 'react'

// 待辦事項介面
interface ActionItem {
  task: string
  owner: string
  due_date: string
}

// 舊版筆記渲染組件 props
interface LegacyNotesRendererProps {
  summary?: string
  keyDecisions?: string[]
  actionItems?: ActionItem[]
}

export default function LegacyNotesRenderer({ 
  summary, 
  keyDecisions, 
  actionItems 
}: LegacyNotesRendererProps) {
  return (
    <div className="prose prose-lg max-w-none mx-auto p-6 bg-white">
      {/* 摘要 */}
      {summary && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span>📋</span>
            會議摘要
          </h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* 關鍵決策 */}
      {keyDecisions && keyDecisions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
            <span>🎯</span>
            關鍵決策
          </h2>
          <ul className="space-y-3">
            {keyDecisions.map((decision, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700 leading-relaxed">{decision}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 待辦事項 */}
      {actionItems && actionItems.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <span>✅</span>
            待辦事項 ({actionItems.length})
          </h3>
          <div className="space-y-4">
            {actionItems.map((item, index) => (
              <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 mb-2">{item.task}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <span>👤</span>
                        {item.owner}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📅</span>
                        {item.due_date}
                      </span>
                    </div>
                  </div>
                  <input type="checkbox" className="mt-1 w-4 h-4 text-green-600 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}