import { SmoothStepEdge, EdgeProps, useReactFlow } from 'reactflow';

export function CustomEdge(props: EdgeProps) {
  const { getNode } = useReactFlow();
  
  // 獲取源節點和目標節點以判斷方向
  const sourceNode = getNode(props.source);
  const targetNode = getNode(props.target);
  const sourceColor = sourceNode?.data?.color || '#94a3b8';
  
  // 根據目標節點的方向調整偏移
  const isLeftDirection = targetNode?.data?.direction === 'left';
  const offset = isLeftDirection ? -20 : 20;
  
  return (
    <SmoothStepEdge
      {...props}
      pathOptions={{
        borderRadius: 20,
        offset: offset
      }}
      style={{
        stroke: sourceColor,
        strokeWidth: 3,
        strokeLinecap: 'round'
      }}
    />
  );
}