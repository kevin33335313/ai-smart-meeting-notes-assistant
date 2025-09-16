'use client'

// 螢光筆高亮區塊組件
interface HighlightBlockProps {
  content: {
    text: string
    color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
    style?: 'highlight' | 'underline' | 'box'
  }
}

export default function HighlightBlock({ content }: HighlightBlockProps) {
  const getHighlightStyles = () => {
    const baseStyles = "px-2 py-1 rounded-md font-medium"
    
    switch (content.color) {
      case 'yellow':
        return content.style === 'box' 
          ? `${baseStyles} bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800`
          : `${baseStyles} bg-yellow-200 text-yellow-900 shadow-yellow-200/50 shadow-sm`
      case 'green':
        return content.style === 'box'
          ? `${baseStyles} bg-green-100 border-l-4 border-green-400 text-green-800`
          : `${baseStyles} bg-green-200 text-green-900 shadow-green-200/50 shadow-sm`
      case 'blue':
        return content.style === 'box'
          ? `${baseStyles} bg-blue-100 border-l-4 border-blue-400 text-blue-800`
          : `${baseStyles} bg-blue-200 text-blue-900 shadow-blue-200/50 shadow-sm`
      case 'pink':
        return content.style === 'box'
          ? `${baseStyles} bg-pink-100 border-l-4 border-pink-400 text-pink-800`
          : `${baseStyles} bg-pink-200 text-pink-900 shadow-pink-200/50 shadow-sm`
      case 'purple':
        return content.style === 'box'
          ? `${baseStyles} bg-purple-100 border-l-4 border-purple-400 text-purple-800`
          : `${baseStyles} bg-purple-200 text-purple-900 shadow-purple-200/50 shadow-sm`
      default:
        return `${baseStyles} bg-yellow-200 text-yellow-900`
    }
  }

  return (
    <span className={getHighlightStyles()}>
      {content.text}
    </span>
  )
}