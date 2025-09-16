"""
海報生成器配置文件
包含詞彙庫、風格配方和系統設定
"""

# 支援的調整類型及其中文描述
ADJUSTMENT_TYPES = {
    "more_dramatic": "更戲劇化",
    "less_dramatic": "更柔和",
    "change_palette": "更換調色盤",
    "different_angle": "改變角度",
    "brighter": "更明亮",
    "darker": "更暗沉",
    "more_minimal": "更簡約",
    "more_detailed": "更詳細",
    "warmer_colors": "暖色調",
    "cooler_colors": "冷色調",
    "more_professional": "更專業",
    "more_creative": "更有創意"
}

# 支援的風格及其中文描述
POSTER_STYLES = {
    "corporate_formal": "企業正式風格",
    "modern_tech": "現代科技風格",
    "creative_vibrant": "創意活潑風格",
    "vintage_retro": "復古懷舊風格"
}

# 支援的海報類型及其中文描述
POSTER_TYPES = {
    "announcement": "公告通知",
    "promotion": "促銷宣傳",
    "safety": "安全提醒",
    "training": "培訓教育",
    "event": "活動宣傳",
    "product": "產品發布"
}

# 預設的技術規範
DEFAULT_TECHNICAL_SPECS = "8K resolution, high quality, professional design"

# 必要的限制條件
REQUIRED_RESTRICTIONS = "--no text, people, words, logos, letters"

# 提示詞架構模板
PROMPT_TEMPLATE = "{composition}. {main_subject}. {scene_details}. {art_style}. {medium}. {lighting}. {color_palette}. {mood}. {technical_specs}. {restrictions}"

# 抽象概念的同義詞映射
CONCEPT_SYNONYMS = {
    "innovation": ["創新", "新科技", "breakthrough", "advancement", "cutting-edge", "revolutionary"],
    "connectivity": ["連接", "網絡", "connection", "network", "linking", "integration"],
    "security": ["安全", "保護", "protection", "safety", "defense", "safeguard"],
    "speed": ["速度", "快速", "rapid", "fast", "velocity", "acceleration"],
    "growth": ["成長", "發展", "development", "expansion", "progress", "evolution"],
    "collaboration": ["協作", "合作", "teamwork", "partnership", "cooperation", "synergy"],
    "efficiency": ["效率", "高效", "productivity", "optimization", "streamlined", "effective"],
    "sustainability": ["永續", "可持續", "eco-friendly", "green", "environmental", "renewable"],
    "digital": ["數位", "數字化", "digitalization", "cyber", "virtual", "online"],
    "artificial_intelligence": ["人工智慧", "AI", "machine learning", "smart", "intelligent", "automated"]
}

# 機率權重配置
PROBABILITY_WEIGHTS = {
    "corporate_formal": {
        "lighting": {
            "soft studio light": 0.7,
            "natural daylight": 0.2,
            "clean professional lighting": 0.1
        },
        "color_palette": {
            "navy blue and gray palette": 0.6,
            "monochromatic professional colors": 0.3,
            "conservative business colors": 0.1
        }
    },
    "modern_tech": {
        "lighting": {
            "dramatic accent lighting": 0.5,
            "futuristic glow effects": 0.3,
            "high-tech illumination": 0.2
        },
        "color_palette": {
            "vibrant tech colors": 0.4,
            "neon accent palette": 0.3,
            "sleek monochromatic": 0.3
        }
    }
}

# 品質控制設定
QUALITY_SETTINGS = {
    "min_prompt_length": 50,
    "max_prompt_length": 500,
    "required_keywords": ["professional", "design", "high quality"],
    "forbidden_keywords": ["amateur", "low quality", "blurry"]
}