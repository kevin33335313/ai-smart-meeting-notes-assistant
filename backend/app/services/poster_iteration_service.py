"""
海報迭代優化服務
實現使用者反饋驅動的提示詞微調功能
"""

from typing import Dict, List, Optional, Tuple
import re
from .poster_prompt_engine import poster_prompt_engine
from ..models.usage_tracking import TokenUsage

class PosterIterationService:
    """海報迭代優化服務 - 支援微調和反饋迴路"""
    
    def __init__(self):
        self.iteration_history: Dict[str, List[str]] = {}
    
    async def apply_adjustment(
        self, 
        original_prompt: str, 
        adjustment_type: str, 
        session_id: str
    ) -> Tuple[str, TokenUsage]:
        """
        應用特定的調整到現有提示詞
        
        Args:
            original_prompt: 原始提示詞
            adjustment_type: 調整類型 ('more_dramatic', 'change_palette', 'different_angle', etc.)
            session_id: 會話 ID，用於追蹤迭代歷史
        """
        
        # 記錄迭代歷史
        if session_id not in self.iteration_history:
            self.iteration_history[session_id] = []
        self.iteration_history[session_id].append(original_prompt)
        
        # 根據調整類型修改提示詞
        adjusted_prompt = await self._apply_specific_adjustment(original_prompt, adjustment_type)
        
        # 計算 token 使用量
        token_usage = TokenUsage(
            input_tokens=len(original_prompt.split()) * 2,
            output_tokens=len(adjusted_prompt.split()) * 2
        )
        
        return adjusted_prompt, token_usage
    
    async def _apply_specific_adjustment(self, prompt: str, adjustment_type: str) -> str:
        """應用特定的調整邏輯"""
        
        adjustment_map = {
            "more_dramatic": self._make_more_dramatic,
            "less_dramatic": self._make_less_dramatic,
            "change_palette": self._change_color_palette,
            "different_angle": self._change_composition_angle,
            "brighter": self._make_brighter,
            "darker": self._make_darker,
            "more_minimal": self._make_more_minimal,
            "more_detailed": self._make_more_detailed,
            "warmer_colors": self._use_warmer_colors,
            "cooler_colors": self._use_cooler_colors,
            "more_professional": self._make_more_professional,
            "more_creative": self._make_more_creative
        }
        
        adjustment_func = adjustment_map.get(adjustment_type, self._default_adjustment)
        return adjustment_func(prompt)
    
    def _make_more_dramatic(self, prompt: str) -> str:
        """增加戲劇性效果"""
        
        # 替換光照關鍵詞
        lighting_replacements = {
            "soft studio light": "dramatic lighting with strong shadows",
            "even illumination": "chiaroscuro lighting",
            "natural daylight": "dramatic accent lighting",
            "professional lighting": "high contrast dramatic lighting"
        }
        
        modified_prompt = prompt
        for old, new in lighting_replacements.items():
            modified_prompt = modified_prompt.replace(old, new)
        
        # 如果沒有找到光照關鍵詞，添加戲劇性元素
        if not any(old in prompt for old in lighting_replacements.keys()):
            modified_prompt = modified_prompt.replace(
                ". 8K resolution", 
                ". Dramatic lighting with deep shadows and strong contrasts. 8K resolution"
            )
        
        return modified_prompt
    
    def _make_less_dramatic(self, prompt: str) -> str:
        """減少戲劇性，使其更柔和"""
        
        dramatic_replacements = {
            "dramatic lighting": "soft studio light",
            "chiaroscuro": "even illumination",
            "high contrast": "balanced lighting",
            "strong shadows": "subtle shadows",
            "dramatic accent lighting": "natural daylight"
        }
        
        modified_prompt = prompt
        for old, new in dramatic_replacements.items():
            modified_prompt = modified_prompt.replace(old, new)
        
        return modified_prompt
    
    def _change_color_palette(self, prompt: str) -> str:
        """更換調色盤"""
        
        # 定義調色盤選項
        palette_options = [
            "vibrant color palette with energetic hues",
            "monochromatic palette with tonal harmony",
            "warm earth tones with natural colors",
            "cool blue and gray professional palette",
            "bold contrasting colors with high impact",
            "pastel color palette with soft tones"
        ]
        
        # 查找現有調色盤並替換
        palette_patterns = [
            r"[a-zA-Z\s]+ color palette[^.]*",
            r"[a-zA-Z\s]+ palette[^.]*",
            r"navy blue and gray[^.]*",
            r"vibrant[^.]*colors[^.]*",
            r"monochromatic[^.]*"
        ]
        
        modified_prompt = prompt
        replaced = False
        
        for pattern in palette_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                import random
                new_palette = random.choice(palette_options)
                modified_prompt = re.sub(pattern, new_palette, prompt, flags=re.IGNORECASE)
                replaced = True
                break
        
        # 如果沒有找到現有調色盤，添加新的
        if not replaced:
            import random
            new_palette = random.choice(palette_options)
            modified_prompt = modified_prompt.replace(
                ". 8K resolution",
                f". {new_palette}. 8K resolution"
            )
        
        return modified_prompt
    
    def _change_composition_angle(self, prompt: str) -> str:
        """改變構圖角度"""
        
        angle_options = [
            "bird's-eye view composition",
            "low-angle perspective",
            "eye-level centered composition",
            "diagonal dynamic composition",
            "asymmetrical balanced layout",
            "symmetrical formal composition"
        ]
        
        # 查找並替換構圖關鍵詞
        composition_patterns = [
            r"[a-zA-Z\s]*composition[^.]*",
            r"[a-zA-Z\s]*perspective[^.]*",
            r"[a-zA-Z\s]*layout[^.]*"
        ]
        
        modified_prompt = prompt
        replaced = False
        
        for pattern in composition_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                import random
                new_angle = random.choice(angle_options)
                modified_prompt = re.sub(pattern, new_angle, prompt, flags=re.IGNORECASE)
                replaced = True
                break
        
        if not replaced:
            import random
            new_angle = random.choice(angle_options)
            # 在提示詞開頭添加構圖描述
            modified_prompt = f"{new_angle}. {prompt}"
        
        return modified_prompt
    
    def _make_brighter(self, prompt: str) -> str:
        """使圖像更明亮"""
        
        brightness_additions = [
            "bright illumination",
            "high-key lighting",
            "luminous atmosphere",
            "radiant lighting"
        ]
        
        import random
        brightness_term = random.choice(brightness_additions)
        
        # 在光照部分添加明亮元素
        modified_prompt = prompt.replace(
            ". 8K resolution",
            f". {brightness_term}. 8K resolution"
        )
        
        return modified_prompt
    
    def _make_darker(self, prompt: str) -> str:
        """使圖像更暗沉"""
        
        darkness_additions = [
            "moody dark atmosphere",
            "low-key lighting",
            "shadowy ambiance",
            "deep contrast lighting"
        ]
        
        import random
        darkness_term = random.choice(darkness_additions)
        
        modified_prompt = prompt.replace(
            ". 8K resolution",
            f". {darkness_term}. 8K resolution"
        )
        
        return modified_prompt
    
    def _make_more_minimal(self, prompt: str) -> str:
        """使設計更簡約"""
        
        minimal_replacements = {
            "detailed": "minimal",
            "complex": "simple",
            "elaborate": "clean",
            "ornate": "streamlined"
        }
        
        modified_prompt = prompt
        for old, new in minimal_replacements.items():
            modified_prompt = modified_prompt.replace(old, new)
        
        # 添加簡約元素
        if "minimal" not in modified_prompt.lower():
            modified_prompt = modified_prompt.replace(
                ". 8K resolution",
                ". Ultra-minimal design with extensive white space. 8K resolution"
            )
        
        return modified_prompt
    
    def _make_more_detailed(self, prompt: str) -> str:
        """增加細節豐富度"""
        
        detail_additions = [
            "intricate details",
            "rich textures",
            "complex layering",
            "elaborate design elements"
        ]
        
        import random
        detail_term = random.choice(detail_additions)
        
        modified_prompt = prompt.replace(
            ". 8K resolution",
            f". {detail_term}. 8K resolution"
        )
        
        return modified_prompt
    
    def _use_warmer_colors(self, prompt: str) -> str:
        """使用更溫暖的色調"""
        
        # 替換為溫暖色調
        warm_palette = "warm color palette with golden and amber tones"
        
        # 查找並替換現有調色盤
        palette_patterns = [
            r"[a-zA-Z\s]+ color palette[^.]*",
            r"[a-zA-Z\s]+ palette[^.]*"
        ]
        
        modified_prompt = prompt
        replaced = False
        
        for pattern in palette_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                modified_prompt = re.sub(pattern, warm_palette, prompt, flags=re.IGNORECASE)
                replaced = True
                break
        
        if not replaced:
            modified_prompt = modified_prompt.replace(
                ". 8K resolution",
                f". {warm_palette}. 8K resolution"
            )
        
        return modified_prompt
    
    def _use_cooler_colors(self, prompt: str) -> str:
        """使用更冷的色調"""
        
        cool_palette = "cool color palette with blue and teal tones"
        
        palette_patterns = [
            r"[a-zA-Z\s]+ color palette[^.]*",
            r"[a-zA-Z\s]+ palette[^.]*"
        ]
        
        modified_prompt = prompt
        replaced = False
        
        for pattern in palette_patterns:
            if re.search(pattern, prompt, re.IGNORECASE):
                modified_prompt = re.sub(pattern, cool_palette, prompt, flags=re.IGNORECASE)
                replaced = True
                break
        
        if not replaced:
            modified_prompt = modified_prompt.replace(
                ". 8K resolution",
                f". {cool_palette}. 8K resolution"
            )
        
        return modified_prompt
    
    def _make_more_professional(self, prompt: str) -> str:
        """使設計更專業"""
        
        professional_elements = [
            "corporate professional aesthetic",
            "business-grade design quality",
            "executive presentation style",
            "formal professional layout"
        ]
        
        import random
        professional_term = random.choice(professional_elements)
        
        modified_prompt = prompt.replace(
            ". 8K resolution",
            f". {professional_term}. 8K resolution"
        )
        
        return modified_prompt
    
    def _make_more_creative(self, prompt: str) -> str:
        """使設計更有創意"""
        
        creative_elements = [
            "artistic creative expression",
            "innovative design approach",
            "bold creative vision",
            "imaginative visual storytelling"
        ]
        
        import random
        creative_term = random.choice(creative_elements)
        
        modified_prompt = prompt.replace(
            ". 8K resolution",
            f". {creative_term}. 8K resolution"
        )
        
        return modified_prompt
    
    def _default_adjustment(self, prompt: str) -> str:
        """預設調整（輕微變化）"""
        
        variations = [
            "enhanced visual impact",
            "refined aesthetic quality",
            "improved design balance",
            "optimized visual hierarchy"
        ]
        
        import random
        variation = random.choice(variations)
        
        return prompt.replace(
            ". 8K resolution",
            f". {variation}. 8K resolution"
        )
    
    def get_iteration_history(self, session_id: str) -> List[str]:
        """獲取迭代歷史"""
        return self.iteration_history.get(session_id, [])
    
    def clear_iteration_history(self, session_id: str) -> None:
        """清除迭代歷史"""
        if session_id in self.iteration_history:
            del self.iteration_history[session_id]

# 全局實例
poster_iteration_service = PosterIterationService()