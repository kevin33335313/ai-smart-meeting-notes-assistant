from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class TokenUsage(BaseModel):
    """Token 使用量追蹤模型"""
    input_tokens: int = 0
    output_tokens: int = 0
    audio_input_tokens: Optional[int] = None  # 音頻輸入 token
    image_count: Optional[int] = None  # 圖片生成數量
    
class CostCalculation(BaseModel):
    """費用計算模型"""
    input_cost: float = 0.0  # 輸入費用 (USD)
    output_cost: float = 0.0  # 輸出費用 (USD)
    audio_cost: float = 0.0  # 音頻處理費用 (USD)
    image_cost: float = 0.0  # 圖片生成費用 (USD)
    total_cost: float = 0.0  # 總費用 (USD)

class UsageReport(BaseModel):
    """使用報告模型"""
    task_id: str
    service_type: str  # "meeting_notes" 或 "icon_generator"
    timestamp: datetime = Field(default_factory=datetime.now)
    token_usage: TokenUsage
    cost_calculation: CostCalculation
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Gemini 2.5 Flash 價格常數 (每百萬 token 的美元價格)
class GeminiPricing:
    # 文字/圖片/影片輸入
    TEXT_INPUT_PRICE = 0.15  # $0.15 per 1M tokens
    # 音頻輸入
    AUDIO_INPUT_PRICE = 0.50  # $0.50 per 1M tokens
    # 輸出 (包含 thinking tokens)
    OUTPUT_PRICE = 1.25  # $1.25 per 1M tokens

# Imagen 4 價格常數 (每張圖片的美元價格)
class ImagenPricing:
    FAST_PRICE = 0.02  # $0.02 per image
    STANDARD_PRICE = 0.04  # $0.04 per image (imagen-4.0-generate-001)
    ULTRA_PRICE = 0.06  # $0.06 per image

def calculate_gemini_cost(token_usage: TokenUsage) -> CostCalculation:
    """計算 Gemini API 使用費用"""
    input_cost = 0.0
    audio_cost = 0.0
    output_cost = 0.0
    
    # 計算文字輸入費用
    if token_usage.input_tokens > 0:
        input_cost = (token_usage.input_tokens / 1_000_000) * GeminiPricing.TEXT_INPUT_PRICE
    
    # 計算音頻輸入費用
    if token_usage.audio_input_tokens:
        audio_cost = (token_usage.audio_input_tokens / 1_000_000) * GeminiPricing.AUDIO_INPUT_PRICE
    
    # 計算輸出費用
    if token_usage.output_tokens > 0:
        output_cost = (token_usage.output_tokens / 1_000_000) * GeminiPricing.OUTPUT_PRICE
    
    total_cost = input_cost + audio_cost + output_cost
    
    return CostCalculation(
        input_cost=round(input_cost, 6),
        output_cost=round(output_cost, 6),
        audio_cost=round(audio_cost, 6),
        image_cost=0.0,
        total_cost=round(total_cost, 6)
    )

def calculate_imagen_cost(image_count: int, image_type: str = "standard") -> CostCalculation:
    """計算 Imagen API 使用費用"""
    price_map = {
        "fast": ImagenPricing.FAST_PRICE,
        "standard": ImagenPricing.STANDARD_PRICE,
        "ultra": ImagenPricing.ULTRA_PRICE
    }
    
    price_per_image = price_map.get(image_type, ImagenPricing.STANDARD_PRICE)
    image_cost = image_count * price_per_image
    
    return CostCalculation(
        input_cost=0.0,
        output_cost=0.0,
        audio_cost=0.0,
        image_cost=round(image_cost, 6),
        total_cost=round(image_cost, 6)
    )