"use client"

import { useState, useEffect } from "react"
import { Loader, Download, FileImage, Palette, Layout, Sparkles, FileText, Megaphone } from "lucide-react"
import { BackButton } from "@/components/ui/back-button"

export default function PosterGenerator() {
  const [textContent, setTextContent] = useState("")
  const [style, setStyle] = useState("modern_tech")
  const [posterType, setPosterType] = useState("announcement")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null)

  // 載入歷史記錄
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/poster-generator/history')
        const data = await response.json()
        setHistory(data.history || [])
      } catch (err) {
        console.error('無法載入歷史記錄:', err)
      }
    }
    loadHistory()
  }, [])

  const styles = [
    { value: "corporate_formal", label: "企業正式風格", desc: "專業、正式的商務設計" },
    { value: "modern_tech", label: "現代科技風格", desc: "時尚、科技感的設計" },
    { value: "creative_vibrant", label: "創意活潑風格", desc: "色彩豐富、充滿創意" },
    { value: "vintage_retro", label: "復古懷舊風格", desc: "經典、懷舊的視覺風格" }
  ]

  const posterTypes = [
    { value: "announcement", label: "公告通知", desc: "企業公告、通知事項", icon: Megaphone },
    { value: "promotion", label: "促銷宣傳", desc: "產品促銷、活動宣傳", icon: Sparkles },
    { value: "safety", label: "安全提醒", desc: "安全注意事項、防護措施", icon: FileImage },
    { value: "training", label: "培訓教育", desc: "教育訓練、學習指導", icon: FileText },
    { value: "event", label: "活動宣傳", desc: "會議、活動等宣傳", icon: Layout },
    { value: "product", label: "產品發布", desc: "新產品介紹、功能展示", icon: Palette }
  ]

  const handleGenerate = async () => {
    if (!textContent.trim()) {
      setError("請輸入海報文字內容")
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      // 發送生成請求
      const response = await fetch('http://localhost:8000/api/v1/poster-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text_content: textContent,
          style: style,
          poster_type: posterType
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '生成失敗')
      }

      const taskId = data.task_id
      setSessionId(taskId)
      
      // 輪詢任務狀態
      const pollStatus = async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/v1/poster-generator/task/${taskId}`)
          const statusData = await statusResponse.json()
          
          if (statusData.status === 'completed') {
            const newResult = {
              success: true,
              image_url: statusData.result.download_url,
              enhanced_prompt: statusData.enhanced_prompt,
              session_id: taskId,
              message: "海報生成成功！",
              available_adjustments: ["更戲劇化", "更柔和", "更換調色盤", "改變角度"]
            }
            setResult(newResult)
            setIsGenerating(false)
            
            // 更新歷史記錄
            const newHistoryItem = {
              task_id: taskId,
              text_content: textContent,
              style: style,
              poster_type: posterType,
              image_url: statusData.result.download_url,
              enhanced_prompt: statusData.enhanced_prompt
            }
            setHistory(prev => [newHistoryItem, ...prev])
          } else if (statusData.status === 'failed') {
            throw new Error(statusData.error || '生成失敗')
          } else {
            // 繼續輪詢
            setTimeout(pollStatus, 2000)
          }
        } catch (err) {
          setError('檢查狀態失敗')
          setIsGenerating(false)
        }
      }
      
      // 開始輪詢
      setTimeout(pollStatus, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成請求失敗，請稍後再試')
      setIsGenerating(false)
    }
  }

  const handleAdjustment = async (adjustmentType: string) => {
    if (!sessionId) return
    
    setIsGenerating(true)
    try {
      // TODO: 實現調整功能 API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockAdjustedResult = {
        ...result,
        image_url: `/api/adjusted-poster-${adjustmentType}.jpg`,
        message: `已套用「${adjustmentType}」調整`
      }
      
      setResult(mockAdjustedResult)
      setIsGenerating(false)
    } catch (err) {
      setError('調整失敗')
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <BackButton />
        
        <div className="text-center mb-8 mt-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileImage className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              AI 智能海報生成器
            </h1>
          </div>
          <p className="text-xl text-gray-600">輸入文字內容，AI 為您設計專業海報</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：輸入區域 */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              海報內容
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  文字內容 *
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="輸入海報的主要文字內容，例如：&#10;「公司年終聚餐」&#10;「新產品發布會」&#10;「安全注意事項」等..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  海報類型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {posterTypes.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setPosterType(type.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${
                          posterType === type.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4" />
                          <div className="font-medium text-sm">{type.label}</div>
                        </div>
                        <div className="text-xs text-gray-500">{type.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  設計風格
                </label>
                <div className="space-y-2">
                  {styles.map((styleOption) => (
                    <button
                      key={styleOption.value}
                      onClick={() => setStyle(styleOption.value)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        style === styleOption.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{styleOption.label}</div>
                      <div className="text-sm text-gray-500">{styleOption.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !textContent.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    AI 設計中...
                  </>
                ) : (
                  <>
                    <FileImage className="w-5 h-5" />
                    生成海報
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 中間：預覽區域 */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">海報預覽</h2>
              {history.length > 0 && (
                <span className="text-sm text-gray-500">共 {history.length} 張歷史海報</span>
              )}
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 min-h-96 mb-6">
              {isGenerating ? (
                <div className="text-center">
                  <Loader className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">AI 正在設計您的海報...</p>
                  <p className="text-sm text-gray-500 mt-2">請稍候，這可能需要幾分鐘</p>
                  <div className="mt-4 bg-white rounded-lg p-4 max-w-xs mx-auto">
                    <div className="text-xs text-gray-600 mb-2">正在生成：</div>
                    <div className="text-sm font-medium text-gray-800">{textContent}</div>
                  </div>
                </div>
              ) : result || selectedHistoryItem ? (
                <div className="text-center w-full">
                  <div className="bg-white rounded-lg shadow-lg p-4 mb-4 max-w-md mx-auto">
                    <div className="aspect-[3/4] bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {(result?.image_url || selectedHistoryItem?.image_url) ? (
                        <img 
                          src={`http://localhost:8000${result?.image_url || selectedHistoryItem?.image_url}`}
                          alt="海報預覽"
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'block'
                          }}
                        />
                      ) : null}
                      <div className="text-center p-6" style={{display: (result?.image_url || selectedHistoryItem?.image_url) ? 'none' : 'block'}}>
                        <FileImage className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                        <p className="text-gray-600 font-medium">海報預覽</p>
                        <p className="text-sm text-gray-500 mt-2">{result?.enhanced_prompt || selectedHistoryItem?.enhanced_prompt}</p>
                      </div>
                    </div>
                  </div>
                  {(result?.image_url || selectedHistoryItem?.image_url) && (
                    <a
                      href={`http://localhost:8000${result?.image_url || selectedHistoryItem?.image_url}`}
                      download={`poster_${result?.session_id || selectedHistoryItem?.task_id}.png`}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      下載海報
                    </a>
                  )}
                </div>
              ) : history.length > 0 ? (
                <div className="text-center text-gray-500">
                  <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">選擇下方歷史海報預覽</p>
                  <p className="text-sm mt-2">或輸入新內容生成新海報</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FileImage className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">您的海報將在此顯示</p>
                  <p className="text-sm mt-2">輸入文字內容並點擊生成開始設計</p>
                </div>
              )}
            </div>

            {/* 歷史海報列表 */}
            {history.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">歷史海報</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                  {history.map((item, index) => (
                    <button
                      key={item.task_id}
                      onClick={() => {
                        setSelectedHistoryItem(item)
                        setResult(null)
                      }}
                      className={`relative group bg-white border-2 rounded-lg p-2 transition-all hover:shadow-md ${
                        selectedHistoryItem?.task_id === item.task_id
                          ? 'border-orange-500 shadow-md'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-gray-100 rounded overflow-hidden mb-2">
                        <img
                          src={`http://localhost:8000${item.image_url}`}
                          alt={`海報 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {item.text_content}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  )
}