'use client'

// 分隔線區塊組件
interface DividerBlockProps {
  content: {
    style?: 'line' | 'dots' | 'gradient' | 'decorative'
    spacing?: 'small' | 'medium' | 'large'
  }
}

export default function DividerBlock({ content }: DividerBlockProps) {
  const getSpacing = () => {
    switch (content.spacing) {
      case 'small': return 'my-4'
      case 'large': return 'my-12'
      default: return 'my-8'
    }
  }

  const renderDivider = () => {
    switch (content.style) {
      case 'dots':
        return (
          <div className="flex justify-center items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
        )
      case 'gradient':
        return (
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        )
      case 'decorative':
        return (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-8 h-px bg-gray-300"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )
      default:
        return <hr className="border-gray-200" />
    }
  }

  return (
    <div className={getSpacing()}>
      {renderDivider()}
    </div>
  )
}