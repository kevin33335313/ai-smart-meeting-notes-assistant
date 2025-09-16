"""
AI 海報生成器 - 提示詞優化引擎
基於《提示詞優化海報生成框架》實現的智能提示詞生成系統
"""

import os
import random
from typing import Dict, List, Tuple, Optional
import google.generativeai as genai
from dotenv import load_dotenv
from ..models.usage_tracking import TokenUsage
from .token_service import token_service

# 載入環境變數
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class PosterPromptEngine:
    """海報提示詞生成引擎 - 實現自動化創意指導"""
    
    def __init__(self):
        # 初始化詞彙庫
        self._init_vocabulary_database()
        self._init_style_recipes()
        self._init_abstract_concept_mappings()
    
    def _init_vocabulary_database(self):
        """初始化結構化詞彙庫"""
        
        # 表 2.1: 藝術風格與運動
        self.art_styles = {
            "art_deco": ["Art Deco", "geometric patterns", "metallic accents", "streamlined forms"],
            "bauhaus": ["Bauhaus", "functional design", "primary colors", "geometric typography"],
            "mid_century": ["Mid-century modern", "atomic age", "boomerang shapes", "starburst patterns"],
            "swiss_design": ["Swiss design", "grid system", "sans-serif typography", "asymmetrical layout"]
        }
        
        # 表 2.2: 現代插畫風格
        self.illustration_styles = {
            "flat_design": ["flat design", "solid colors", "simple shapes", "minimal shadows"],
            "isometric": ["isometric illustration", "3D perspective", "technical drawing style"],
            "gradient_mesh": ["gradient mesh", "smooth color transitions", "organic forms"],
            "line_art": ["line art", "continuous lines", "minimal color palette"]
        }
        
        # 表 2.3: 媒介與技術
        self.medium_techniques = {
            "digital": ["digital art", "clean vectors", "crisp edges", "perfect gradients"],
            "print": ["risograph print", "halftone pattern", "screen printing texture"],
            "mixed_media": ["mixed media", "collage elements", "textural contrasts"]
        }
        
        # 表 3.1: 構圖與取景
        self.composition_framing = {
            "minimalist": ["minimalist composition", "significant negative space", "centered subject"],
            "dynamic": ["dynamic composition", "diagonal lines", "asymmetrical balance"],
            "grid_based": ["grid-based layout", "modular design", "systematic arrangement"]
        }
        
        # 表 3.2: 光照與氛圍
        self.lighting_atmosphere = {
            "studio": ["soft studio light", "even illumination", "professional lighting"],
            "dramatic": ["dramatic lighting", "chiaroscuro", "high contrast shadows"],
            "natural": ["natural daylight", "warm afternoon light", "soft window light"],
            "accent": ["accent lighting", "rim light", "selective illumination"]
        }
        
        # 表 3.3: 調色盤系統
        self.color_palettes = {
            "corporate": ["navy blue and gray palette", "professional colors", "trustworthy tones"],
            "vibrant": ["vibrant color palette", "energetic hues", "bold contrasts"],
            "monochromatic": ["monochromatic palette", "single color variations", "tonal harmony"],
            "earth_tones": ["warm earth tones", "natural color palette", "organic hues"]
        }
        
        # 表 3.4: 質感與材質
        self.textures_materials = {
            "smooth": ["smooth surfaces", "polished finish", "clean textures"],
            "organic": ["organic textures", "natural materials", "tactile surfaces"],
            "technical": ["technical textures", "metallic surfaces", "industrial materials"]
        }
    
    def _init_style_recipes(self):
        """初始化風格配方系統"""
        
        self.style_recipes = {
            "corporate_formal": {
                "composition": ["minimalist", "grid_based"],
                "lighting": ["studio", "natural"],
                "color_palette": ["corporate", "monochromatic"],
                "art_style": ["swiss_design", "bauhaus"],
                "medium": ["digital"],
                "mood_keywords": ["sophistication", "trustworthy", "professional", "reliable"]
            },
            
            "modern_tech": {
                "composition": ["dynamic", "minimalist"],
                "lighting": ["accent", "dramatic"],
                "color_palette": ["vibrant", "monochromatic"],
                "art_style": ["flat_design", "isometric"],
                "medium": ["digital"],
                "mood_keywords": ["innovation", "cutting-edge", "futuristic", "sleek"]
            },
            
            "creative_vibrant": {
                "composition": ["dynamic", "minimalist"],
                "lighting": ["natural", "accent"],
                "color_palette": ["vibrant", "earth_tones"],
                "art_style": ["gradient_mesh", "mixed_media"],
                "medium": ["mixed_media", "digital"],
                "mood_keywords": ["energetic", "creative", "inspiring", "bold"]
            },
            
            "vintage_retro": {
                "composition": ["grid_based", "minimalist"],
                "lighting": ["natural", "studio"],
                "color_palette": ["earth_tones", "monochromatic"],
                "art_style": ["art_deco", "mid_century"],
                "medium": ["print", "mixed_media"],
                "mood_keywords": ["nostalgic", "timeless", "classic", "authentic"]
            }
        }
    
    def _init_abstract_concept_mappings(self):
        """初始化抽象概念到視覺隱喻的映射"""
        
        # 場景劇本庫（內容引擎）
        self.scene_templates = {
            "新科技產品發布": [
                "A sleek, minimalist smart device made of obsidian glass and brushed titanium, levitating mysteriously above a dark pedestal, emitting a soft internal cyan glow",
                "A futuristic holographic interface displaying dynamic 3D data visualizations, with glowing charts and nodes floating in mid-air",
                "Close-up of elegant hands interacting with a translucent touchscreen displaying flowing digital particles and network connections"
            ],
            "公司年會報告": [
                "An elegant conference room with a large curved display showing ascending growth charts and achievement metrics in golden light",
                "A sophisticated podium with a crystal award reflecting ambient lighting, surrounded by floating achievement icons",
                "Modern office space with floor-to-ceiling windows, featuring a sleek presentation setup with glowing success indicators"
            ],
            "活動宣傳": [
                "A dynamic stage setup with dramatic spotlighting and floating geometric elements creating an atmosphere of anticipation",
                "An artistic arrangement of event elements - tickets, calendars, and celebration symbols - composed in an elegant spiral",
                "A modern venue entrance with sleek architectural lines and warm welcoming lighting effects"
            ],
            "安全提醒": [
                "A wet road surface with dramatic water reflections and warning triangular signs, illuminated by street lighting",
                "Close-up of a shoe sole gripping textured pavement with water droplets, showing traction patterns in detail",
                "A protective shield made of crystalline light particles, surrounded by secure digital lock symbols and biometric patterns",
                "Hands wearing protective gear interacting with secure digital interfaces displaying safety protocols"
            ],
            "培訓教育": [
                "An open book with pages transforming into floating knowledge symbols and skill icons in warm educational lighting",
                "A modern classroom setup with interactive displays showing learning pathways and progress indicators",
                "Hands reaching toward floating educational elements - gears, lightbulbs, and growth symbols - in inspiring composition"
            ]
        }
        
        self.concept_mappings = {
            "innovation": [
                "glowing neural networks",
                "abstract geometric forms unfolding",
                "interconnected light nodes",
                "crystalline structures emerging",
                "digital DNA helixes"
            ],
            
            "connectivity": [
                "interwoven lines of light",
                "network of glowing nodes",
                "abstract data streams",
                "bridge connecting abstract shapes",
                "orbital connection patterns"
            ],
            
            "security": [
                "shield made of light particles",
                "crystalline protective barrier",
                "digital fortress architecture",
                "biometric pattern overlay",
                "encrypted data visualization"
            ],
            
            "speed": [
                "streaks of light in motion",
                "aerodynamic light trails",
                "particle acceleration effects",
                "time-lapse light patterns",
                "velocity visualization streams"
            ],
            
            "growth": [
                "organic branching patterns",
                "ascending geometric forms",
                "blooming light structures",
                "evolutionary tree diagrams",
                "expanding network topology"
            ],
            
            "collaboration": [
                "intersecting light beams",
                "synchronized geometric dance",
                "harmonious pattern convergence",
                "unified network visualization",
                "collaborative node clusters"
            ]
        }
    
    async def generate_enhanced_prompt(
        self, 
        theme: str, 
        style: str, 
        poster_type: str
    ) -> Tuple[str, TokenUsage]:
        """
        主要方法：生成增強的海報提示詞
        實現從抽象概念到具體視覺的完整轉化流程
        """
        
        try:
            # 第一模組：概念轉化
            main_subject = await self._conceptual_translation(theme)
            
            # 第二模組：風格解構
            style_components = self._style_deconstruction(style)
            print(f"Style components for {style}: {style_components}")
            
            # 第三模組：機率性關鍵詞選擇
            selected_components = self._probabilistic_selection(style_components)
            print(f"Selected components: {selected_components}")
            
            # 第四模組：最終提示詞合成
            final_prompt = self._synthesize_prompt(
                main_subject, 
                selected_components, 
                poster_type
            )
            
            # 計算 token 使用量（概念轉化步驟）
            token_usage = TokenUsage(
                input_tokens=len(theme.split()) * 2,  # 估算
                output_tokens=len(final_prompt.split()) * 2
            )
            
            # 更新全局統計
            token_service.update_token_stats(
                token_usage.input_tokens,
                token_usage.output_tokens
            )
            
            return final_prompt, token_usage
            
        except Exception as e:
            print(f"Enhanced prompt generation error: {e}")
            # 返回基礎提示詞
            fallback_prompt = self._generate_fallback_prompt(theme, style, poster_type)
            return fallback_prompt, TokenUsage()
    
    async def _conceptual_translation(self, theme: str) -> str:
        """第一模組：抽象概念轉化為具體視覺主體（內容引擎）"""
        
        # 優先使用 Gemini 生成具體場景
        scene_template = await self._get_scene_template(theme)
        if scene_template:
            return scene_template
        
        # 如果沒有預設劇本，使用抽象概念轉化
        abstract_keywords = self._extract_abstract_concepts(theme)
        if abstract_keywords:
            return await self._generative_brainstorming(theme, abstract_keywords)
        
        # 最後才使用抽象描述
        return f"professional visualization of {theme}"
    
    async def _get_scene_template(self, theme: str) -> Optional[str]:
        """使用 Gemini 生成具體場景描述"""
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            scene_prompt = f"""
你是一位專業的商業攝影師和視覺設計師。

任務：為以下海報主題設計一個具體、可視化的場景描述。

主題：{theme}

要求：
1. 描述必須具體且可視化（不能是抽象概念）
2. 適合商業海報使用
3. 包含具體的物體、場景或人物動作
4. 描述長度不超過50個英文單詞
5. 不包含文字、標誌或字母

直接輸出英文場景描述：
"""
            
            response = model.generate_content(scene_prompt)
            scene_description = response.text.strip()
            
            print(f"Generated scene for '{theme}': {scene_description}")
            return scene_description
            
        except Exception as e:
            print(f"Scene generation error: {e}")
            return None
    
    def _get_theme_keywords(self, template_key: str) -> List[str]:
        """獲取主題關鍵詞同義詞"""
        
        keywords_map = {
            "新科技產品發布": ["product launch", "new product", "產品發布", "新產品", "launch", "release"],
            "公司年會報告": ["annual report", "company report", "年報", "年會", "annual meeting", "report"],
            "活動宣傳": ["event", "activity", "活動", "宣傳", "promotion", "campaign"],
            "安全提醒": ["security", "safety", "安全", "保護", "protection", "warning", "小心", "濕滑", "路面", "wet", "slippery"],
            "培訓教育": ["training", "education", "培訓", "教育", "learning", "course"]
        }
        
        return keywords_map.get(template_key, [])
    
    def _extract_abstract_concepts(self, theme: str) -> List[str]:
        """提取主題中的抽象概念關鍵詞"""
        
        theme_lower = theme.lower()
        found_concepts = []
        
        # 檢查預定義的抽象概念
        for concept in self.concept_mappings.keys():
            if concept in theme_lower or any(
                keyword in theme_lower 
                for keyword in self._get_concept_synonyms(concept)
            ):
                found_concepts.append(concept)
        
        return found_concepts
    
    def _get_concept_synonyms(self, concept: str) -> List[str]:
        """獲取概念的同義詞"""
        
        synonyms_map = {
            "innovation": ["創新", "新科技", "breakthrough", "advancement"],
            "connectivity": ["連接", "網絡", "connection", "network"],
            "security": ["安全", "保護", "protection", "safety"],
            "speed": ["速度", "快速", "rapid", "fast"],
            "growth": ["成長", "發展", "development", "expansion"],
            "collaboration": ["協作", "合作", "teamwork", "partnership"]
        }
        
        return synonyms_map.get(concept, [])
    
    async def _generative_brainstorming(self, theme: str, concepts: List[str]) -> str:
        """使用 LLM 進行生成式腦力激盪"""
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            brainstorm_prompt = f"""
你是一位資深視覺創意總監。為以下主題進行視覺隱喻腦力激盪：

主題：{theme}
核心概念：{', '.join(concepts)}

任務：創造 5 個具體且視覺上引人注目的隱喻，將抽象概念轉化為可視化的場景或物體。

要求：
1. 每個隱喻都要具體且可視化
2. 結合科技感與專業感
3. 適合企業海報使用
4. 避免陳腔濫調

直接輸出 5 個英文短語，用逗號分隔：
"""
            
            response = model.generate_content(brainstorm_prompt)
            metaphors = [m.strip() for m in response.text.split(',')]
            
            # 隨機選擇一個隱喻
            selected_metaphor = random.choice(metaphors) if metaphors else f"abstract visualization of {theme}"
            
            return selected_metaphor
            
        except Exception as e:
            print(f"Generative brainstorming error: {e}")
            # 使用預設映射
            if concepts:
                concept = concepts[0]
                metaphors = self.concept_mappings.get(concept, [f"abstract {concept} visualization"])
                return random.choice(metaphors)
            
            return f"professional visualization of {theme}"
    
    def _style_deconstruction(self, style: str) -> Dict[str, List[str]]:
        """第二模組：風格解構為具體技術關鍵詞"""
        
        # 獲取風格配方
        recipe = self.style_recipes.get(style, self.style_recipes["modern_tech"])
        print(f"Using recipe for style '{style}': {recipe}")
        
        # 解構為具體關鍵詞組合
        components = {}
        
        for component_type, options in recipe.items():
            if component_type == "mood_keywords":
                components[component_type] = options
            else:
                # 從詞彙庫中獲取具體關鍵詞
                components[component_type] = []
                for option in options:
                    keywords = self._get_vocabulary_keywords(component_type, option)
                    components[component_type].extend(keywords)
        
        return components
    
    def _get_vocabulary_keywords(self, component_type: str, option: str) -> List[str]:
        """從詞彙庫獲取關鍵詞"""
        
        vocabulary_map = {
            "composition": self.composition_framing,
            "lighting": self.lighting_atmosphere,
            "color_palette": self.color_palettes,
            "art_style": self.art_styles,
            "medium": self.medium_techniques
        }
        
        vocabulary = vocabulary_map.get(component_type, {})
        return vocabulary.get(option, [option])
    
    def _probabilistic_selection(self, components: Dict[str, List[str]]) -> Dict[str, str]:
        """第三模組：機率性關鍵詞選擇與變異"""
        
        selected = {}
        
        for component_type, options in components.items():
            if component_type == "mood_keywords":
                # 選擇 2-3 個情緒關鍵詞
                selected[component_type] = random.sample(
                    options, 
                    min(3, len(options))
                )
            else:
                # 機率性選擇單個關鍵詞
                if options:
                    # 可以在這裡實現加權選擇
                    selected[component_type] = random.choice(options)
                else:
                    selected[component_type] = ""
        
        return selected
    
    def _synthesize_prompt(
        self, 
        main_subject: str, 
        components: Dict[str, str], 
        poster_type: str
    ) -> str:
        """第四模組：最終提示詞合成"""
        
        # 按照七層架構組裝提示詞
        prompt_parts = []
        
        # 1. 構圖與取景
        if "composition" in components:
            prompt_parts.append(components["composition"])
        
        # 2. 主要主體與動作
        prompt_parts.append(main_subject)
        
        # 3. 場景與環境細節（已包含在主體中）
        # prompt_parts.append(f"professional {poster_type} design background")
        
        # 4. 藝術風格與媒介
        if "art_style" in components:
            prompt_parts.append(components["art_style"])
        if "medium" in components:
            prompt_parts.append(components["medium"])
        
        # 5. 光照與氛圍
        if "lighting" in components:
            prompt_parts.append(components["lighting"])
        
        # 6. 調色盤與情緒
        if "color_palette" in components:
            prompt_parts.append(components["color_palette"])
        if "mood_keywords" in components:
            mood_desc = f"mood of {', '.join(components['mood_keywords'])}"
            prompt_parts.append(mood_desc)
        
        # 7. 技術規範
        technical_specs = "Commercial photography style, 8K resolution, high quality, professional design"
        prompt_parts.append(technical_specs)
        
        # 重要限制
        restrictions = "--no text, people, words, logos, letters"
        prompt_parts.append(restrictions)
        
        # 組合最終提示詞
        final_prompt = ". ".join(filter(None, prompt_parts))
        
        return final_prompt
    
    def _generate_fallback_prompt(self, theme: str, style: str, poster_type: str) -> str:
        """生成備用提示詞"""
        
        return f"Professional {poster_type} poster design with {style} style, featuring {theme}, clean composition, modern aesthetic, high quality, --no text, people, words, logos"

# 全局實例
poster_prompt_engine = PosterPromptEngine()