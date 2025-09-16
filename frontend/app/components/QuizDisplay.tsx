'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, HelpCircle, Brain } from "lucide-react"

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: number
}

interface QuizDisplayProps {
  questions: Question[]
}

export default function QuizDisplay({ questions }: QuizDisplayProps) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState<{ [key: number]: boolean }>({})

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
    setShowResults(prev => ({ ...prev, [questionId]: true }))
  }

  const getOptionStyle = (questionId: number, optionIndex: number, correctAnswer: number) => {
    if (!showResults[questionId]) {
      return "hover:bg-gray-50 cursor-pointer border-gray-200"
    }
    
    const userAnswer = answers[questionId]
    if (optionIndex === correctAnswer) {
      return "bg-green-50 border-green-200 text-green-800"
    } else if (optionIndex === userAnswer && optionIndex !== correctAnswer) {
      return "bg-red-50 border-red-200 text-red-800"
    } else {
      return "bg-gray-50 border-gray-200 text-gray-600"
    }
  }

  const getOptionIcon = (questionId: number, optionIndex: number, correctAnswer: number) => {
    if (!showResults[questionId]) {
      return <HelpCircle className="h-4 w-4 text-gray-400" />
    }
    
    const userAnswer = answers[questionId]
    if (optionIndex === correctAnswer) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else if (optionIndex === userAnswer && optionIndex !== correctAnswer) {
      return <XCircle className="h-4 w-4 text-red-600" />
    } else {
      return <div className="h-4 w-4" />
    }
  }

  const correctCount = questions.filter(q => answers[q.id] === q.correct_answer).length
  const totalAnswered = Object.keys(answers).length

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg rounded-2xl rounded-tl-md border border-gray-200/50 relative">
      <div className="absolute -top-1 -left-1 w-4 h-4 bg-white/95 transform rotate-45 border-l border-t border-gray-200/50"></div>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">智能測驗</h3>
            </div>
            {totalAnswered > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 px-3 py-1">
                  答對 {correctCount}/{totalAnswered} 題
                </Badge>
                <span className="text-sm text-gray-600 font-medium">
                  {Math.round((correctCount / totalAnswered) * 100)}%
                </span>
              </div>
            )}
          </div>

          {questions.map((question, qIndex) => (
            <div key={question.id} className="space-y-4 p-5 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {qIndex + 1}
                </div>
                <p className="text-gray-900 font-semibold leading-relaxed">{question.question}</p>
              </div>

              <div className="ml-12 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${getOptionStyle(question.id, optionIndex, question.correct_answer)}`}
                    onClick={() => !showResults[question.id] && handleAnswer(question.id, optionIndex)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getOptionIcon(question.id, optionIndex, question.correct_answer)}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-bold text-sm bg-white/80 rounded-full w-6 h-6 flex items-center justify-center">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="flex-1 font-medium">{option}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showResults[question.id] && (
                <div className="ml-12 mt-4">
                  {answers[question.id] === question.correct_answer ? (
                    <div className="flex items-center gap-3 text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200/50 shadow-sm">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">太棒了！答對了！</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-red-700 bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200/50 shadow-sm">
                      <XCircle className="h-5 w-5" />
                      <div>
                        <span className="font-semibold block">答錯了，再加油！</span>
                        <span className="text-sm">
                          正確答案是 <span className="font-bold">{String.fromCharCode(65 + question.correct_answer)}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {totalAnswered === questions.length && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200/50 shadow-lg">
              <div className="text-center">
                <div className="mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 w-fit mx-auto">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">測驗完成！</h4>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-800">
                    您的成績：{correctCount}/{questions.length} 題
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {Math.round((correctCount / questions.length) * 100)}%
                    </span>
                    {correctCount === questions.length && (
                      <span className="text-lg">🎉</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    {correctCount === questions.length 
                      ? '完美！您對文件內容的理解非常深入！' 
                      : correctCount >= questions.length * 0.8 
                      ? '很棒！您已經掌握了大部分內容！' 
                      : '繼續加油！建議再次閱讀文件內容。'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}