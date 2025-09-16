"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Download, Loader2, Settings, Image, Upload, RefreshCw, Palette, RotateCcw, Zap, Megaphone, PartyPopper, Shield, GraduationCap, Paintbrush, Building2, Rainbow, Minus, X, ZoomIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import UsageReport from "../../components/UsageReport"
import { BackButton } from "@/components/ui/back-button"
import { PrivacyControls } from "@/components/ui/privacy-controls"

export default function PosterGeneratorPage() {
  const [textContent, setTextContent] = useState("")
  const [style, setStyle] = useState("modern")
  const [posterType, setPosterType] = useState("announcement")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPosters, setGeneratedPosters] = useState<string[]>([])
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [usageReport, setUsageReport] = useState<any>(null)
  const [tokenStats, setTokenStats] = useState({ total_tokens: 0, total_cost_usd: 0 })
  const [selectedPosterIndex, setSelectedPosterIndex] = useState<number | null>(null)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [showAdjustments, setShowAdjustments] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!textContent.trim()) return
    
    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('text_content', textContent)
      formData.append('style', style)
      formData.append('poster_type', posterType)
      
      const response = await fetch("http://localhost:8000/api/v1/generate-poster", {
        method: "POST",
        body: formData,
      })
      
      const data = await response.json()
      console.log("API Response:", data)
      
      if (data.success && data.imageUrl) {
        const imageUrl = `http://localhost:8000${data.imageUrl}`
        
        console.log('Final image URL:', imageUrl)
        setGeneratedPosters(prev => [imageUrl, ...prev])
        setSelectedPosterIndex(0) // 自動選中新生成的海報
        
        // 設定使用報告
        if (data.usage_report) {
          setUsageReport(data.usage_report)
        }
      } else {
        throw new Error(data.message || "海報生成失敗")
      }
      
      setIsGenerating(false)
      
    } catch (error) {
      console.error("Error generating poster:", error)
      setIsGenerating(false)
    }
  }

  // 海報調整功能
  const handleAdjustPoster = async (adjustmentType: string) => {
    if (selectedPosterIndex === null) return
    
    setIsAdjusting(true)
    try {
      const response = await fetch("http://localhost:8000/api/v1/adjust-poster", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustment_type: adjustmentType,
          text_content: textContent,
          style: style,
          poster_type: posterType
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Adjust API Response:", data)
      
      if (data.success && data.imageUrl) {
        const imageUrl = `http://localhost:8000${data.imageUrl}`
        setGeneratedPosters(prev => [imageUrl, ...prev])
        setSelectedPosterIndex(0) // 選中新調整的海報
      } else {
        throw new Error(data.message || "海報調整失敗")
      }
      
    } catch (error) {
      console.error("Error adjusting poster:", error)
      alert(`調整失敗: ${error.message}`)
    } finally {
      setIsAdjusting(false)
      setShowAdjustments(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
  }

  const loadTokenStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/token-stats')
      if (response.ok) {
        const data = await response.json()
        setTokenStats({
          total_tokens: data.total_tokens || 0,
          total_cost_usd: data.total_cost_usd || 0
        })
      }
    } catch (error) {
      // 静默失敗，不顯示錯誤
      setTokenStats({ total_tokens: 0, total_cost_usd: 0 })
    }
  }

  useEffect(() => {
    loadTokenStats()
    const interval = setInterval(loadTokenStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto max-w-7xl p-6">
        <BackButton className="mb-4" />
        <PrivacyControls onAnonymizerToggle={() => {}} className="mb-6" />
        {/* 頁面標題含 token 統計 */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 text-white shadow-lg"
              >
                <Sparkles className="h-8 w-8" />
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                AI 智能海報生成器
              </h1>
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
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
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600"
          >
            結合文字內容與創意靈感，AI 為您打造專業企業海報，讓視覺傳達更有力
          </motion.p>
        </motion.div>

        {/* 兩欄布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* 左欄：Control Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="h-full shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <motion.div 
                className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>
              <CardHeader className="bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                    <Settings className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  創作工作台
                </CardTitle>
                <CardDescription>設定海報主題，上傳素材，選擇設計風格</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6 overflow-y-auto">
                {/* 文字內容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">海報主題內容</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="例如：公司年會通知、安全宣導、新產品發布（只生成背景設計，不含文字）"
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-none"
                  />
                </div>

                {/* 海報類型 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">海報類型</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'announcement', name: '公告通知', icon: Megaphone, color: 'from-green-400 to-green-600' },
                      { id: 'promotion', name: '活動宣傳', icon: PartyPopper, color: 'from-purple-400 to-purple-600' },
                      { id: 'safety', name: '安全宣導', icon: Shield, color: 'from-red-400 to-red-600' },
                      { id: 'training', name: '教育培訓', icon: GraduationCap, color: 'from-blue-400 to-blue-600' }
                    ].map((typeOption) => (
                      <div
                        key={typeOption.id}
                        onClick={() => setPosterType(typeOption.id)}
                        className={`cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          posterType === typeOption.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${typeOption.color} flex items-center justify-center text-white`}>
                            <typeOption.icon className="h-4 w-4" />
                          </div>
                          <p className="text-sm font-medium text-gray-700">{typeOption.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>



                {/* 設計風格 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">設計風格</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'modern', name: '現代簡約', icon: Paintbrush, color: 'from-gray-400 to-gray-600' },
                      { id: 'corporate', name: '企業正式', icon: Building2, color: 'from-blue-400 to-blue-600' },
                      { id: 'creative', name: '創意活潑', icon: Rainbow, color: 'from-pink-400 to-purple-600' },
                      { id: 'minimal', name: '極簡風格', icon: Minus, color: 'from-slate-400 to-slate-600' }
                    ].map((styleOption) => (
                      <div
                        key={styleOption.id}
                        onClick={() => setStyle(styleOption.id)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                          style === styleOption.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${styleOption.color} flex items-center justify-center text-white mb-2`}>
                          <styleOption.icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{styleOption.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 生成按鈕 */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGenerate}
                    disabled={!textContent.trim() || isGenerating}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        正在生成專業海報...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-6 w-6" />
                        生成專業海報
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* 海報調整按鈕 */}
                <AnimatePresence>
                  {generatedPosters.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => setShowAdjustments(!showAdjustments)}
                          variant="outline"
                          className="w-full border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-700 font-medium py-3 rounded-xl transition-all duration-300"
                        >
                          <RefreshCw className="mr-2 h-5 w-5" />
                          調整海報風格
                        </Button>
                      </motion.div>

                      <AnimatePresence>
                        {showAdjustments && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-2 gap-2"
                          >
                            {[
                              { type: 'more_dramatic', label: '更戲劇化', icon: Zap, color: 'from-red-400 to-pink-500' },
                              { type: 'change_palette', label: '換色調', icon: Palette, color: 'from-blue-400 to-cyan-500' },
                              { type: 'different_angle', label: '換視角', icon: RotateCcw, color: 'from-green-400 to-emerald-500' },
                              { type: 'more_minimal', label: '更簡約', icon: Settings, color: 'from-gray-400 to-slate-500' }
                            ].map((adjustment) => (
                              <motion.button
                                key={adjustment.type}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAdjustPoster(adjustment.type)}
                                disabled={isAdjusting}
                                className={`p-3 rounded-lg bg-gradient-to-r ${adjustment.color} text-white text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50`}
                              >
                                <adjustment.icon className="h-4 w-4 mx-auto mb-1" />
                                {adjustment.label}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* 右欄：Results Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full shadow-xl border-0 bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
              <motion.div 
                className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              ></motion.div>
              <CardHeader className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50">
                <CardTitle className="flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
                    <Image className="h-5 w-5 text-indigo-600" />
                  </motion.div>
                  作品展示
                </CardTitle>
                <CardDescription>AI 生成的專業海報，融合您的內容與視覺元素</CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 h-[calc(100%-120px)] overflow-y-auto">
                {isGenerating ? (
                  <div className="space-y-6">
                    {/* 顯示既有海報 */}
                    {generatedPosters.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50">
                        {generatedPosters.map((posterUrl, index) => (
                          <motion.div 
                            key={index} 
                            className="group relative"
                          >
                            <div className="aspect-[4/3] bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100">
                              <img
                                src={posterUrl}
                                alt={`Generated Poster ${index + 1}`}
                                className="w-full h-full object-contain p-4"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* 生成中提示 */}
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-700 font-medium">正在為您生成專業級海報...</p>
                      </div>
                    </div>
                  </div>
                ) : generatedPosters.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedPosters.map((posterUrl, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="group relative"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedPosterIndex(index)}
                            className={`aspect-[4/3] bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all cursor-pointer ${
                              selectedPosterIndex === index 
                                ? 'border-purple-400 shadow-lg ring-2 ring-purple-200' 
                                : 'border-gray-100 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={posterUrl}
                              alt={`Generated Poster ${index + 1}`}
                              className="w-full h-full object-contain p-4"
                            />
                            {selectedPosterIndex === index && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 bg-purple-500/10 flex items-center justify-center"
                              >
                                <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                  已選中
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                          
                          {/* 操作按鈕 */}
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEnlargedImage(posterUrl)
                              }}
                              className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-md border"
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation()
                                try {
                                  const response = await fetch(posterUrl)
                                  const blob = await response.blob()
                                  const url = window.URL.createObjectURL(blob)
                                  const link = document.createElement('a')
                                  link.href = url
                                  link.download = `poster-${index + 1}.png`
                                  link.click()
                                  window.URL.revokeObjectURL(url)
                                } catch (error) {
                                  console.error('Download failed:', error)
                                }
                              }}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* 調整狀態提示 */}
                    <AnimatePresence>
                      {isAdjusting && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-4"
                        >
                          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            正在調整海報風格...
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center h-full text-center text-gray-500"
                  >
                    <div>
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-16 h-16 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      >
                        <Sparkles className="h-8 w-8 text-blue-500" />
                      </motion.div>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-medium text-gray-700"
                      >
                        開始創作您的專業海報
                      </motion.p>
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-gray-500 mt-1"
                      >
                        輸入主題內容，選擇設計風格，AI 將為您生成專業海報
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* 圖片放大模態框 */}
        <AnimatePresence>
          {enlargedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 overflow-auto"
              onClick={() => setEnlargedImage(null)}
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={enlargedImage}
                    alt="Enlarged Poster"
                    className="max-w-full h-auto rounded-lg shadow-2xl"
                  />
                  <Button
                    size="sm"
                    onClick={() => setEnlargedImage(null)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  )
}