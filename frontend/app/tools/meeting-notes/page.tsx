"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Plus, Mic, Calendar, Clock, FileText, Search, Upload, MoreVertical, Play, Trash2, Edit3, AlertCircle, CheckCircle, Loader, X, Check, Heart, Tag, Palette, Download, Star, CloudUpload } from "lucide-react"
import { PrivacyControls } from "@/components/ui/privacy-controls"
import { BackButton } from "@/components/ui/back-button"

// 添加 CSS 動畫樣式
const animationStyles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in { animation: fade-in 0.6s ease-out; }
  .animate-fade-in-delay { animation: fade-in 0.6s ease-out 0.2s both; }
  .animate-slide-up { animation: slide-up 0.8s ease-out; }
  .animate-slide-up-delay { animation: slide-up 0.8s ease-out 0.3s both; }
  .animate-slide-up-delay-2 { animation: slide-up 0.8s ease-out 0.6s both; }
  .animate-slide-up-delay-3 { animation: slide-up 0.8s ease-out 0.9s both; }
`

interface NoteItem {
  task_id: string
  filename: string
  status: string
  created_at: string
  color?: string
  favorite?: boolean
  tags?: string[]
  custom_tags?: string[]
  result?: {
    summary?: string
    content_blocks?: any[]
  }
}

// 標籤編輯組件
function TagItem({ tag, isAuto, onEdit, onDelete }: {
  tag: string
  isAuto: boolean
  onEdit: (oldTag: string, newTag: string) => void
  onDelete: (tag: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(tag)

  const handleSave = () => {
    if (editValue.trim() && editValue !== tag) {
      onEdit(tag, editValue.trim())
    }
    setIsEditing(false)
    setEditValue(tag)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(tag)
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg">
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-20"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') handleCancel()
          }}
          onBlur={handleSave}
          autoFocus
        />
        <button onClick={handleSave} className="text-green-500 hover:text-green-700">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors group ${
      isAuto 
        ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' 
        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
    }`}>
      <span 
        onClick={() => setIsEditing(true)}
        className="cursor-pointer hover:underline"
        title="點擊編輯"
      >
        {tag}
      </span>
      {isAuto && <span className="text-xs text-blue-500">自動</span>}
      <button
        onClick={() => onDelete(tag)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        title="刪除標籤"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function MeetingNotesPage() {
  // 注入動畫樣式
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = animationStyles
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("全部")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const [showTagEditor, setShowTagEditor] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [allTags, setAllTags] = useState<string[]>([])
  const [editingTag, setEditingTag] = useState<string | null>(null)

  const colors = [
    { name: 'emerald', class: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    { name: 'blue', class: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { name: 'purple', class: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { name: 'pink', class: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { name: 'orange', class: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    { name: 'red', class: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    { name: 'yellow', class: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    { name: 'indigo', class: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' }
  ]

  const filters = ["全部"]

  // 獲取筆記列表和標籤
  useEffect(() => {
    fetchNotes()
    fetchTags()
  }, [])

  const fetchNotes = async () => {
    try {
      // 從 notes_storage 目錄讀取筆記索引
      const response = await fetch('http://localhost:8000/api/v1/notes-list')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      } else {
        // 如果 API 不存在，先設為空陣列
        setNotes([])
      }
    } catch (error) {
      console.error('獲取筆記失敗:', error)
      setNotes([])
    } finally {
      setIsLoading(false)
    }
  }

  // 上傳音頻檔案
  const handleUpload = async () => {
    if (!uploadFile) return
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile)
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/notes', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setShowUploadModal(false)
        setUploadFile(null)
        // 跳轉到筆記頁面
        window.location.href = `/notes/${data.task_id}`
      } else {
        const errorData = await response.json()
        console.error('上傳失敗:', errorData)
        alert('上傳失敗: ' + (errorData.detail || '未知錯誤'))
      }
    } catch (error) {
      console.error('上傳失敗:', error)
      alert('上傳失敗: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/notes/tags')
      if (response.ok) {
        const data = await response.json()
        setAllTags(data.tags || [])
      }
    } catch (error) {
      // 忽略404錯誤，標籤功能為可選
      setAllTags([])
    }
  }

  // 更新筆記屬性
  const updateNoteProperties = async (taskId: string, properties: any) => {
    try {
      console.log('更新筆記屬性:', taskId, properties)
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/properties`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(properties)
      })
      
      console.log('API 回應狀態:', response.status)
      const responseData = await response.json()
      console.log('API 回應內容:', responseData)
      
      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.task_id === taskId ? { ...note, ...properties } : note
        ))
        return true
      } else {
        console.error('API 錯誤:', responseData)
      }
    } catch (error) {
      console.error('更新屬性失敗:', error)
    }
    return false
  }

  // 刪除筆記
  const handleDelete = async (taskId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setNotes(prev => prev.filter(note => note.task_id !== taskId))
        setDeleteConfirm(null)
      } else {
        const errorData = await response.json()
        alert('刪除失敗: ' + (errorData.message || '未知錯誤'))
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗: ' + error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // 編輯筆記標題
  const handleEditTitle = async (taskId: string) => {
    if (!editTitle.trim()) return
    
    setIsUpdating(true)
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: editTitle.trim() })
      })
      
      if (response.ok) {
        // 更新本地狀態
        setNotes(prev => prev.map(note => 
          note.task_id === taskId 
            ? { ...note, filename: editTitle.trim() + '.mp3' }
            : note
        ))
        setEditingNote(null)
        setEditTitle("")
      } else {
        const errorData = await response.json()
        alert('更新失敗: ' + (errorData.message || '未知錯誤'))
      }
    } catch (error) {
      console.error('更新失敗:', error)
      alert('更新失敗: ' + error.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const startEdit = (note: NoteItem) => {
    setEditingNote(note.task_id)
    setEditTitle(note.filename.replace(/\.[^/.]+$/, ""))
  }

  const cancelEdit = () => {
    setEditingNote(null)
    setEditTitle("")
  }

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (note.result?.summary || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesFilter = true
      if (selectedFilter === "收藏") matchesFilter = note.favorite === true
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      // 收藏的筆記優先顯示
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      // 相同收藏狀態下按時間排序
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: '已完成', color: 'emerald', icon: CheckCircle }
      case 'processing':
      case 'queued':
        return { label: '處理中', color: 'yellow', icon: Loader }
      case 'failed':
        return { label: '失敗', color: 'red', icon: AlertCircle }
      default:
        return { label: '未知', color: 'gray', icon: AlertCircle }
    }
  }

  const getColorClasses = (colorName: string) => {
    const color = colors.find(c => c.name === colorName) || colors[0]
    return color
  }

  const exportNote = async (note: NoteItem) => {
    try {
      const content = `# ${note.filename.replace(/\.[^/.]+$/, "")}

**創建時間**: ${new Date(note.created_at).toLocaleString('zh-TW')}

**摘要**: ${note.result?.summary || '無摘要'}

**標籤**: ${[...(note.tags || []), ...(note.custom_tags || [])].join(', ')}

---

${JSON.stringify(note.result, null, 2)}`
      
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${note.filename.replace(/\.[^/.]+$/, "")}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('匯出失敗:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* 背景裝飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          {/* 返回按鈕 */}
          <div className="mb-4">
            <BackButton />
          </div>
          
          {/* 頁面標題區域 */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Mic className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">智慧會議筆記</h1>
                <p className="text-lg text-gray-600">管理您的所有會議記錄與分析</p>
              </div>
            </div>
            
            {/* 新增筆記按鈕 */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              新增筆記
            </button>
          </div>

          {/* 搜尋和篩選區域 */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* 搜尋框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜尋會議筆記..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* 篩選按鈕 */}
            <div className="flex gap-2 flex-wrap">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {filter}
                </button>
              ))}
              <button
                onClick={() => setSelectedFilter('收藏')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  selectedFilter === '收藏'
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                <Heart className={`w-4 h-4 ${selectedFilter === '收藏' ? 'fill-current' : ''}`} />
                收藏
              </button>
            </div>
          </div>

          {/* 筆記網格 */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => {
                const statusInfo = getStatusInfo(note.status)
                const StatusIcon = statusInfo.icon
                
                const noteColor = getColorClasses(note.color || 'emerald')
                
                return (
                  <div key={note.task_id} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${noteColor.class}/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100`}></div>
                    <div className={`relative bg-white/90 backdrop-blur-xl border ${noteColor.border}/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                      {/* 檔案名稱 */}
                      <div className="mb-3">
                        {editingNote === note.task_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 text-xl font-bold bg-transparent border-b-2 border-emerald-500 focus:outline-none"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditTitle(note.task_id)
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditTitle(note.task_id)}
                              disabled={isUpdating || !editTitle.trim()}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            >
                              {isUpdating ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 text-gray-400 hover:bg-gray-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-gray-900">
                            {note.filename.replace(/\.[^/.]+$/, "")}
                          </h3>
                        )}
                      </div>

                      {/* 工具按鈕 */}
                      {editingNote !== note.task_id && (
                        <div className="flex justify-end gap-1 mb-4">
                          <button 
                            onClick={() => updateNoteProperties(note.task_id, { favorite: !note.favorite })}
                            className={`p-2 rounded-lg transition-colors ${
                              note.favorite 
                                ? 'text-red-500 hover:bg-red-50' 
                                : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
                            }`}
                            title={note.favorite ? '取消收藏' : '收藏筆記'}
                          >
                            <Heart className={`w-4 h-4 ${note.favorite ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            onClick={() => {
                              console.log('點擊調色盤按鈕', note.task_id)
                              setShowColorPicker(showColorPicker === note.task_id ? null : note.task_id)
                            }}
                            className="p-2 hover:bg-gray-50 hover:text-purple-600 rounded-lg transition-colors"
                            title="變更顏色"
                          >
                            <Palette className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowTagEditor(showTagEditor === note.task_id ? null : note.task_id)}
                            className="p-2 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                            title="管理標籤"
                          >
                            <Tag className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => exportNote(note)}
                            className="p-2 hover:bg-gray-50 hover:text-green-600 rounded-lg transition-colors"
                            title="匯出筆記"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => startEdit(note)}
                            className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                            title="編輯名稱"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(note.task_id)}
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="刪除筆記"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* 狀態標籤 */}
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full ${
                          statusInfo.color === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                          statusInfo.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                          statusInfo.color === 'red' ? 'bg-red-50 text-red-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          <StatusIcon className={`w-3 h-3 ${
                            note.status === 'processing' || note.status === 'queued' ? 'animate-spin' : ''
                          }`} />
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* 檔案資訊 */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(note.created_at).toLocaleDateString('zh-TW')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-4 h-4" />
                          {note.filename}
                        </div>
                      </div>

                      {/* 摘要 */}
                      {note.result?.summary && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {note.result.summary.substring(0, 100)}...
                        </p>
                      )}

                      {/* 標籤 */}
                      {([...(note.tags || []), ...(note.custom_tags || [])].length > 0) && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {[...(note.tags || []), ...(note.custom_tags || [])].map(tag => (
                            <button
                              key={tag}
                              onClick={() => setShowTagEditor(note.task_id)}
                              className={`px-2 py-1 ${noteColor.bg} ${noteColor.text} text-xs rounded-md hover:opacity-80 transition-opacity`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 顏色選擇器 */}
                      {showColorPicker === note.task_id && (
                        <div className="absolute top-20 right-0 z-[9999] bg-white rounded-xl shadow-xl border p-3 grid grid-cols-4 gap-2">
                          <div className="col-span-4 text-xs text-gray-500 mb-2">選擇顏色</div>
                          {colors.map(color => (
                            <button
                              key={color.name}
                              onClick={async () => {
                                const success = await updateNoteProperties(note.task_id, { color: color.name })
                                if (success) {
                                  setShowColorPicker(null)
                                }
                              }}
                              className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color.class} hover:scale-110 transition-transform ${
                                note.color === color.name ? 'ring-2 ring-gray-400' : ''
                              }`}
                              title={color.name}
                            />
                          ))}
                        </div>
                      )}



                      {/* 操作按鈕 */}
                      <div className="flex gap-2">
                        {note.status === 'completed' ? (
                          <Link href={`/notes/${note.task_id}`} className="flex-1">
                            <button className={`w-full bg-gradient-to-r ${noteColor.class} hover:opacity-90 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2`}>
                              <Play className="w-4 h-4" />
                              查看筆記
                            </button>
                          </Link>
                        ) : note.status === 'processing' || note.status === 'queued' ? (
                          <Link href={`/notes/${note.task_id}`} className="flex-1">
                            <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2">
                              <Loader className="w-4 h-4 animate-spin" />
                              處理中
                            </button>
                          </Link>
                        ) : (
                          <button className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            處理失敗
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 空狀態 */}
          {!isLoading && filteredNotes.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || selectedFilter !== "全部" ? "找不到符合條件的筆記" : "尚無會議筆記"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedFilter !== "全部" ? "試試調整搜尋條件" : "開始上傳您的第一個會議錄音檔案"}
              </p>
              {!searchTerm && selectedFilter === "全部" && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                >
                  立即開始
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 標籤編輯器 - 固定定位 */}
      {showTagEditor && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-96 max-w-full max-h-[80vh] overflow-y-auto">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              管理標籤
            </h4>
            
            {/* 新增標籤 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="輸入新標籤..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.trim() && showTagEditor) {
                      const note = notes.find(n => n.task_id === showTagEditor)
                      if (note) {
                        const currentTags = note.custom_tags || []
                        if (!currentTags.includes(newTag.trim())) {
                          updateNoteProperties(showTagEditor, { 
                            custom_tags: [...currentTags, newTag.trim()] 
                          })
                        }
                        setNewTag('')
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newTag.trim() && showTagEditor) {
                      const note = notes.find(n => n.task_id === showTagEditor)
                      if (note) {
                        const currentTags = note.custom_tags || []
                        if (!currentTags.includes(newTag.trim())) {
                          updateNoteProperties(showTagEditor, { 
                            custom_tags: [...currentTags, newTag.trim()] 
                          })
                        }
                        setNewTag('')
                      }
                    }
                  }}
                  disabled={!newTag.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  新增
                </button>
              </div>
            </div>

            {/* 現有標籤 */}
            {(() => {
              const note = notes.find(n => n.task_id === showTagEditor)
              if (!note) return null
              
              return (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">現有標籤：</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {/* 自動生成標籤 */}
                    {(note.tags || []).map(tag => (
                      <TagItem
                        key={`auto-${tag}`}
                        tag={tag}
                        isAuto={true}
                        onEdit={(oldTag, newTag) => {
                          const newTags = (note.tags || []).map(t => t === oldTag ? newTag : t)
                          updateNoteProperties(note.task_id, { tags: newTags })
                        }}
                        onDelete={(tag) => {
                          const newTags = (note.tags || []).filter(t => t !== tag)
                          updateNoteProperties(note.task_id, { tags: newTags })
                        }}
                      />
                    ))}
                    {/* 自訂標籤 */}
                    {(note.custom_tags || []).map(tag => (
                      <TagItem
                        key={`custom-${tag}`}
                        tag={tag}
                        isAuto={false}
                        onEdit={(oldTag, newTag) => {
                          const newTags = (note.custom_tags || []).map(t => t === oldTag ? newTag : t)
                          updateNoteProperties(note.task_id, { custom_tags: newTags })
                        }}
                        onDelete={(tag) => {
                          const newTags = (note.custom_tags || []).filter(t => t !== tag)
                          updateNoteProperties(note.task_id, { custom_tags: newTags })
                        }}
                      />
                    ))}
                    {([...(note.tags || []), ...(note.custom_tags || [])].length === 0) && (
                      <p className="text-sm text-gray-400 italic">尚無標籤</p>
                    )}
                  </div>
                </div>
              )
            })()}

            <div className="flex gap-2">
              <button
                onClick={() => setShowTagEditor(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 點擊外部關閉彈窗 - 暫時註解掉 */}
      {/* {showColorPicker && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowColorPicker(null)}
        />
      )} */}

      {/* 上傳模態框 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CloudUpload className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">上傳會議錄音</h2>
              <p className="text-gray-600">智能分析，自動生成筆記</p>
            </div>

            {/* 隱私警語 */}
            <PrivacyControls onAnonymizerToggle={() => {}} className="mb-4" />
            
            {/* 上傳區域 */}
            <div 
              className={`border-2 border-dashed rounded-2xl p-4 text-center mb-3 transition-all cursor-pointer ${
                uploadFile 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/30'
              }`}
              onClick={() => document.getElementById('audio-upload')?.click()}
            >
              <input
                id="audio-upload"
                type="file"
                accept=".mp3,.m4a,.wav,.mp4,.mov"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                uploadFile ? 'bg-emerald-100' : 'bg-gray-100'
              }`}>
                {uploadFile ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <Upload className="w-6 h-6 text-gray-500" />
                )}
              </div>
              {uploadFile ? (
                <div className="space-y-1">
                  <p className="text-emerald-700 font-semibold">{uploadFile.name}</p>
                  <p className="text-emerald-600 text-sm">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700 font-medium">拖拽檔案或點擊選擇</p>
                  <div className="flex justify-center gap-2 text-xs text-gray-500">
                    {['MP3', 'M4A', 'WAV', 'MP4'].map((format) => (
                      <span key={format} className="px-2 py-1 bg-gray-100 rounded">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 功能說明 */}
            <div className="bg-blue-50 rounded-xl p-3 mb-4">
              <h4 className="font-medium text-gray-800 mb-2 text-sm">
                AI 將為您生成：
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  會議摘要
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  關鍵決策
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  行動項目
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  智能標籤
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors"
                disabled={isUploading}
              >
                取消
              </button>
              <button 
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    開始分析
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">確認刪除</h2>
              <p className="text-gray-600">您確定要刪除這個筆記嗎？此操作無法復原。</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                取消
              </button>
              <button 
                onClick={() => handleDelete(deleteConfirm)}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    刪除中...
                  </>
                ) : (
                  '確認刪除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}