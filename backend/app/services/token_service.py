import json
from pathlib import Path
from typing import Dict

class TokenService:
    """全局 Token 統計服務"""
    
    def __init__(self):
        self.token_file = Path("./token_stats_global.json")
        self.total_tokens = {"input": 0, "output": 0, "cost": 0.0}
        self.service_stats = {}
        self._load_token_stats()
    
    def _load_token_stats(self):
        """加載 token 統計"""
        try:
            if self.token_file.exists():
                with open(self.token_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.total_tokens = data.get('total', {"input": 0, "output": 0, "cost": 0.0})
                    self.service_stats = data.get('services', {})
        except Exception as e:
            print(f"Failed to load global token stats: {e}")
    
    def _save_token_stats(self):
        """保存 token 統計"""
        try:
            data = {
                'total': self.total_tokens,
                'services': self.service_stats
            }
            with open(self.token_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Failed to save global token stats: {e}")
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """計算 Gemini API 費用"""
        # Gemini 1.5 Pro 價格 (USD per 1M tokens)
        input_price = 1.25 / 1000000  # $1.25 per 1M input tokens
        output_price = 5.00 / 1000000  # $5.00 per 1M output tokens
        return (input_tokens * input_price) + (output_tokens * output_price)
    
    def record_usage(self, service_type: str, input_tokens: int, output_tokens: int, audio_input_tokens: int = 0, image_count: int = 0):
        """記錄服務使用量"""
        cost = self._calculate_cost(input_tokens, output_tokens)
        
        # 更新全局統計
        self.total_tokens["input"] += input_tokens
        self.total_tokens["output"] += output_tokens
        self.total_tokens["cost"] += cost
        
        # 更新服務統計
        if service_type not in self.service_stats:
            self.service_stats[service_type] = {"input": 0, "output": 0, "cost": 0.0, "audio_input": 0, "image_count": 0}
        
        self.service_stats[service_type]["input"] += input_tokens
        self.service_stats[service_type]["output"] += output_tokens
        self.service_stats[service_type]["cost"] += cost
        self.service_stats[service_type]["audio_input"] += audio_input_tokens
        self.service_stats[service_type]["image_count"] += image_count
        
        self._save_token_stats()
        return cost
    
    def update_token_stats(self, input_tokens: int, output_tokens: int):
        """更新 token 統計 (向下相容)"""
        return self.record_usage("legacy", input_tokens, output_tokens)
    
    def get_stats(self, service_type: str = None) -> Dict:
        """獲取統計信息"""
        if service_type and service_type in self.service_stats:
            stats = self.service_stats[service_type]
            return {
                "total_input_tokens": stats["input"],
                "total_output_tokens": stats["output"],
                "total_tokens": stats["input"] + stats["output"],
                "total_cost_usd": stats["cost"],
                "audio_input_tokens": stats.get("audio_input", 0),
                "image_count": stats.get("image_count", 0)
            }
        else:
            return {
                "total_input_tokens": self.total_tokens["input"],
                "total_output_tokens": self.total_tokens["output"],
                "total_tokens": self.total_tokens["input"] + self.total_tokens["output"],
                "total_cost_usd": self.total_tokens["cost"]
            }

# 全局實例
token_service = TokenService()