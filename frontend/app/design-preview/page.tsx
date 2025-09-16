"use client"

import ModernNotesRenderer from "../components/ModernNotesRenderer"

// 測試數據
const mockNotes = {
  content_blocks: [
    {
      type: "heading_2",
      content: { text: "會議概要" }
    },
    {
      type: "callout",
      content: {
        style: "success",
        icon: "✅",
        text: "本次會議成功達成三項重要決策，包括產品路線圖確認、預算分配方案，以及團隊組織架構調整。"
      }
    },
    {
      type: "bullet_list",
      content: {
        items: [
          "確認 Q1 產品發布時程",
          "  子項目：UI/UX 設計完成",
          "  子項目：後端 API 開發",
          "討論市場推廣策略",
          "預算分配與資源調度"
        ]
      }
    },
    {
      type: "heading_2",
      content: { text: "重要決策" }
    },
    {
      type: "callout",
      content: {
        style: "warning",
        icon: "⚠️",
        text: "需要在下週五前完成技術架構評估，否則可能影響整體進度。"
      }
    },
    {
      type: "toggle_list",
      content: {
        summary: "技術架構討論詳情",
        details: "評估現有系統性能瓶頸。研究新技術方案可行性。制定遷移計劃時程表。"
      }
    },
    {
      type: "heading_2",
      content: { text: "後續行動" }
    }
  ],
  action_items: [
    {
      task: "完成產品需求文件撰寫",
      owner: "張小明",
      due_date: "2024-01-15"
    },
    {
      task: "進行市場調研分析",
      owner: "李小華",
      due_date: "2024-01-20"
    },
    {
      task: "準備技術架構評估報告",
      owner: "王小強",
      due_date: "2024-01-12"
    }
  ]
}

export default function DesignPreview() {
  return (
    <div>
      <ModernNotesRenderer 
        notes={mockNotes} 
        filename="設計預覽測試.mp3"
      />
    </div>
  )
}