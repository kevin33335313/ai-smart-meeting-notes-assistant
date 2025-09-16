"""
海報生成相關的數據模型
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .usage_tracking import UsageReport

class PosterGenerationRequest(BaseModel):
    """海報生成請求模型"""
    text_content: str = Field(..., description="海報文字內容")
    style: str = Field(default="modern_tech", description="設計風格")
    poster_type: str = Field(default="announcement", description="海報類型")
    
class PosterAdjustmentRequest(BaseModel):
    """海報調整請求模型"""
    original_prompt: str = Field(..., description="原始提示詞")
    adjustment_type: str = Field(..., description="調整類型")
    session_id: str = Field(..., description="會話ID")
    text_content: str = Field(..., description="海報文字內容")

class PosterGenerationResponse(BaseModel):
    """海報生成回應模型"""
    success: bool
    image_url: str
    enhanced_prompt: str
    session_id: str
    usage_report: UsageReport
    message: str
    available_adjustments: List[str]

class PosterAdjustmentResponse(BaseModel):
    """海報調整回應模型"""
    success: bool
    image_url: str
    adjusted_prompt: str
    session_id: str
    adjustment_type: str
    usage_report: UsageReport
    message: str

class StyleRecipe(BaseModel):
    """風格配方模型"""
    composition: List[str]
    lighting: List[str]
    color_palette: List[str]
    art_style: List[str]
    medium: List[str]
    mood_keywords: List[str]

class ConceptMapping(BaseModel):
    """概念映射模型"""
    concept: str
    visual_metaphors: List[str]

class PromptComponents(BaseModel):
    """提示詞組件模型"""
    main_subject: str
    composition: str
    lighting: str
    color_palette: str
    art_style: str
    medium: str
    mood_keywords: List[str]
    technical_specs: str

class IterationHistory(BaseModel):
    """迭代歷史模型"""
    session_id: str
    prompts: List[str]
    adjustments: List[str]
    created_at: str