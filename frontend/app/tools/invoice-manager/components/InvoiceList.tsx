'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, DollarSign, Tag, Eye, RefreshCw, Building2, Receipt, Car, Utensils, Paperclip, Home, File, X, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Invoice {
  id: number
  invoice_number?: string
  invoice_date?: string
  vendor_name?: string
  total_amount?: number
  category?: string
  status: string
  created_at: string
  image_path?: string
}

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)
      
      const response = await fetch(`http://localhost:8000/api/invoice/list?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      }
    } catch (error) {
      console.error('載入發票列表失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [selectedCategory, selectedStatus])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    }
    
    const labels = {
      pending: '待審核',
      approved: '已核准',
      rejected: '已拒絕'
    }
    
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      '交通': Car,
      '餐飲': Utensils,
      '辦公用品': Paperclip,
      '住宿': Home,
      '其他': File
    }
    return icons[category as keyof typeof icons] || File
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      '交通': 'bg-slate-100 text-slate-600',
      '餐飲': 'bg-slate-100 text-slate-600',
      '辦公用品': 'bg-slate-100 text-slate-600',
      '住宿': 'bg-slate-100 text-slate-600',
      '其他': 'bg-slate-100 text-slate-600'
    }
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-600'
  }

  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm('確定要刪除這張發票嗎？')) return
    
    try {
      setDeletingId(invoiceId)
      const response = await fetch(`http://localhost:8000/api/invoice/${invoiceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadInvoices()
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('刪除發票失敗:', error)
      alert('刪除失敗')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-orange-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">發票列表</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadInvoices}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重新整理
          </motion.button>
        </div>
        
        <div className="flex space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">所有類別</option>
            <option value="交通">交通</option>
            <option value="餐飲">餐飲</option>
            <option value="辦公用品">辦公用品</option>
            <option value="住宿">住宿</option>
            <option value="其他">其他</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">所有狀態</option>
            <option value="pending">待審核</option>
            <option value="approved">已核准</option>
            <option value="rejected">已拒絕</option>
          </select>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-500">載入中...</p>
          </div>
        ) : invoices.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">尚無發票資料</p>
            <p className="text-gray-400 text-sm mt-1">上傳您的第一張發票開始管理</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {invoices.map((invoice, index) => (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -4, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-all duration-300 shadow-sm hover:shadow-md group"
                >
                  {/* 發票縮圖區域 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${getCategoryColor(invoice.category || '其他')} rounded-lg flex items-center justify-center border border-slate-200`}>
                        {(() => {
                          const IconComponent = getCategoryIcon(invoice.category || '其他')
                          return <IconComponent className="w-5 h-5" />
                        })()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                          {invoice.vendor_name || '未知商家'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {invoice.invoice_number || '無發票號碼'}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>

                  {/* 金額顯示 */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        NT$ {Math.round(invoice.total_amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* 詳細資訊 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {invoice.invoice_date ? formatDate(invoice.invoice_date) : '無日期'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      {invoice.category || '其他'}
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      {formatDate(invoice.created_at)}
                    </span>
                    <div className="flex items-center gap-1">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedInvoice(invoice)}
                        className="p-2 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteInvoice(invoice.id)}
                        disabled={deletingId === invoice.id}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === invoice.id ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border border-red-300 border-t-red-500 rounded-full"
                          />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 圖片查看模態框 */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedInvoice.vendor_name || '發票圖片'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedInvoice.invoice_number || '無發票號碼'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                {selectedInvoice.image_path ? (
                  <img
                    src={`http://localhost:8000${selectedInvoice.image_path}`}
                    alt="發票圖片"
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxMjVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3NSAxNzVIMjI1TDIwMCAxNTBaIiBmaWxsPSIjOUI5QkEzIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QkEzIiBmb250LXNpemU9IjE0Ij7lnJbniYfnhKHms5XpoIHnpLo8L3RleHQ+Cjwvc3ZnPgo='
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">無圖片檔案</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}