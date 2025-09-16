#!/usr/bin/env python3
"""
測試專業心智圖生成功能
"""

import asyncio
import sys
import os
from pathlib import Path

# 添加項目根目錄到 Python 路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from backend.app.services.enhanced_mindmap_generator import generate_enhanced_mindmap

async def test_professional_mindmap():
    """測試專業心智圖生成"""
    print("🚀 開始測試專業心智圖生成功能...")
    
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
        },
        {
            "type": "heading_2",
            "content": {"text": "資源配置"}
        },
        {
            "type": "bullet_list",
            "content": {
                "items": [
                    "研發團隊：增加5名工程師",
                    "行銷預算：提升40%投入",
                    "合作夥伴：建立3個策略聯盟"
                ]
            }
        }
    ]
    
    try:
        # 生成專業心智圖
        print("📊 正在生成專業心智圖...")
        mindmap = await generate_enhanced_mindmap(test_content_blocks)
        
        print("✅ 專業心智圖生成成功！")
        print(f"📈 節點數量: {len(mindmap.nodes)}")
        print(f"🔗 連線數量: {len(mindmap.edges)}")
        
        # 顯示心智圖結構
        print("\n🎨 心智圖結構預覽:")
        print("=" * 50)
        
        # 顯示根節點
        root_node = next((node for node in mindmap.nodes if node["data"]["level"] == 0), None)
        if root_node:
            print(f"🎯 中央主題: {root_node['data']['label']}")
        
        # 顯示主分支
        level1_nodes = [node for node in mindmap.nodes if node["data"]["level"] == 1]
        if level1_nodes:
            print(f"\n📋 主分支 ({len(level1_nodes)}個):")
            for node in level1_nodes:
                direction = node["data"].get("direction", "center")
                icon = node["data"].get("icon", "📌")
                color = node["data"].get("color", "#3b82f6")
                print(f"  {icon} {node['data']['label']} ({direction}, {color})")
        
        # 顯示次分支
        level2_nodes = [node for node in mindmap.nodes if node["data"]["level"] == 2]
        if level2_nodes:
            print(f"\n🔸 次分支 ({len(level2_nodes)}個):")
            for node in level2_nodes:
                print(f"    • {node['data']['label']}")
        
        print("\n" + "=" * 50)
        print("🎉 測試完成！專業心智圖生成功能正常運作。")
        
        return True
        
    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    # 檢查環境變數
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ 錯誤: 請設置 GEMINI_API_KEY 環境變數")
        sys.exit(1)
    
    # 運行測試
    success = asyncio.run(test_professional_mindmap())
    sys.exit(0 if success else 1)