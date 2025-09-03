"use client"

// 簡單心智圖節點介面
interface MindMapNode {
  name: string
  children?: MindMapNode[]
}

interface SimpleMindMapProps {
  data: MindMapNode
}

// 遞歸渲染節點 - 改進版
function renderNode(node: MindMapNode, level = 0, isRoot = false): JSX.Element {
  const colors = [
    'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
    'bg-gradient-to-r from-purple-400 to-purple-500 text-white shadow-md', 
    'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md',
    'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md',
    'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md'
  ]
  
  const sizes = [
    'text-xl px-6 py-3 min-w-[120px]', // 根節點
    'text-lg px-4 py-2 min-w-[100px]', // 第一層
    'text-base px-3 py-2 min-w-[80px]'  // 其他層
  ]
  
  return (
    <div className={`flex flex-col items-center ${level > 0 ? 'mt-8' : ''}`}>
      {/* 節點 */}
      <div className={`
        rounded-xl font-semibold text-center transition-all hover:scale-105 cursor-pointer
        ${colors[level % colors.length]} 
        ${sizes[Math.min(level, sizes.length - 1)]}
        ${isRoot ? 'border-4 border-white' : ''}
      `}>
        {node.name}
      </div>
      
      {/* 子節點區域 */}
      {node.children && node.children.length > 0 && (
        <div className="relative mt-6">
          {/* 垂直連接線 */}
          <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2 -translate-y-6"></div>
          
          {/* 水平分支線 */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-400 transform -translate-y-6"></div>
          )}
          
          {/* 子節點容器 */}
          <div className={`
            flex justify-center items-start gap-8
            ${node.children.length > 3 ? 'flex-wrap max-w-4xl' : ''}
          `}>
            {node.children.map((child, index) => (
              <div key={index} className="relative flex-shrink-0">
                {/* 垂直連接線到子節點 */}
                <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-gray-400 transform -translate-x-1/2 -translate-y-6"></div>
                {renderNode(child, level + 1, false)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 專業心智圖組件
export default function SimpleMindMap({ data }: SimpleMindMapProps) {
  return (
    <div className="h-96 w-full border rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 overflow-auto">
      <div className="flex justify-center min-h-full">
        <div className="transform scale-90 origin-top">
          {renderNode(data, 0, true)}
        </div>
      </div>
    </div>
  )
}