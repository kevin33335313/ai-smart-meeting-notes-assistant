"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Calendar, Trash2, Eye, Search, Filter, Edit2, Check, X, Share, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { createPortal } from "react-dom"

interface Note {
  task_id: string
  filename: string
  created_at: string
  title: string
  summary: string
  tags?: string[]
  theme?: string
}

interface NotesManagerProps {
  onNotesCountChange?: (count: number) => void
}

export function NotesManager({ onNotesCountChange }: NotesManagerProps = {}) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [connectionError, setConnectionError] = useState(false)
  const [noteThemes, setNoteThemes] = useState<Record<string, string>>({})

  // 從 localStorage 載入主題設定
  useEffect(() => {
    const savedThemes = localStorage.getItem('noteThemes')
    if (savedThemes) {
      try {
        setNoteThemes(JSON.parse(savedThemes))
      } catch (error) {
        console.error('Failed to load note themes:', error)
      }
    }
  }, [])
  const [activeThemeMenu, setActiveThemeMenu] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const themeOptions = [
    { id: 'default', header: 'bg-blue-100 group-hover:bg-blue-200', icon: 'from-blue-500 to-indigo-600' },
    { id: 'green', header: 'bg-green-100 group-hover:bg-green-200', icon: 'from-green-500 to-emerald-600' },
    { id: 'purple', header: 'bg-purple-100 group-hover:bg-purple-200', icon: 'from-purple-500 to-violet-600' },
    { id: 'orange', header: 'bg-orange-100 group-hover:bg-orange-200', icon: 'from-orange-500 to-amber-600' },
    { id: 'pink', header: 'bg-pink-100 group-hover:bg-pink-200', icon: 'from-pink-500 to-rose-600' },
  ]

  const getTheme = (noteId: string) => {
    const themeId = noteThemes[noteId] || 'default'
    return themeOptions.find(t => t.id === themeId) || themeOptions[0]
  }

  const setNoteTheme = (noteId: string, themeId: string) => {
    const newThemes = { ...noteThemes, [noteId]: themeId }
    setNoteThemes(newThemes)
    localStorage.setItem('noteThemes', JSON.stringify(newThemes))
  }

  const loadNotes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/notes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        const notesList = data.notes || []
        setNotes(notesList)
        onNotesCountChange?.(notesList.length)
      } else {
        console.error("API response not ok:", response.status)
        setNotes([])
      }
    } catch (error) {
      console.error("Failed to load notes:", error)
      // 後端未運行時設置空數組
      setNotes([])
      setConnectionError(true)
    } finally {
      setLoading(false)
    }
  }

  const deleteNote = async (taskId: string) => {
    if (!confirm("確定要刪除這個筆記嗎？")) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/delete`, {
        method: "DELETE"
      })
      if (response.ok) {
        setNotes(prev => {
          const filtered = prev.filter(note => note.task_id !== taskId)
          onNotesCountChange?.(filtered.length)
          return filtered
        })
      }
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const startEditing = (note: Note) => {
    setEditingId(note.task_id)
    setEditTitle(note.title)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditTitle("")
  }

  const saveTitle = async (taskId: string) => {
    if (!editTitle.trim()) return
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/notes/${taskId}/title`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: editTitle.trim() })
      })
      
      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.task_id === taskId 
            ? { ...note, title: editTitle.trim() }
            : note
        ))
        setEditingId(null)
        setEditTitle("")
        // 重新載入筆記列表
        setRefreshKey(prev => prev + 1)
      }
    } catch (error) {
      console.error("Failed to update note title:", error)
    }
  }

  useEffect(() => {
    setConnectionError(false)
    loadNotes()
  }, [refreshKey])

  // 每30秒自動重新載入
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 搜尋欄 */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋筆記標題、檔名或內容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white/80 backdrop-blur-sm text-sm placeholder-gray-400 shadow-sm hover:shadow-md"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* 筆記列表 */}
      <div className="space-y-4">
        <AnimatePresence>
          {connectionError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-500 to-orange-600 flex items-center justify-center">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">無法連接到後端服務</p>
              <p className="text-gray-600 mb-4">請確認後端服務器是否在 http://localhost:8000 運行</p>
              <Button 
                onClick={() => {
                  setConnectionError(false)
                  setLoading(true)
                  loadNotes()
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                重新連接
              </Button>
            </motion.div>
          ) : filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <motion.div 
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl"
              >
                <FileText className="h-10 w-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">開始您的第一個筆記</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto leading-relaxed">
                上傳音頻檔案，讓 AI 為您生成結構化的會議筆記、摘要和心智圖
              </p>
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>支援 MP3、M4A、WAV</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>AI 智能分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>自動生成心智圖</span>
                </div>
              </div>
            </motion.div>
          ) : (
            filteredNotes.map((note, index) => (
              <motion.div
                key={note.task_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/notes/${note.task_id}`}>
                  <motion.div whileHover={{ y: -4, scale: 1.01 }}>
                    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-2xl hover:border-emerald-200 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden">
                    <CardHeader className={`pb-4 relative transition-all duration-200 ${getTheme(note.task_id).header} border-b border-white/50`}>
                    {/* 懸停操作按鈕 */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      {/* 顏色主題選擇器 */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const rect = e.currentTarget.getBoundingClientRect()
                          setMenuPosition({
                            top: rect.bottom + 4,
                            left: rect.right - 120
                          })
                          setActiveThemeMenu(activeThemeMenu === note.task_id ? null : note.task_id)
                        }}
                        className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="選擇主題"
                      >
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${getTheme(note.task_id).icon}`}></div>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          try {
                            await navigator.clipboard.writeText(note.summary)
                            console.log('摘要已複製到剪貼簿')
                          } catch (err) {
                            console.error('複製失敗:', err)
                          }
                        }}
                        className="p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="複製摘要"
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (navigator.share) {
                            navigator.share({
                              title: note.title,
                              text: note.summary,
                              url: window.location.origin + `/notes/${note.task_id}`
                            })
                          }
                        }}
                        className="p-2 rounded-full bg-blue-500/10 backdrop-blur-sm text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="分享"
                      >
                        <Share className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          deleteNote(note.task_id)
                        }}
                        className="p-2 rounded-full bg-red-500/10 backdrop-blur-sm text-red-600 hover:bg-red-500/20 hover:text-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="刪除筆記"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>

                    <div className="flex items-start gap-4 pr-36">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 bg-gradient-to-br ${getTheme(note.task_id).icon} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <FileText className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        {editingId === note.task_id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle(note.task_id)
                                if (e.key === 'Escape') cancelEditing()
                              }}
                              autoFocus
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                saveTitle(note.task_id)
                              }}
                              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                cancelEditing()
                              }}
                              className="p-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors shadow-sm"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors duration-200">
                            {note.title}
                          </CardTitle>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="font-medium">{note.filename}</span>
                          <span>•</span>
                          <span>{formatDate(note.created_at)}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              startEditing(note)
                            }}
                            className="ml-2 text-orange-500 hover:text-orange-600 transition-colors"
                            title="編輯標題"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                    <CardContent className="pt-0 px-6 pb-6">
                      <CardDescription className="text-sm text-gray-700 leading-relaxed mb-4 group-hover:text-gray-800 transition-colors duration-200 line-clamp-3">
                        {note.summary}
                      </CardDescription>
                    
                    {/* 標籤區域 */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="tags-container" style={{ marginTop: '12px' }}>
                        {note.tags.map((tag, index) => {
                          // 根據標籤內容決定樣式
                          const getTagClass = (tagText: string) => {
                            if (tagText.includes('專案') || tagText.includes('會議') || tagText.includes('討論')) {
                              return 'tag tag-project'
                            }
                            if (tagText.includes('重要') || tagText.includes('決策') || tagText.includes('關鍵')) {
                              return 'tag tag-important'
                            }
                            return 'tag tag-project' // 預設樣式
                          }
                          
                          return (
                            <span
                              key={index}
                              className={getTagClass(tag)}
                            >
                              # {tag}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Portal 主題選擇菜單 */}
      {activeThemeMenu && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed bg-white rounded-lg shadow-xl border p-2 z-[10000]"
          style={{
            top: menuPosition.top,
            left: menuPosition.left
          }}
          onMouseLeave={() => setActiveThemeMenu(null)}
        >
          <div className="flex gap-2 p-1">
            {themeOptions.map(theme => (
              <button
                key={theme.id}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setNoteTheme(activeThemeMenu, theme.id)
                  setActiveThemeMenu(null)
                }}
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.icon} hover:scale-110 transition-transform ${
                  getTheme(activeThemeMenu).id === theme.id ? 'ring-2 ring-gray-400 ring-offset-2' : ''
                }`}
                title={`主題 ${theme.id}`}
              />
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}