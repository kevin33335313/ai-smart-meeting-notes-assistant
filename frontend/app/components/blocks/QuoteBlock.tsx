'use client'

import { Quote } from 'lucide-react'

// 引用區塊組件
interface QuoteBlockProps {
  content: {
    text: string
    author?: string
    style?: 'default' | 'elegant' | 'modern'
  }
}

export default function QuoteBlock({ content }: QuoteBlockProps) {
  const getQuoteStyles = () => {
    switch (content.style) {
      case 'elegant':
        return {
          container: "relative my-6 p-6 bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-slate-400 rounded-r-lg shadow-sm",
          text: "text-slate-700 text-lg italic leading-relaxed",
          author: "text-slate-500 text-sm mt-3 font-medium"
        }
      case 'modern':
        return {
          container: "relative my-6 p-6 bg-white border border-gray-200 rounded-lg shadow-md",
          text: "text-gray-800 text-lg leading-relaxed",
          author: "text-gray-500 text-sm mt-3 font-medium"
        }
      default:
        return {
          container: "relative my-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-md",
          text: "text-blue-800 text-base italic leading-relaxed",
          author: "text-blue-600 text-sm mt-2 font-medium"
        }
    }
  }

  const styles = getQuoteStyles()

  return (
    <blockquote className={styles.container}>
      <div className="flex items-start gap-3">
        <Quote className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className={styles.text}>
            "{content.text}"
          </p>
          {content.author && (
            <cite className={styles.author}>
              — {content.author}
            </cite>
          )}
        </div>
      </div>
    </blockquote>
  )
}