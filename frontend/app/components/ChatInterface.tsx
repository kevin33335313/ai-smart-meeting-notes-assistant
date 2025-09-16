'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageSquare, Bot, ChevronDown, Sparkles, Brain } from "lucide-react"
import AnswerDisplay from './AnswerDisplay'
import QuizDisplay from './QuizDisplay'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  sources?: Array<{
    file_name: string
    page?: number
    chunk_id?: string
  }>
  quiz?: Array<{
    id: number
    question: string
    options: string[]
    correct_answer: number
  }>
  timestamp: Date
}

interface ChatInterfaceProps {
  onSourceClick: (source: any) => void
  sessionId?: string
}

export default function ChatInterface({ onSourceClick, sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState(3)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // 生成測驗的處理函數
  const handleGenerateQuiz = async (numQuestions: number) => {
    if (!sessionId) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('http://localhost:8000/api/document-qa/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, num_questions: numQuestions })
      })
      if (response.ok) {
        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          const quizMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: '',
            quiz: data.questions,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, quizMessage])
        } else {
          const errorMessage: Message = {
            id: Date.now().toString(),
            type: 'assistant',
            content: '無法生成測驗題目，請確認文檔內容充足。',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }
    } catch (error) {
      console.error('Quiz failed:', error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '測驗生成失敗，請稍後再試。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 自動滾動到底部
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }, 100)
        }
      }
    }
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/document-qa/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          session_id: sessionId
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Query failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 聊天記錄區 */}
      <div className="flex-1 mb-6 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className="h-full p-6 bg-gradient-to-b from-white/50 to-gray-50/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="mb-6">
                    <div className="p-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 w-fit mx-auto">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">開始智能對話</h3>
                  <p className="text-gray-600 mb-4">上傳文件後，您可以詢問任何相關問題</p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>智能摘要生成</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>互動式測驗</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span>精確來源引用</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-8`}>
                    {message.type === 'user' ? (
                      <div className="max-w-[75%]">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl rounded-br-md px-5 py-4 shadow-lg relative">
                          <p className="leading-relaxed">{message.content}</p>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 transform rotate-45"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right font-medium">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ) : (
                      <div className="max-w-[85%] w-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="relative">
                            <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-md">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-800">AI 智能助手</span>
                            <span className="text-xs text-gray-500 ml-2">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {message.quiz ? (
                          <QuizDisplay questions={message.quiz} />
                        ) : (
                          <AnswerDisplay
                            answer={message.content}
                            sources={message.sources || []}
                            onSourceClick={onSourceClick}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-8">
                    <div className="max-w-[85%]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                          <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 shadow-md">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">AI 智能助手</span>
                        </div>
                      </div>
                      <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl rounded-tl-md border border-gray-200/50 relative">
                        <div className="absolute -top-1 -left-1 w-4 h-4 bg-white/90 transform rotate-45 border-l border-t border-gray-200/50"></div>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">正在思考中...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
      </div>

      {/* 輸入區 */}
      <Card className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-200/50">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={async () => {
                  if (!sessionId) return
                  
                  setIsLoading(true)
                  
                  try {
                    const response = await fetch('http://localhost:8000/api/document-qa/summary', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ session_id: sessionId })
                    })
                    if (response.ok) {
                      const data = await response.json()
                      const summaryMessage: Message = {
                        id: Date.now().toString(),
                        type: 'assistant',
                        content: data.summary,
                        timestamp: new Date()
                      }
                      setMessages(prev => [...prev, summaryMessage])
                    }
                  } catch (error) {
                    console.error('Summary failed:', error)
                    const errorMessage: Message = {
                      id: Date.now().toString(),
                      type: 'assistant',
                      content: '摘要生成失敗，請稍後再試。',
                      timestamp: new Date()
                    }
                    setMessages(prev => [...prev, errorMessage])
                  } finally {
                    setIsLoading(false)
                  }
                }}
                disabled={isLoading || !sessionId}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 h-10"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                生成摘要
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isLoading || !sessionId}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 px-4 py-2 h-10 flex items-center gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    生成{quizQuestions}道測驗
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-gray-200">
                  <DropdownMenuItem onClick={() => {
                    setQuizQuestions(3)
                    handleGenerateQuiz(3)
                  }} className="hover:bg-purple-50">
                    生成3道測驗
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setQuizQuestions(5)
                    handleGenerateQuiz(5)
                  }} className="hover:bg-purple-50">
                    生成5道測驗
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setQuizQuestions(10)
                    handleGenerateQuiz(10)
                  }} className="hover:bg-purple-50">
                    生成10道測驗
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="請輸入您的問題，或試試問：'這份文件的主要內容是什麼？'"
                  className="flex-1 min-h-[60px] max-h-[100px] resize-none bg-gray-50/80 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2 text-sm leading-relaxed transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                  Enter 發送
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="self-end bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-10 w-10 rounded-xl"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}