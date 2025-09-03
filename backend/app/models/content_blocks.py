from typing import List, Union, Literal
from pydantic import BaseModel, Field

# 內容區塊的基礎模型定義
class Heading2Content(BaseModel):
    """H2 標題內容"""
    text: str = Field(..., description="標題文字")

class BulletListContent(BaseModel):
    """無序列表內容"""
    items: List[str] = Field(..., description="列表項目陣列")

class ToggleListContent(BaseModel):
    """可折疊列表內容"""
    summary: str = Field(..., description="折疊標題")
    details: str = Field(..., description="折疊內容詳情")

class CalloutContent(BaseModel):
    """引言框內容"""
    icon: str = Field(..., description="Emoji 圖示")
    style: Literal['info', 'warning', 'success'] = Field(..., description="樣式類型")
    text: str = Field(..., description="引言內容")

class CodeContent(BaseModel):
    """程式碼區塊內容"""
    language: str = Field(..., description="程式語言")
    text: str = Field(..., description="程式碼內容")

# 內容區塊模型
class ContentBlock(BaseModel):
    """內容區塊基礎模型"""
    type: Literal['heading_2', 'bullet_list', 'toggle_list', 'callout', 'code'] = Field(..., description="區塊類型")
    content: Union[Heading2Content, BulletListContent, ToggleListContent, CalloutContent, CodeContent] = Field(..., description="區塊內容")

# 完整筆記結構
class MeetingNotes(BaseModel):
    """會議筆記完整結構"""
    blocks: List[ContentBlock] = Field(..., description="內容區塊陣列")