import json
from typing import Dict, Any, Optional
from ..models.usage_tracking import TokenUsage, UsageReport, calculate_gemini_cost, calculate_imagen_cost

class UsageTracker:
    """使用量追蹤服務"""
    
    @staticmethod
    def extract_token_usage_from_response(response: Any, service_type: str = "text") -> TokenUsage:
        """從 Gemini API 回應中提取 token 使用量"""
        try:
            # 檢查回應是否有 usage_metadata
            if hasattr(response, 'usage_metadata'):
                usage = response.usage_metadata
                
                input_tokens = usage.prompt_token_count
                output_tokens = usage.candidates_token_count
                
                # 如果是音頻服務，將輸入 token 標記為音頻 token
                if service_type == "audio":
                    return TokenUsage(
                        input_tokens=0,
                        output_tokens=output_tokens,
                        audio_input_tokens=input_tokens
                    )
                else:
                    return TokenUsage(
                        input_tokens=input_tokens,
                        output_tokens=output_tokens
                    )
            else:
                return TokenUsage()
                
        except Exception as e:
            print(f"Error extracting token usage: {e}")
            return TokenUsage()
    
    @staticmethod
    def create_usage_report(
        task_id: str,
        service_type: str,
        token_usage: TokenUsage,
        image_count: Optional[int] = None,
        image_type: str = "standard"
    ) -> UsageReport:
        """創建使用報告"""
        
        # 計算 Gemini 費用
        cost_calculation = calculate_gemini_cost(token_usage)
        
        # 如果有圖片生成，添加圖片費用
        if image_count and image_count > 0:
            image_cost_calc = calculate_imagen_cost(image_count, image_type)
            cost_calculation.image_cost = image_cost_calc.image_cost
            cost_calculation.total_cost += image_cost_calc.image_cost
            cost_calculation.total_cost = round(cost_calculation.total_cost, 6)
            
            # 更新 token_usage 中的圖片數量
            token_usage.image_count = image_count
        
        return UsageReport(
            task_id=task_id,
            service_type=service_type,
            token_usage=token_usage,
            cost_calculation=cost_calculation
        )
    
    @staticmethod
    def estimate_audio_tokens(file_size_mb: float) -> int:
        """估算音頻檔案的 token 數量（粗略估算）"""
        # 根據經驗，每 MB 音頻大約對應 15000-20000 tokens
        # 這是一個粗略的估算，實際可能會有差異
        return int(file_size_mb * 17500)  # 取中間值