"use client"

import { useState } from 'react'
import { Settings, X, Type, Palette, Eye, Brain } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { useSettings } from './SettingsContext'

// 設置面板組件
export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    fontSize, theme, focusMode, showMindMap,
    setFontSize, setTheme, setFocusMode, setShowMindMap 
  } = useSettings()

  return (
    <>
      {/* 設置按鈕 */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed top-6 left-6 z-20 bg-white/90 hover:bg-white shadow-lg"
        title="閱讀設定"
      >
        <Settings className="h-4 w-4" />
      </Button>

      {/* 設置面板 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 max-w-[90vw]">
            {/* 標題列 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                閱讀設定
              </h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 設定選項 */}
            <div className="space-y-6">
              {/* 字體大小 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">字體大小</label>
                </div>
                <div className="flex gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      onClick={() => setFontSize(size)}
                      variant={fontSize === size ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      {size === 'small' && '小'}
                      {size === 'medium' && '中'}
                      {size === 'large' && '大'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 主題模式 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">主題模式</label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setTheme('light')}
                    variant={theme === 'light' ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    淺色
                  </Button>
                  <Button
                    onClick={() => setTheme('dark')}
                    variant={theme === 'dark' ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    深色
                  </Button>
                </div>
              </div>

              {/* 專注模式 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">專注模式</label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFocusMode(false)}
                    variant={!focusMode ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    關閉
                  </Button>
                  <Button
                    onClick={() => setFocusMode(true)}
                    variant={focusMode ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    開啟
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">隱藏干擾元素，專注閱讀</p>
              </div>

              {/* 心智圖顯示 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">心智圖</label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowMindMap(true)}
                    variant={showMindMap ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    顯示
                  </Button>
                  <Button
                    onClick={() => setShowMindMap(false)}
                    variant={!showMindMap ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                  >
                    隱藏
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}