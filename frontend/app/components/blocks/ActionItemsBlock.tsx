'use client'

import { Calendar, User, CheckCircle2 } from 'lucide-react'

// 待辦事項介面定義
interface ActionItem {
  task: string      // 任務描述
  owner: string     // 負責人
  due_date: string  // 截止日期
}

interface ActionItemsBlockProps {
  items: ActionItem[]
}

export default function ActionItemsBlock({ items }: ActionItemsBlockProps) {
  if (!items || items.length === 0) {
    return null
  }

  // 格式化日期顯示
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // 判斷是否逾期
  const isOverdue = (dateString: string) => {
    try {
      const dueDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return dueDate < today
    } catch {
      return false
    }
  }

  return (
    <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-800">
          待辦事項 ({items.length})
        </h3>
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={index}
            className={`p-3 bg-white border rounded-md shadow-sm ${
              isOverdue(item.due_date) ? 'border-red-200 bg-red-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className={`font-medium ${
                  isOverdue(item.due_date) ? 'text-red-800' : 'text-gray-800'
                }`}>
                  {item.task}
                </p>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{item.owner}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 ${
                    isOverdue(item.due_date) ? 'text-red-600 font-medium' : ''
                  }`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.due_date)}</span>
                    {isOverdue(item.due_date) && (
                      <span className="text-red-600 font-medium ml-1">(逾期)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                onChange={(e) => {
                  // 這裡可以添加完成任務的邏輯
                  if (e.target.checked) {
                    e.target.parentElement?.parentElement?.classList.add('opacity-50')
                  } else {
                    e.target.parentElement?.parentElement?.classList.remove('opacity-50')
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}