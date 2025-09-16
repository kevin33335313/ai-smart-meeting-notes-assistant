'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, CheckCircle, AlertCircle, Loader2, FileText, Scan, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'analyzing' | 'extracting' | 'classifying' | 'success' | 'error'
  message?: string
  data?: any
  progress?: number
}

export default function InvoiceUpload() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' })
  const [dragActive, setDragActive] = useState(false)

  const handleUpload = async (file: File) => {
    // 模擬處理步驟
    const steps = [
      { status: 'uploading' as const, message: '正在上傳圖片...', progress: 20 },
      { status: 'analyzing' as const, message: '正在分析圖片...', progress: 40 },
      { status: 'extracting' as const, message: '提取文字中...', progress: 70 },
      { status: 'classifying' as const, message: '智能分類中...', progress: 90 }
    ]

    try {
      // 逐步更新狀態
      for (const step of steps) {
        setUploadStatus(step)
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:8000/api/invoice/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上傳失敗')
      }

      const result = await response.json()
      setUploadStatus({
        status: 'success',
        message: '發票處理完成！',
        data: result,
        progress: 100
      })
    } catch (error: any) {
      setUploadStatus({
        status: 'error',
        message: error.message || '上傳失敗，請重試'
      })
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">上傳發票</h2>
      
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 overflow-hidden
          ${isDragActive || dragActive
            ? 'border-orange-400 bg-orange-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-orange-300 hover:bg-orange-25'
          }
          ${['uploading', 'analyzing', 'extracting', 'classifying'].includes(uploadStatus.status) ? 'pointer-events-none' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        {/* 背景動畫 */}
        <AnimatePresence>
          {(isDragActive || dragActive) && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-xl"
            />
          )}
        </AnimatePresence>
        
        <div className="relative z-10 flex flex-col items-center">
          {/* 處理狀態圖標 */}
          <AnimatePresence mode="wait">
            {uploadStatus.status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-4"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-20 bg-gradient-to-b from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-2 shadow-md"
                  >
                    <FileText className="w-8 h-8 text-orange-600" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Upload className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            {uploadStatus.status === 'uploading' && (
              <motion.div key="uploading" className="mb-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
              </motion.div>
            )}
            
            {uploadStatus.status === 'analyzing' && (
              <motion.div key="analyzing" className="mb-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                  <Scan className="w-12 h-12 text-blue-500" />
                </motion.div>
              </motion.div>
            )}
            
            {uploadStatus.status === 'extracting' && (
              <motion.div key="extracting" className="mb-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <FileText className="w-12 h-12 text-purple-500" />
                </motion.div>
              </motion.div>
            )}
            
            {uploadStatus.status === 'classifying' && (
              <motion.div key="classifying" className="mb-4">
                <motion.div animate={{ rotateY: [0, 180, 360] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Brain className="w-12 h-12 text-green-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 進度條 */}
          {uploadStatus.progress !== undefined && uploadStatus.progress > 0 && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="w-full max-w-xs mb-4"
            >
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadStatus.progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">{uploadStatus.progress}%</p>
            </motion.div>
          )}
          
          <motion.h3 
            key={uploadStatus.message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-gray-900 mb-2"
          >
            {uploadStatus.message || '拖放發票圖片或點擊上傳'}
          </motion.h3>
          
          {uploadStatus.status === 'idle' && (
            <>
              <p className="text-sm text-gray-500 mb-4">
                支援 JPG、PNG、GIF 格式，檔案大小不超過 10MB
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  手機拍照
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  檔案上傳
                </motion.div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {uploadStatus.status !== 'idle' && (
        <div className="mt-6">
          {uploadStatus.status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-green-800">{uploadStatus.message}</span>
              </div>
              
              {uploadStatus.data && (
                <>
                  {/* 重複發票提醒 */}
                  {uploadStatus.data._duplicate_warning && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-amber-500 mr-2" />
                        <div>
                          <p className="text-amber-800 font-medium">發現重複發票</p>
                          <p className="text-amber-700 text-sm">
                            發票號碼 "{uploadStatus.data._original_invoice_number}" 已存在，已自動重新命名為 "{uploadStatus.data.invoice_number}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 bg-white rounded border p-4">
                    <h4 className="font-medium text-gray-900 mb-3">識別結果</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">發票號碼：</span>
                        <span className="font-medium">{uploadStatus.data.invoice_number || '未識別'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">商家名稱：</span>
                        <span className="font-medium">{uploadStatus.data.vendor_name || '未識別'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">總金額：</span>
                        <span className="font-medium">NT$ {Math.round(uploadStatus.data.total_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">費用類別：</span>
                        <span className="font-medium">{uploadStatus.data.category || '其他'}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {uploadStatus.status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-800">{uploadStatus.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadStatus.status !== 'idle' && !['uploading', 'analyzing', 'extracting', 'classifying'].includes(uploadStatus.status) && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setUploadStatus({ status: 'idle' })}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            上傳另一張發票
          </button>
        </div>
      )}
    </div>
  )
}