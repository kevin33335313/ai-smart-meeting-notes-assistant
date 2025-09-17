import os
import uuid
from pathlib import Path
from google import genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv
from io import BytesIO
import base64
from ..models.usage_tracking import TokenUsage, UsageReport
from .usage_tracker import UsageTracker

# 載入環境變數
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None

# 建立圖像儲存目錄
IMAGES_DIR = Path("./generated_images")
IMAGES_DIR.mkdir(exist_ok=True)

async def generate_poster_from_prompt_and_image(prompt: str, text_content: str = "", uploaded_image: Image.Image = None, initial_input_tokens: int = 0, initial_output_tokens: int = 0) -> tuple[str, UsageReport]:
    """使用 Gemini 模型生成海報（支援圖片上傳）"""

    if not client:
        placeholder_path = await create_placeholder_image("API Key Not Found")
        # 創建空的使用報告
        empty_usage = UsageTracker.create_usage_report(
            task_id="placeholder",
            service_type="icon_generator",
            token_usage=TokenUsage()
        )
        return placeholder_path, empty_usage

    try:
        # 初始化 token 使用量追蹤（包含翻譯 token）
        total_input_tokens = initial_input_tokens
        total_output_tokens = initial_output_tokens
        
        # 直接使用生成的 prompt
        final_prompt = prompt
            
        print(f"Original poster prompt: {prompt}")

        print(f"Final combined prompt sent to Imagen: {final_prompt}")
        
        # 使用官方 API 調用方式
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        
        if response.generated_images:
            generated_image = response.generated_images[0]
            image_id = str(uuid.uuid4())
            image_path = IMAGES_DIR / f"{image_id}.png"
            
            # 保存圖片
            generated_image.image.save(image_path)
            
            print(f"Saved poster design: {image_path}")
            
            # 創建使用報告
            task_id = str(uuid.uuid4())
            token_usage = TokenUsage(
                input_tokens=total_input_tokens,
                output_tokens=total_output_tokens,
                image_count=1
            )
            usage_report = UsageTracker.create_usage_report(
                task_id=task_id,
                service_type="icon_generator",
                token_usage=token_usage,
                image_count=1,
                image_type="standard"
            )
            
            return str(image_path), usage_report
        else:
            raise Exception("No images generated")


    except Exception as e:
        print(f"Poster generation error: {e}")
        placeholder_path = await create_placeholder_image(f"Error: {e}")
        # 創建錯誤情況下的使用報告
        error_usage = UsageTracker.create_usage_report(
            task_id="error",
            service_type="icon_generator",
            token_usage=TokenUsage(input_tokens=total_input_tokens, output_tokens=total_output_tokens)
        )
        return str(placeholder_path), error_usage

async def create_placeholder_image(error_text: str) -> str:
    """創建佔位符圖像"""
    placeholder_id = str(uuid.uuid4())
    placeholder_path = IMAGES_DIR / f"placeholder_{placeholder_id}.png"
    
    img = Image.new('RGB', (512, 512), color=(240, 240, 240))
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        font = ImageFont.load_default()
    
    # 根據錯誤類型調整文字
    if "Icon" in error_text:
        text = f"圖示生成失敗\n\n{error_text}"
    else:
        text = f"海報生成失敗\n\n{error_text}"
        
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (img.width - text_width) / 2
    y = (img.height - text_height) / 2
    draw.multiline_text((x, y), text, font=font, fill=(100, 100, 100), align='center')
    
    img.save(placeholder_path)
    return str(placeholder_path)

async def add_text_to_poster(image_path: Path, text_content: str) -> str:
    """在生成的設計上添加正確的中文文字"""
    try:
        # 開啟原始圖片
        img = Image.open(image_path)
        draw = ImageDraw.Draw(img)
        
        # 設定字體
        try:
            font = ImageFont.truetype("arial.ttf", 48)
        except:
            font = ImageFont.load_default()
        
        # 計算文字尺寸和位置
        bbox = draw.textbbox((0, 0), text_content, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # 置中位置
        x = (img.width - text_width) // 2
        y = img.height // 3  # 上三分之一位置
        
        # 添加白色背景和黑色文字
        padding = 20
        draw.rectangle(
            [x - padding, y - padding, x + text_width + padding, y + text_height + padding],
            fill=(255, 255, 255, 200)
        )
        draw.text((x, y), text_content, fill=(0, 0, 0), font=font)
        
        # 儲存新圖片
        final_path = image_path.parent / f"final_{image_path.name}"
        img.save(final_path)
        
        return str(final_path)
        
    except Exception as e:
        print(f"Text overlay error: {e}")
        return str(image_path)  # 返回原始圖片

async def analyze_image_with_gemini(image: Image.Image) -> tuple[str, TokenUsage]:
    """使用 Gemini 分析圖片內容"""
    try:
        import google.generativeai as genai
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([
            "Analyze this image's visual design elements only: color palette, composition style, layout structure, visual hierarchy, and design aesthetics. Ignore any text or specific content. Focus on how this design approach could inspire a poster background layout.",
            image
        ])
        
        # 提取 token 使用量
        token_usage = UsageTracker.extract_token_usage_from_response(response, "text")
        
        return response.text.strip(), token_usage
        
    except Exception as e:
        print(f"Image analysis error: {e}")
        return "uploaded image elements", TokenUsage()

async def combine_prompt_with_gemini(poster_prompt: str, image_description: str, text_content: str) -> tuple[str, TokenUsage]:
    """用 Gemini 結合海報需求和圖片分析生成最終 prompt"""
    try:
        import google.generativeai as genai
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        combination_prompt = f"""
You are a Senior Creative Director. Enhance this poster background prompt by incorporating the design style from the reference image.

Base prompt: {poster_prompt}

Reference image design style: {image_description}

TASK: Merge the design aesthetics (colors, composition, layout style) from the reference into the base prompt while maintaining the original theme.

CRITICAL: Keep all "no text, no letters, no words" restrictions. Only adapt visual design elements.

Output the enhanced prompt:
"""
        
        response = model.generate_content(combination_prompt)
        
        # 提取 token 使用量
        token_usage = UsageTracker.extract_token_usage_from_response(response, "text")
        
        return response.text.strip(), token_usage
        
    except Exception as e:
        print(f"Prompt combination error: {e}")
        return f"{poster_prompt}, incorporating elements from: {image_description}", TokenUsage()

async def generate_image_from_prompt(prompt: str) -> str:
    """使用 Gemini Imagen 生成圖示"""
    
    if not client:
        return await create_placeholder_image("API Key Not Found")
    
    try:
        print(f"Generating icon with prompt: {prompt}")
        
        # 使用 Imagen API 生成圖片
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )
        
        if response.generated_images:
            generated_image = response.generated_images[0]
            image_id = str(uuid.uuid4())
            image_path = IMAGES_DIR / f"{image_id}.png"
            
            # 保存圖片
            generated_image.image.save(image_path)
            
            print(f"Saved icon: {image_path}")
            
            # 記錄 token 使用量
            from .token_service import get_token_service
            token_service = get_token_service()
            token_service.record_usage("icon_generator", 0, 0, 0, 1)
            
            return str(image_path)
        else:
            raise Exception("No images generated")
            
    except Exception as e:
        print(f"Icon generation error: {e}")
        return await create_placeholder_image(f"Icon Generation Error: {e}")