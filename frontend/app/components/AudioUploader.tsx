"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// 音訊上傳組件
export default function AudioUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // 處理檔案選擇
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // 處理檔案上傳
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('http://localhost:8000/api/v1/notes', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上傳失敗')
      }

      const data = await response.json()
      // 上傳成功後立即跳轉到筆記頁面
      router.push(`/notes/${data.task_id}`)
    } catch (error) {
      console.error('上傳錯誤:', error)
      alert('檔案上傳失敗，請檢查網路連線或檔案格式後重試')
    } finally {
      setIsLoading(false)
    }
  }

  // 動態按鈕文字
  const getButtonText = () => {
    if (isLoading) return "正在上傳處理中..."
    if (selectedFile) return "開始生成筆記"
    return "選擇音訊檔案"
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI 智慧會議筆記</CardTitle>
        <CardDescription>
          上傳您的會議錄音，立即生成摘要、待辦事項與心智圖。
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 檔案輸入區域 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            id="audio-upload"
            onChange={handleFileChange}
          />
          <label
            htmlFor="audio-upload"
            className="cursor-pointer flex flex-col items-center space-y-2"
          >
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              {selectedFile ? `已選擇: ${selectedFile.name}` : "點擊此處選擇音訊檔案"}
            </p>
            <p className="text-xs text-gray-400">支援 MP3、M4A、WAV 格式</p>
          </label>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={selectedFile ? handleUpload : undefined}
          disabled={isLoading}
        >
          {getButtonText()}
        </Button>
      </CardFooter>
    </Card>
  )
}