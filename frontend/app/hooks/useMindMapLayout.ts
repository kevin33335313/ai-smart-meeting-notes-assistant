import { useMemo } from 'react';

interface Node {
  id: string;
  data: {
    label: string;
    level: number;
    direction?: 'left' | 'right';
    color?: string;
    icon?: string;
  };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const HORIZONTAL_SPACING = 300;
const CHILD_NODE_VERTICAL_SPACING = 60;
const MAIN_BRANCH_MARGIN = 40;

export function useMindMapLayout(nodes: Node[], edges: Edge[]) {
  return useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { layoutedNodes: [], layoutedEdges: [] };
    }

    const layoutedNodes = [...nodes];
    
    // Helper function to calculate branch descendant count
    const getBranchDescendantCount = (nodeId: string, allNodes: Node[], allEdges: Edge[]): number => {
      const children = allEdges.filter(edge => edge.source === nodeId).map(edge => edge.target);
      if (children.length === 0) return 0;
      
      let count = children.length;
      children.forEach(childId => {
        count += getBranchDescendantCount(childId, allNodes, allEdges);
      });
      
      return count;
    };

    // Count children for each node
    const childrenCount = new Map();
    edges.forEach(edge => {
      const count = childrenCount.get(edge.source) || 0;
      childrenCount.set(edge.source, count + 1);
    });
    
    // Create set of only-child nodes
    const onlyChildNodes = new Set();
    edges.forEach(edge => {
      if (childrenCount.get(edge.source) === 1) {
        onlyChildNodes.add(edge.target);
      }
    });

    let layoutedEdges = edges.map(edge => {
      const targetNode = layoutedNodes.find(node => node.id === edge.target);
      const sourceNode = layoutedNodes.find(node => node.id === edge.source);
      
      let sourceHandle = undefined;
      let targetHandle = undefined;
      let edgeType = 'custom';
      
      // If target is an only child, use straight edge
      if (onlyChildNodes.has(edge.target)) {
        edgeType = 'straight';
      }
      
      // 如果是從根節點連出的邊線
      if (sourceNode?.data.level === 0 && targetNode?.data.level === 1) {
        sourceHandle = targetNode.data.direction === 'left' ? 'left' : 'right';
      }
      
      return {
        ...edge,
        type: edgeType,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        animated: false,
        sourceHandle,
        targetHandle,
        data: edge.data || {}
      };
    });
    
    // Add sibling order information to edges
    const edgesBySource = new Map();
    layoutedEdges.forEach(edge => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source).push(edge);
    });
    
    edgesBySource.forEach(edgeGroup => {
      const totalSiblings = edgeGroup.length;
      edgeGroup.forEach((edge, i) => {
        edge.data = {
          ...edge.data,
          siblingIndex: i,
          totalSiblings: totalSiblings
        };
      });
    });
    
    // 找到根節點並置中
    const rootNode = layoutedNodes.find(node => node.data.level === 0);
    if (rootNode) {
      rootNode.position = { x: 0, y: 0 };
    }

    // 分離左右節點
    const level1Nodes = layoutedNodes.filter(node => node.data.level === 1);
    const rightNodes = level1Nodes.filter(node => node.data.direction === 'right');
    const leftNodes = level1Nodes.filter(node => node.data.direction === 'left');

    // 佈局右側分支
    layoutBranchWithDynamicSpacing(rightNodes, layoutedNodes, edges, 'right', getBranchDescendantCount);
    
    // 佈局左側分支
    layoutBranchWithDynamicSpacing(leftNodes, layoutedNodes, edges, 'left', getBranchDescendantCount);

    return { layoutedNodes, layoutedEdges };
  }, [nodes, edges]);
}

function layoutBranchWithDynamicSpacing(
  branchNodes: Node[], 
  allNodes: Node[], 
  edges: Edge[], 
  direction: 'left' | 'right',
  getBranchDescendantCount: (nodeId: string, allNodes: Node[], allEdges: Edge[]) => number
) {
  const multiplier = direction === 'right' ? 1 : -1;
  
  // 為左右分支使用相同的排列邏輯
  const branchHeights = branchNodes.map(node => {
    const descendantCount = getBranchDescendantCount(node.id, allNodes, edges);
    return Math.max(1, descendantCount) * CHILD_NODE_VERTICAL_SPACING;
  });
  
  const totalHeight = branchHeights.reduce((sum, height, index) => 
    sum + height + (index < branchHeights.length - 1 ? MAIN_BRANCH_MARGIN : 0), 0
  );
  
  let currentY = -totalHeight / 2;
  
  // 對左側分支使用相同的Y座標計算
  branchNodes.forEach((node, index) => {
    const branchHeight = branchHeights[index];
    
    // 確保左右分支的Y座標對稱
    const nodeY = currentY + branchHeight / 2;
    
    node.position = {
      x: HORIZONTAL_SPACING * multiplier,
      y: nodeY
    };
    
    // 使用相同的子節點佈局邏輯
    layoutChildrenInSpace(node, allNodes, edges, direction, currentY, branchHeight, 2);
    
    currentY += branchHeight + MAIN_BRANCH_MARGIN;
  });
}

function layoutChildrenInSpace(
  parentNode: Node, 
  allNodes: Node[], 
  edges: Edge[], 
  direction: 'left' | 'right', 
  spaceStartY: number, 
  spaceHeight: number, 
  level: number
) {
  const children = getChildren(parentNode.id, allNodes, edges);
  const multiplier = direction === 'right' ? 1 : -1;
  
  if (children.length === 0) return;
  
  // 確保子節點在分配空間內均勻分佈
  const childSpacing = spaceHeight / children.length;
  
  children.forEach((child, index) => {
    // 使用相同的水平間距和垂直對齊邏輯
    child.position = {
      x: parentNode.position.x + (HORIZONTAL_SPACING * 0.8 * multiplier),
      y: spaceStartY + (index + 0.5) * childSpacing
    };
    
    // 繼續佈局更深層級
    if (level < 4) {
      const childSpaceStart = spaceStartY + index * childSpacing;
      layoutChildrenInSpace(child, allNodes, edges, direction, childSpaceStart, childSpacing, level + 1);
    }
  });
}

function getChildren(parentId: string, nodes: Node[], edges: Edge[]): Node[] {
  const childIds = edges.filter(edge => edge.source === parentId).map(edge => edge.target);
  return nodes.filter(node => childIds.includes(node.id));
}

