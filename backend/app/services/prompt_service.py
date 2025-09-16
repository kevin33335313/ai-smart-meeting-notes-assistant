import os
import google.generativeai as genai
from dotenv import load_dotenv
from ..models.usage_tracking import TokenUsage
from .token_service import token_service
from .poster_prompt_engine import poster_prompt_engine
from .poster_iteration_service import poster_iteration_service

# 載入環境變數並設定 Gemini API
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

async def enhance_prompt_for_poster(text_content: str, style: str, poster_type: str, has_image: bool = False) -> tuple[str, 'TokenUsage']:
    """使用智能提示詞引擎生成優化的海報提示詞"""
    
    try:
        # 風格名稱映射
        style_mapping = {
            "modern": "modern_tech",
            "corporate": "corporate_formal", 
            "creative": "creative_vibrant",
            "minimal": "corporate_formal"
        }
        
        mapped_style = style_mapping.get(style, style)
        print(f"Original style: {style}, Mapped style: {mapped_style}")
        
        # 使用新的智能提示詞引擎
        enhanced_prompt, token_usage = await poster_prompt_engine.generate_enhanced_prompt(
            theme=text_content,
            style=mapped_style,
            poster_type=poster_type
        )
        
        return enhanced_prompt, token_usage
        
    except Exception as e:
        print(f"Enhanced prompt generation error: {e}")
        # 使用備用的簡化版本
        return await _generate_fallback_prompt(text_content, style, poster_type)

async def apply_poster_adjustment(
    original_prompt: str, 
    adjustment_type: str, 
    session_id: str
) -> tuple[str, TokenUsage]:
    """應用海報調整（迭代優化功能）"""
    
    try:
        adjusted_prompt, token_usage = await poster_iteration_service.apply_adjustment(
            original_prompt=original_prompt,
            adjustment_type=adjustment_type,
            session_id=session_id
        )
        
        return adjusted_prompt, token_usage
        
    except Exception as e:
        print(f"Poster adjustment error: {e}")
        return original_prompt, TokenUsage()

async def _generate_fallback_prompt(text_content: str, style: str, poster_type: str) -> tuple[str, TokenUsage]:
    """生成備用提示詞（原有邏輯）"""
    
    # 專業設計風格定義
    style_prompts = {
        'modern': 'clean modern minimalist design, geometric shapes, blue and white color scheme, sans-serif typography feel, balanced composition, professional layout, contemporary business aesthetic',
        'corporate': 'formal business design, navy blue and gray palette, structured grid layout, conservative professional style, corporate identity elements, trustworthy appearance',
        'creative': 'vibrant creative design, bold dynamic colors, energetic composition, artistic graphic elements, contemporary visual flow, engaging modern style',
        'minimal': 'ultra-minimal design, extensive white space, single focal point, monochromatic palette, clean simple typography feel, zen-like composition'
    }
    
    # 海報類型視覺元素
    type_elements = {
        'announcement': 'announcement themed icons, megaphone symbols, attention-grabbing visual elements, clear information hierarchy',
        'promotion': 'promotional graphics, celebration elements, dynamic shapes, engaging marketing visuals, festive atmosphere',
        'safety': 'safety themed icons, warning symbols, protective elements, clear signage style, security graphics',
        'training': 'educational icons, learning symbols, growth elements, knowledge graphics, development themes'
    }
    
    # 使用 Gemini 智能生成 Imagen prompt
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # 風格描述
        style_desc = {
            'modern': '現代簡約風格，幾何形狀，藍白色系',
            'corporate': '企業正式風格，深藍灰色系，穩重專業',
            'creative': '創意活潑風格，鮮豔色彩，動態構圖',
            'minimal': '極簡風格，大量留白，單色系'
        }.get(style, '現代簡約風格')
        
        prompt_generation = model.generate_content(f"""
你是一位專業的視覺背景設計師與構圖藝術家。

你的任務是根據以下指令，為 Imagen 創造一張高品質、有視覺焦點的「背景圖像」：

主題：{text_content}
風格：{style_desc}
類型：{poster_type}

**核心規則：**
1. **絕對禁止生成任何文字：** 不能包含任何語言的字母、數字、符號或可辨識的文字圖形
2. **為文字預留空間：** 構圖必須包含留白或視覺上較為簡潔的區域
3. **具體視覺元素：** 包含相關的圖示、符號、色彩來傳達主題氛圍
4. **專業構圖：** 適合企業使用的高品質設計

直接輸出英文 prompt（必須以 "no text, no letters, no words" 結尾）：
""")
        
        generated_prompt = prompt_generation.text.strip()
        
        # 提取 token 使用量
        from .usage_tracker import UsageTracker
        prompt_usage = UsageTracker.extract_token_usage_from_response(prompt_generation, "text")
        
        # 更新全局 token 統計
        token_service.update_token_stats(
            prompt_usage.text_input_tokens,
            prompt_usage.text_output_tokens
        )
        
        return generated_prompt, prompt_usage
        
    except Exception as e:
        print(f"Fallback prompt generation error: {e}")
        # 最終備用 prompt
        fallback_prompt = f"Professional poster background design with visual elements and clean composition, {style_prompts.get(style, style_prompts['modern'])}, space for text overlay, no text, no letters, no words"
        return fallback_prompt, TokenUsage()