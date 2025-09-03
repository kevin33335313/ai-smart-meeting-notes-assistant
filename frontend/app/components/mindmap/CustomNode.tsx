import { Handle, Position, NodeProps } from 'reactflow';

// 使用 NodeProps 來獲得 react-flow 傳遞的所有屬性，包含 xPos
interface CustomNodeData {
  label: string;
  level: number;
  color?: string;
  icon?: string;
  direction?: 'left' | 'right';
}

// 我們的 CustomNode 現在接收完整的 NodeProps，其中包含了 data 和 xPos
export function CustomNode({ data, xPos }: NodeProps<CustomNodeData>) {
  // 🔴 關鍵修正！不再使用 data.direction
  // 我們根據節點在畫布上的實際 x 座標來判斷它在哪一邊
  const isLeftSide = xPos < 0; 

  const baseColor = data.color || '#3b82f6';

  // --- Root Node (level 0) ---
  // 根節點的 xPos 約等於 0，為了避免誤判，我們單獨處理
  if (data.level === 0) {
    return (
      <div className="relative">
        <div 
          className="px-4 py-2 rounded-lg text-white font-bold whitespace-nowrap flex items-center gap-2"
          style={{ backgroundColor: baseColor }}
        >
          {data.icon && <span>{data.icon}</span>}
          <span>{data.label}</span>
        </div>
        <Handle type="source" position={Position.Left} id="left" className="opacity-0" />
        <Handle type="source" position={Position.Right} id="right" className="opacity-0" />
      </div>
    );
  }
  
  // --- Level 1 Nodes ---
  if (data.level === 1) {
    return (
      <div className="relative">
        {/* 統一Handle位置：左側節點從右連入，從左連出 */}
        <Handle 
          type="target" 
          position={isLeftSide ? Position.Right : Position.Left} 
          className="opacity-0" 
          style={{ left: isLeftSide ? '100%' : '0%' }}
        />
        <Handle 
          type="source" 
          position={isLeftSide ? Position.Left : Position.Right} 
          className="opacity-0"
          style={{ left: isLeftSide ? '0%' : '100%' }}
        />
        
        <div 
          className={`flex items-center gap-2 text-lg font-semibold whitespace-nowrap ${isLeftSide ? 'flex-row-reverse' : ''}`}
        >
          {data.icon && <span>{data.icon}</span>}
          <span style={{ color: baseColor }}>{data.label}</span>
        </div>
      </div>
    );
  }
  
  // --- Level 2+ Nodes ---
  return (
    <div className="relative">
      {/* 統一Handle位置：確保連線整齊 */}
      <Handle 
        type="target" 
        position={isLeftSide ? Position.Right : Position.Left} 
        className="opacity-0"
        style={{ left: isLeftSide ? '100%' : '0%' }}
      />
      <Handle 
        type="source" 
        position={isLeftSide ? Position.Left : Position.Right} 
        className="opacity-0"
        style={{ left: isLeftSide ? '0%' : '100%' }}
      />

      <div 
        className={`flex items-center gap-1 text-sm whitespace-nowrap ${isLeftSide ? 'flex-row-reverse' : ''}`}
      >
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: baseColor }}></div>
        {data.icon && <span className="text-xs">{data.icon}</span>}
        <span>{data.label}</span>
      </div>
    </div>
  );
}