"""
測試海報生成引擎的功能
"""

import asyncio
import sys
import os

# 添加項目根目錄到 Python 路徑
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.poster_prompt_engine import poster_prompt_engine
from app.services.poster_iteration_service import poster_iteration_service

async def test_poster_generation():
    """測試基本海報生成功能"""
    
    print("=== 測試海報提示詞生成引擎 ===\n")
    
    # 測試案例
    test_cases = [
        {
            "theme": "AI 驅動的網絡安全產品發布",
            "style": "corporate_formal",
            "poster_type": "announcement"
        },
        {
            "theme": "新科技產品發布會",
            "style": "modern_tech", 
            "poster_type": "event"
        },
        {
            "theme": "團隊協作效率提升",
            "style": "creative_vibrant",
            "poster_type": "training"
        },
        {
            "theme": "可持續發展綠色科技",
            "style": "vintage_retro",
            "poster_type": "promotion"
        }
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"測試案例 {i}:")
        print(f"主題: {case['theme']}")
        print(f"風格: {case['style']}")
        print(f"類型: {case['poster_type']}")
        
        try:
            # 生成增強提示詞
            enhanced_prompt, token_usage = await poster_prompt_engine.generate_enhanced_prompt(
                theme=case['theme'],
                style=case['style'],
                poster_type=case['poster_type']
            )
            
            print(f"生成的提示詞:")
            print(f"{enhanced_prompt}")
            print(f"Token 使用量: 輸入={token_usage.input_tokens}, 輸出={token_usage.output_tokens}")
            print("-" * 80)
            
        except Exception as e:
            print(f"錯誤: {e}")
            print("-" * 80)

async def test_poster_iteration():
    """測試海報迭代優化功能"""
    
    print("\n=== 測試海報迭代優化功能 ===\n")
    
    # 原始提示詞
    original_prompt = "Minimalist composition with significant negative space. Glowing neural networks coalescing into protective shield shape. Professional announcement design background. Swiss design with clean vectors. Soft studio light. Navy blue and gray palette. Mood of sophistication, trustworthy, professional. 8K resolution, high quality, professional design. --no text, people, words, logos, letters"
    
    session_id = "test_session_001"
    
    # 測試不同的調整類型
    adjustments = [
        "more_dramatic",
        "change_palette", 
        "different_angle",
        "warmer_colors",
        "more_creative"
    ]
    
    print(f"原始提示詞:")
    print(f"{original_prompt}")
    print("-" * 80)
    
    for adjustment in adjustments:
        print(f"應用調整: {adjustment}")
        
        try:
            adjusted_prompt, token_usage = await poster_iteration_service.apply_adjustment(
                original_prompt=original_prompt,
                adjustment_type=adjustment,
                session_id=session_id
            )
            
            print(f"調整後提示詞:")
            print(f"{adjusted_prompt}")
            print(f"Token 使用量: 輸入={token_usage.input_tokens}, 輸出={token_usage.output_tokens}")
            print("-" * 80)
            
            # 更新原始提示詞為下一次迭代
            original_prompt = adjusted_prompt
            
        except Exception as e:
            print(f"錯誤: {e}")
            print("-" * 80)
    
    # 顯示迭代歷史
    history = poster_iteration_service.get_iteration_history(session_id)
    print(f"迭代歷史 (共 {len(history)} 次):")
    for i, prompt in enumerate(history, 1):
        print(f"{i}. {prompt[:100]}...")

async def test_concept_extraction():
    """測試抽象概念提取功能"""
    
    print("\n=== 測試抽象概念提取功能 ===\n")
    
    test_themes = [
        "創新科技解決方案",
        "網絡安全防護系統", 
        "高速數據傳輸技術",
        "團隊協作平台",
        "可持續發展項目",
        "人工智慧應用"
    ]
    
    for theme in test_themes:
        print(f"主題: {theme}")
        
        # 提取抽象概念
        concepts = poster_prompt_engine._extract_abstract_concepts(theme)
        print(f"識別的抽象概念: {concepts}")
        
        if concepts:
            # 獲取視覺隱喻
            for concept in concepts:
                metaphors = poster_prompt_engine.concept_mappings.get(concept, [])
                print(f"  {concept} -> {metaphors[:3]}")  # 只顯示前3個
        
        print("-" * 50)

async def main():
    """主測試函數"""
    
    print("開始測試海報生成引擎...")
    
    # 測試基本生成功能
    await test_poster_generation()
    
    # 測試迭代優化功能
    await test_poster_iteration()
    
    # 測試概念提取功能
    await test_concept_extraction()
    
    print("\n測試完成!")

if __name__ == "__main__":
    # 運行測試
    asyncio.run(main())