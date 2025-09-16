'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, BarChart3 } from 'lucide-react'
import { motion } from "framer-motion"
import { BackButton } from "@/components/ui/back-button"
import { PrivacyControls } from "@/components/ui/privacy-controls"
import InvoiceUpload from './components/InvoiceUpload'
import InvoiceList from './components/InvoiceList'
import InvoiceDashboard from './components/InvoiceDashboard'

export default function InvoiceManagerPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [tokenStats, setTokenStats] = useState({ total_tokens: 0, total_cost_usd: 0 })

  const loadTokenStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/token-stats?service=invoice_ocr')
      if (response.ok) {
        const data = await response.json()
        setTokenStats({
          total_tokens: data.total_tokens || 0,
          total_cost_usd: data.total_cost_usd || 0
        })
      }
    } catch (error) {
      setTokenStats({ total_tokens: 0, total_cost_usd: 0 })
    }
  }

  useEffect(() => {
    loadTokenStats()
    const interval = setInterval(loadTokenStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'upload', name: '上傳發票', icon: Upload },
    { id: 'list', name: '發票列表', icon: FileText },
    { id: 'dashboard', name: '統計分析', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="container mx-auto max-w-7xl p-6">
        {/* 返回按鈕與 Token 統計 */}
        <div className="relative mb-4">
          <BackButton />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute left-1/2 top-0 transform -translate-x-1/2 text-center"
          >
            <div className="text-xs text-gray-500 font-medium mb-1">Token 統計</div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                ></motion.div>
                <span className="text-gray-600">{tokenStats.total_tokens.toLocaleString()} tokens</span>
              </div>
              <div className="flex items-center gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  className="w-2 h-2 bg-green-400 rounded-full"
                ></motion.div>
                <span className="text-gray-600">${tokenStats.total_cost_usd.toFixed(4)}</span>
              </div>
            </div>
          </motion.div>
        </div>
        <PrivacyControls onAnonymizerToggle={() => {}} className="mb-6" />
        
        {/* 頁面標題 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="p-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 text-white shadow-lg"
            >
              <FileText className="h-8 w-8" />
            </motion.div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              AI 智能發票管理
            </h1>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600"
          >
            智能發票識別與費用管理，讓報銷流程更簡單高效
          </motion.p>
        </motion.div>

        {/* 頁籤導航 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
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

        {/* 頁籤內容 */}
        <div>
          {activeTab === 'upload' && <InvoiceUpload />}
          {activeTab === 'list' && <InvoiceList />}
          {activeTab === 'dashboard' && <InvoiceDashboard />}
        </div>
      </div>
    </div>
  )
}