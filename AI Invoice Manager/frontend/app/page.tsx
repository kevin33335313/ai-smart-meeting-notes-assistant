'use client'

import { useState } from 'react'
import { Upload, FileText, BarChart3, Settings } from 'lucide-react'
import InvoiceUpload from '@/components/InvoiceUpload'
import InvoiceList from '@/components/InvoiceList'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  // 當前活躍的頁籤
  const [activeTab, setActiveTab] = useState('upload')

  const tabs = [
    { id: 'upload', name: '上傳發票', icon: Upload },
    { id: 'list', name: '發票列表', icon: FileText },
    { id: 'dashboard', name: '統計分析', icon: BarChart3 },
  ]

  return (
    <div className="px-4 py-6">
      {/* 頁籤導航 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 頁籤內容 */}
      <div className="mt-6">
        {activeTab === 'upload' && <InvoiceUpload />}
        {activeTab === 'list' && <InvoiceList />}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>
    </div>
  )
}