#!/usr/bin/env python3
"""
測試心智圖完整流程
"""

import asyncio
import sys
import os
from pathlib import Path

# 添加項目根目錄到 Python 路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from backend.app.services.enhanced_mindmap_generator import generate_enhanced_mindmap

async def test_mindmap_flow():
    """測試心智圖完整流程"""
    print("🚀 測試心智圖完整流程...")
    
    # 模擬會議筆記內容
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
        }
    ]
    
    try:
        # 生成心智圖
        print("📊 正在生成心智圖...")
        mindmap = await generate_enhanced_mindmap(test_content_blocks)
        
        print("✅ 心智圖生成成功！")
        print(f"📈 節點數量: {len(mindmap.nodes)}")
        print(f"🔗 連線數量: {len(mindmap.edges)}")
        
        # 檢查數據結構
        print("\n🔍 檢查數據結構:")
        print("=" * 50)
        
        # 檢查根節點
        root_nodes = [node for node in mindmap.nodes if node["data"]["level"] == 0]
        print(f"根節點數量: {len(root_nodes)}")
        
        # 檢查主分支
        level1_nodes = [node for node in mindmap.nodes if node["data"]["level"] == 1]
        print(f"主分支數量: {len(level1_nodes)}")
        
        # 檢查次分支
        level2_nodes = [node for node in mindmap.nodes if node["data"]["level"] == 2]
        print(f"次分支數量: {len(level2_nodes)}")
        
        # 檢查連線
        print(f"連線數量: {len(mindmap.edges)}")
        
        # 驗證數據完整性
        print("\n✅ 數據完整性檢查:")
        print("=" * 50)
        
        # 檢查所有節點都有必要欄位
        for i, node in enumerate(mindmap.nodes):
            required_fields = ["id", "data", "position"]
            missing_fields = [field for field in required_fields if field not in node]
            if missing_fields:
                print(f"❌ 節點 {i} 缺少欄位: {missing_fields}")
            else:
                print(f"✅ 節點 {i} 結構完整")
        
        # 檢查所有連線都有必要欄位
        for i, edge in enumerate(mindmap.edges):
            required_fields = ["id", "source", "target"]
            missing_fields = [field for field in required_fields if field not in edge]
            if missing_fields:
                print(f"❌ 連線 {i} 缺少欄位: {missing_fields}")
            else:
                print(f"✅ 連線 {i} 結構完整")
        
        print("\n🎉 測試完成！心智圖生成流程正常運作。")
        
        # 輸出 JSON 格式供前端測試
        print("\n📋 JSON 輸出 (供前端測試):")
        print("=" * 50)
        import json
        mindmap_dict = mindmap.dict() if hasattr(mindmap, 'dict') else mindmap.model_dump()
        print(json.dumps(mindmap_dict, ensure_ascii=False, indent=2)[:1000] + "...")
        
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
    success = asyncio.run(test_mindmap_flow())
    sys.exit(0 if success else 1)