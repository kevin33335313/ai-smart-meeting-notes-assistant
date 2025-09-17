"use client"

import Link from "next/link"
import { Mic, Sparkles, FileText, Receipt, Brain, Zap } from "lucide-react"

export default function Home() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* 頁面標題區域 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25 transform rotate-3 hover:rotate-0 transition-transform duration-500 animate-pulse animate-wiggle">
                  <Brain className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-ping">
                  <Zap className="w-3 h-3 text-white animate-pulse" strokeWidth={2} />
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent mb-6 tracking-tight">
              AI 智能工具箱
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              探索下一代 AI 工具集合
              <br />
              <span className="text-lg text-gray-500">讓人工智能成為您創作與工作的完美夥伴</span>
            </p>
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse block"></span>
                  <span className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping"></span>
                </div>
                <span className="text-sm font-semibold text-gray-800">4 個專業工具</span>
              </div>
              <div className="w-px h-6 bg-gray-300"></div>
              <span className="text-sm text-gray-600">持續更新中</span>
            </div>
          </div>

          {/* 工具卡片網格 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI 智慧會議筆記 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Mic className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI 智慧會議筆記</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      立即可用
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  上傳會議錄音，自動生成摘要、待辦事項與心智圖
                </p>
                <Link href="/tools/meeting-notes">
                  <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3">
                    開始使用
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* AI 智能海報生成器 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Sparkles className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI 智能海報生成器</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                      立即可用
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  結合文字內容與上傳圖片，智能生成專業海報
                </p>
                <Link href="/tools/poster-generator">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3">
                    開始使用
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* RAG 文件問答系統 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-violet-500 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">RAG 文件問答系統</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                      立即可用
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  上傳多個文件，智能問答、摘要生成與測驗功能
                </p>
                <Link href="/rag-chat">
                  <button className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3">
                    開始使用
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>

            {/* AI 智能發票管理 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="flex items-start gap-6 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      <Receipt className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">AI 智能發票管理</h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full">
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                      立即可用
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                  自動識別發票資訊，智能分類與統計分析
                </p>
                <Link href="/tools/invoice-manager">
                  <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-3">
                    開始使用
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}