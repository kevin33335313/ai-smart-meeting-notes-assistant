'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts'
import { FileText, DollarSign, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'


interface Stats {
  total_invoices: number
  total_amount: number
  category_stats: Array<{
    category: string
    count: number
    amount: number
  }>
}

export default function InvoiceDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('month')

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/invoice/stats/summary')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('載入統計資料失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  // 高對比度配色方案 - 使用不同色系
  const COLORS = [
    '#f97316', // 橙色 - 餐飲
    '#3b82f6', // 藍色 - 交通
    '#10b981', // 綠色 - 辦公用品
    '#8b5cf6', // 紫色 - 娛樂
    '#f59e0b', // 琥珀色 - 購物
    '#ef4444', // 紅色 - 醫療
    '#06b6d4', // 青色 - 教育
    '#84cc16'  // 萊姆綠 - 其他
  ]

  // 消費頻率分析數據
  const frequencyData = stats?.category_stats
    .filter(item => item.count > 0)
    .map(item => ({
      category: item.category,
      frequency: item.count,
      avgPrice: item.amount / item.count,
      totalSpent: item.amount
    }))
    .sort((a, b) => b.frequency - a.frequency) || []



  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-200 border-t-orange-500 rounded-full mx-auto mb-4"
        />
        <p className="text-gray-500">載入統計資料中...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">無法載入統計資料</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 時間範圍選擇器 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">統計分析</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === 'week' ? '本週' : range === 'month' ? '本月' : '本年'}
            </button>
          ))}
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總發票數</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_invoices}</p>
              <p className="text-xs text-gray-500 mt-1">本月累計</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">總支出</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                NT$ {Math.round(stats.total_amount).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">本月累計</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均金額</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                NT$ {stats.total_invoices > 0 ? Math.round(stats.total_amount / stats.total_invoices).toLocaleString() : 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">每張發票</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>


      </div>

      {/* 圖表區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 支出趨勢圖 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">消費頻率分析</h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                <span className="text-gray-600">消費次數</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">平均單價</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'frequency' ? `${value} 次` : `NT$ ${Math.round(Number(value)).toLocaleString()}`,
                    name === 'frequency' ? '消費次數' : '平均單價'
                  ]}
                  labelFormatter={(label) => `類別: ${label}`}
                />
                <Bar yAxisId="left" dataKey="frequency" fill="#86efac" name="frequency" />
                <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#3b82f6" strokeWidth={2} name="avgPrice" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 類別分布圓餅圖 */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">支出分布</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.category_stats.filter(item => item.amount > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {stats.category_stats.filter(item => item.amount > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`NT$ ${Math.round(Number(value)).toLocaleString()}`, '金額']}
                  labelFormatter={(label) => `類別: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.category_stats.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600">{item.category}</span>
                </div>
                <span className="font-medium text-gray-900">
                  NT$ {Math.round(item.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 類別詳細分析 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">類別分析</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.category_stats.filter(item => item.count > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'count' ? `${value} 張` : `NT$ ${Math.round(Number(value)).toLocaleString()}`,
                  name === 'count' ? '發票數量' : '總金額'
                ]}
                labelFormatter={(label) => `類別: ${label}`}
              />
              <Bar dataKey="count" fill="#f97316" name="count" />
              <Bar dataKey="amount" fill="#3b82f6" name="amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 詳細統計表格 */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">詳細統計</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  類別
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  發票數量
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  總金額
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  平均金額
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  佔比
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.category_stats.map((category, index) => (
                <tr key={category.category} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium text-gray-900">{category.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {category.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    NT$ {Math.round(category.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    NT$ {category.count > 0 ? Math.round(category.amount / category.count).toLocaleString() : 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${stats.total_amount > 0 ? (category.amount / stats.total_amount) * 100 : 0}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 min-w-[3rem]">
                        {stats.total_amount > 0 ? ((category.amount / stats.total_amount) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}