'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error'
  message?: string
  data?: any
}

export default function InvoiceUpload() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' })

  // 處理檔案上傳
  const handleUpload = async (file: File) => {
    setUploadStatus({ status: 'uploading', message: '正在處理發票...' })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post('http://localhost:8000/api/upload-invoice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setUploadStatus({
        status: 'success',
        message: '發票處理完成！',
        data: response.data
      })
    } catch (error: any) {
      setUploadStatus({
        status: 'error',
        message: error.response?.data?.detail || '上傳失敗，請重試'
      })
    }
  }

  // 拖放區域配置
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">上傳發票</h2>
        
        {/* 上傳區域 */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploadStatus.status === 'uploading' ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center">
            {uploadStatus.status === 'uploading' ? (
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
            )}
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploadStatus.status === 'uploading' 
                ? '正在處理中...' 
                : '拖放發票圖片或點擊上傳'
              }
            </h3>
            
            <p className="text-sm text-gray-500 mb-4">
              支援 JPG、PNG、GIF 格式，檔案大小不超過 10MB
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                手機拍照
              </div>
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-1" />
                檔案上傳
              </div>
            </div>
          </div>
        </div>

        {/* 狀態訊息 */}
        {uploadStatus.status !== 'idle' && (
          <div className="mt-6">
            {uploadStatus.status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-800">{uploadStatus.message}</span>
                </div>
                
                {/* 顯示識別結果 */}
                {uploadStatus.data && (
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
                        <span className="font-medium">NT$ {uploadStatus.data.total_amount || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">費用類別：</span>
                        <span className="font-medium">{uploadStatus.data.category || '其他'}</span>
                      </div>
                    </div>
                  </div>
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

        {/* 重新上傳按鈕 */}
        {uploadStatus.status !== 'idle' && uploadStatus.status !== 'uploading' && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setUploadStatus({ status: 'idle' })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              上傳另一張發票
            </button>
          </div>
        )}
      </div>
    </div>
  )
}