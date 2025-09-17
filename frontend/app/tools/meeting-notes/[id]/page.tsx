"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

// 重定向到統一的筆記頁面
export default function MeetingNoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string

  useEffect(() => {
    // 重定向到統一的筆記頁面
    router.replace(`/notes/${noteId}`)
  }, [noteId, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
        <p className="text-gray-600">正在跳轉到筆記頁面...</p>
      </div>
    </div>
  )
}