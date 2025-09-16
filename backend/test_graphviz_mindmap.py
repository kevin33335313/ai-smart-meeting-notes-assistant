#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
測試 Graphviz 心智圖生成功能
"""

import os
import sys
import asyncio
from pathlib import Path

# 添加項目根目錄到 Python 路徑
sys.path.append(str(Path(__file__).parent))

from app.services.enhanced_mindmap_generator import generate_enhanced_mindmap

async def test_graphviz_mindmap():
    """測試 Graphviz 心智圖生成"""
    print("開始測試 Graphviz 心智圖生成...")
    
    # 創建測試內容區塊
    test_content_blocks = [
        {
            "type": "callout",
            "content": {
                "icon": "🎯",
                "style": "success",
                "text": "本次會議討論了Q4產品策略規劃，確定了市場擴展方向和資源配置計畫"
            }
        },
        {
            "type": "heading_2",
            "content": {"text": "市場策略分析"}
        },
        {
            "type": "bullet_list",
            "content": {
                "items": [
                    "目標市場：亞太地區中小企業",
                    "競爭優勢：AI技術整合",
                    "預期成長：30%市場佔有率提升"
                ]
            }
        },
        {
            "type": "heading_2",
            "content": {"text": "產品開發計畫"}
        },
        {
            "type": "bullet_list",
            "content": {
                "items": [
                    "新功能：智能分析儀表板",
                    "技術升級：雲端架構優化",
                    "用戶體驗：介面重新設計"
                ]
            }
        },
        {
            "type": "heading_2",
            "content": {"text": "風險評估"}
        },
        {
            "type": "callout",
            "content": {
                "icon": "⚠️",
                "style": "warning",
                "text": "需要注意技術開發時程風險和市場競爭加劇的挑戰"
            }
        }
    ]
    
    try:
        # 生成 PNG 心智圖
        png_path = await generate_enhanced_mindmap(test_content_blocks)
        
        print(f"✅ PNG 心智圖生成成功！")
        print(f"📁 文件路徑: {png_path}")
        
        # 檢查文件是否存在
        if os.path.exists(png_path):
            file_size = os.path.getsize(png_path)
            print(f"📊 文件大小: {file_size} bytes")
            print(f"🎨 心智圖已保存，可以使用圖片查看器打開查看")
        else:
            print("❌ 文件未找到")
            
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()

def test_python_mindmap_data():
    """測試 Python 學習心智圖數據結構"""
    print("\n測試 Python 學習心智圖數據結構...")
    
    mindmap_data = {
        'Python 程式學習心智圖': {
            '基礎知識': {
                '變數與資料型態': ['整數 (int)', '浮點數 (float)', '字串 (string)', '布林值 (boolean)', '列表 (list)', '元組 (tuple)', '集合 (set)', '字典 (dictionary)'],
                '基本操作': ['數學運算', '字串操作', '列表操作'],
                '邏輯運算': {}
            },
            '控制結構': {
                '條件語句': ['if', 'elif', 'else'],
                '迴圈': ['for', 'while', 'break', 'continue']
            },
            '函數與模組': {
                '函數定義': ['def', 'return', '參數與回傳值'],
                '模組與套件': ['import', '使用標準庫', 'pip 安裝第三方套件']
            },
            '檔案操作': {
                '讀取文件': {},
                '寫入文件': {},
                '文件操作模式': ['r, w, a, b']
            },
            '錯誤處理': {
                'try': {},
                'except': {},
                'finally': {},
                'raise': {}
            },
            '進階主題': {
                '類與物件 (OOP)': ['類別定義', '建構子', '繼承', '多型'],
                '裝飾器': {},
                '生成器': {},
                '迭代器': {},
                'Lambda 函數': {},
                'List Comprehensions': {}
            },
            '實用工具': {
                '讀寫 JSON': {},
                '網路爬蟲': ['requests', 'BeautifulSoup'],
                '資料分析': ['pandas', 'numpy'],
                '視覺化': ['matplotlib', 'seaborn']
            }
        }
    }
    
    try:
        from app.services.enhanced_mindmap_generator import _create_graphviz_mindmap
        
        # 生成 Python 學習心智圖
        png_path = _create_graphviz_mindmap(mindmap_data)
        
        print(f"✅ Python 學習心智圖生成成功！")
        print(f"📁 文件路徑: {png_path}")
        
        # 檢查文件是否存在
        if os.path.exists(png_path):
            file_size = os.path.getsize(png_path)
            print(f"📊 文件大小: {file_size} bytes")
            print(f"🎨 Python 學習心智圖已保存")
        else:
            print("❌ 文件未找到")
            
    except Exception as e:
        print(f"❌ Python 學習心智圖測試失敗: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🧠 Graphviz 心智圖生成測試")
    print("=" * 50)
    
    # 檢查 Graphviz 是否安裝
    try:
        import graphviz
        print("✅ Graphviz Python 庫已安裝")
    except ImportError:
        print("❌ Graphviz Python 庫未安裝，請運行: pip install graphviz")
        sys.exit(1)
    
    # 檢查系統 Graphviz 是否安裝
    try:
        dot = graphviz.Digraph()
        dot.node('test', 'Test')
        dot.render('test_graphviz', format='png', cleanup=True)
        os.remove('test_graphviz.png') if os.path.exists('test_graphviz.png') else None
        print("✅ 系統 Graphviz 已正確安裝")
    except Exception as e:
        print(f"❌ 系統 Graphviz 未正確安裝: {e}")
        print("請安裝系統 Graphviz:")
        print("- Windows: 下載並安裝 https://graphviz.org/download/")
        print("- macOS: brew install graphviz")
        print("- Ubuntu: sudo apt-get install graphviz")
        sys.exit(1)
    
    # 運行測試
    asyncio.run(test_graphviz_mindmap())
    test_python_mindmap_data()
    
    print("\n🎉 測試完成！")