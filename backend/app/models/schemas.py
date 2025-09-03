from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

# 行動項目模型
class ActionItem(BaseModel):
    task: str
    owner: str
    due_date: str

# 內容區塊模型
class ContentBlock(BaseModel):
    type: str  # heading_2, bullet_list, toggle_list, callout, code
    content: Dict[str, Any]

# 心智圖節點模型 (樹狀格式)
class MindMapNode(BaseModel):
    name: str
    children: Optional[List['MindMapNode']] = None

# React Flow 節點模型
class ReactFlowNode(BaseModel):
    id: str
    data: Dict[str, Any]  # 支援整數和字串
    position: Dict[str, int]

# React Flow 邊線模型
class ReactFlowEdge(BaseModel):
    id: str
    source: str
    target: str

# React Flow 心智圖模型
class ReactFlowMindMap(BaseModel):
    nodes: List[ReactFlowNode]
    edges: List[ReactFlowEdge]

# 筆記結果模型
class NoteResult(BaseModel):
    content_blocks: List[ContentBlock]
    action_items: List[ActionItem] = []  # 待辦事項列表
    mindmap_structure: Optional[Union[MindMapNode, ReactFlowMindMap, Dict[str, Any]]] = None

# 任務狀態回應模型
class TaskStatus(BaseModel):
    task_id: str
    status: str  # queued, processing, completed, failed
    filename: Optional[str] = None
    result: Optional[NoteResult] = None
    error: Optional[str] = None

# 上傳回應模型
class UploadResponse(BaseModel):
    task_id: str
    status: str

# 更新前向引用
MindMapNode.model_rebuild()