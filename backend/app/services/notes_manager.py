import json
import os
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

class NotesManager:
    """筆記管理服務"""
    
    def __init__(self):
        self.notes_dir = Path("./notes_storage")
        self.notes_dir.mkdir(exist_ok=True)
        self.index_file = self.notes_dir / "notes_index.json"
        self.notes_index = self._load_index()
    
    def _load_index(self) -> Dict:
        """載入筆記索引"""
        if self.index_file.exists():
            try:
                with open(self.index_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Failed to load notes index: {e}")
        return {}
    
    def _save_index(self):
        """保存筆記索引"""
        try:
            def json_serializer(obj):
                if hasattr(obj, 'isoformat'):
                    return obj.isoformat()
                return str(obj)
            
            with open(self.index_file, 'w', encoding='utf-8') as f:
                json.dump(self.notes_index, f, ensure_ascii=False, indent=2, default=json_serializer)
        except Exception as e:
            print(f"Failed to save notes index: {e}")
    
    def save_note(self, task_id: str, filename: str, result: Dict) -> bool:
        """保存筆記（包含心智圖）"""
        try:
            print(f"開始保存筆記: task_id={task_id}, filename={filename}")
            
            # 保存筆記內容（處理 datetime 序列化）
            def json_serializer(obj):
                if hasattr(obj, 'isoformat'):
                    return obj.isoformat()
                raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
            
            note_file = self.notes_dir / f"{task_id}.json"
            with open(note_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2, default=json_serializer)
            print(f"筆記文件已保存: {note_file}")
            
            # 更新索引
            note_info = {
                "task_id": task_id,
                "filename": filename,
                "created_at": datetime.now().isoformat(),
                "title": self._extract_title(result),
                "summary": self._extract_summary(result),
                "tags": self._extract_tags(result),
                "color": "emerald",
                "favorite": False,
                "custom_tags": []
            }
            self.notes_index[task_id] = note_info
            print(f"筆記索引已更新: {note_info}")
            
            self._save_index()
            print(f"索引文件已保存，當前索引數量: {len(self.notes_index)}")
            return True
        except Exception as e:
            print(f"Failed to save note {task_id}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def update_note_mindmap(self, task_id: str, mindmap_data: Dict) -> bool:
        """更新筆記的心智圖數據"""
        try:
            note = self.get_note(task_id)
            if note:
                note['mindmap_structure'] = mindmap_data
                note_file = self.notes_dir / f"{task_id}.json"
                
                def json_serializer(obj):
                    if hasattr(obj, 'isoformat'):
                        return obj.isoformat()
                    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
                
                with open(note_file, 'w', encoding='utf-8') as f:
                    json.dump(note, f, ensure_ascii=False, indent=2, default=json_serializer)
                print(f"心智圖已更新: {task_id}")
                return True
            return False
        except Exception as e:
            print(f"Failed to update mindmap for {task_id}: {e}")
            return False
    
    def update_note_markdown_mindmap(self, task_id: str, markdown_mindmap: str) -> bool:
        """更新筆記的markdown心智圖"""
        try:
            note = self.get_note(task_id)
            if note:
                note['markdown_mindmap'] = markdown_mindmap
                note_file = self.notes_dir / f"{task_id}.json"
                
                def json_serializer(obj):
                    if hasattr(obj, 'isoformat'):
                        return obj.isoformat()
                    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")
                
                with open(note_file, 'w', encoding='utf-8') as f:
                    json.dump(note, f, ensure_ascii=False, indent=2, default=json_serializer)
                print(f"Markdown心智圖已更新: {task_id}")
                return True
            return False
        except Exception as e:
            print(f"Failed to update markdown mindmap for {task_id}: {e}")
            return False
    
    def _extract_title(self, result: Dict) -> str:
        """從結果中提取標題"""
        if 'content_blocks' in result and result['content_blocks']:
            for block in result['content_blocks']:
                if block.get('type') == 'heading_2':
                    return block.get('content', {}).get('text', '未命名筆記')
        return result.get('summary', '未命名筆記')[:50] + "..." if len(result.get('summary', '')) > 50 else result.get('summary', '未命名筆記')
    
    def _extract_summary(self, result: Dict) -> str:
        """從結果中提取摘要"""
        # 從 content_blocks 中找第一個 callout 作為摘要
        if 'content_blocks' in result and result['content_blocks']:
            for block in result['content_blocks']:
                if block.get('type') == 'callout' and block.get('content', {}).get('style') == 'success':
                    text = block.get('content', {}).get('text', '')
                    if text:
                        # 移除「【會議核心摘要】」等標題
                        import re
                        text = re.sub(r'^[【】［］\[\]]*[^\u3011\uff3d\]]*[【】［］\[\]]*', '', text)
                        return text[:100] + "..." if len(text) > 100 else text
        
        # 備用：從舊格式的 summary 欄位提取
        if 'summary' in result:
            return result['summary'][:100] + "..." if len(result['summary']) > 100 else result['summary']
        
        return "無摘要"
    
    def _extract_tags(self, result: Dict) -> list:
        """從結果中提取標籤"""
        tags = []
        
        # 從 content_blocks 中提取關鍵詞作為標籤
        if 'content_blocks' in result and result['content_blocks']:
            for block in result['content_blocks']:
                if block.get('type') == 'heading_2':
                    title = block.get('content', {}).get('text', '')
                    if title and len(title) < 20:  # 只取較短的標題作為標籤
                        tags.append(title)
        
        # 智能生成標籤（根據內容關鍵詞）
        content_text = ""
        if 'content_blocks' in result:
            for block in result['content_blocks']:
                if block.get('type') in ['heading_2', 'callout']:
                    text = block.get('content', {}).get('text', '')
                    content_text += text + " "
                elif block.get('type') == 'bullet_list':
                    items = block.get('content', {}).get('items', [])
                    content_text += " ".join(items) + " "
        
        # 關鍵詞映射
        keyword_tags = {
            '會議': '會議',
            '討論': '討論',
            '決定': '決策',
            '任務': '任務',
            '專案': '專案',
            '報告': '報告',
            '分析': '分析',
            '計劃': '計劃',
            '策略': '策略',
            '執行': '執行',
            '開發': '開發',
            '設計': '設計',
            '行銷': '行銷',
            '銷售': '銷售',
            '財務': '財務',
            '人事': '人事',
            '技術': '技術',
            '產品': '產品',
            '客戶': '客戶',
            '市場': '市場',
            '競爭': '競爭',
            '合作': '合作',
            '合約': '合約',
            '談判': '談判',
            '簽約': '簽約',
            '培訓': '培訓',
            '教育': '教育',
            '學習': '學習',
            '成長': '成長',
            '改進': '改進',
            '優化': '優化',
            '效率': '效率',
            '品質': '品質',
            '安全': '安全',
            '風險': '風險',
            '管理': '管理',
            '領導': '領導',
            '團隊': '團隊',
            '溝通': '溝通',
            '協作': '協作',
            '創新': '創新',
            '改革': '改革',
            '變革': '變革',
            '數位': '數位化',
            '自動': '自動化',
            'AI': 'AI',
            '人工智能': 'AI',
            '機器學習': 'AI',
            '大數據': '大數據',
            '雲端': '雲端',
            '網路': '網路',
            '行動': '行動裝置',
            'APP': 'APP',
            '應用': 'APP',
            '網站': '網站',
            '平台': '平台',
            '系統': '系統',
            '軟體': '軟體',
            '硬體': '硬體'
        }
        
        # 在內容中搜尋關鍵詞
        for keyword, tag in keyword_tags.items():
            if keyword in content_text and tag not in tags:
                tags.append(tag)
        
        # 限制標籤數量和長度
        return tags[:5]  # 最多5個標籤
    
    def get_notes_list(self) -> List[Dict]:
        """獲取筆記列表"""
        notes_list = []
        for task_id, note_info in self.notes_index.items():
            # 檢查文件是否存在
            note_file = self.notes_dir / f"{task_id}.json"
            if note_file.exists():
                notes_list.append(note_info)
        
        # 按創建時間排序（最新的在前）
        notes_list.sort(key=lambda x: x['created_at'], reverse=True)
        return notes_list
    
    def get_note(self, task_id: str) -> Optional[Dict]:
        """獲取特定筆記"""
        note_file = self.notes_dir / f"{task_id}.json"
        if note_file.exists():
            try:
                with open(note_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Failed to load note {task_id}: {e}")
        return None
    
    def update_note_title(self, task_id: str, new_title: str) -> bool:
        """更新筆記標題"""
        try:
            if task_id in self.notes_index:
                self.notes_index[task_id]["title"] = new_title
                self._save_index()
                return True
            return False
        except Exception as e:
            print(f"Failed to update note title {task_id}: {e}")
            return False
    
    def update_note_properties(self, task_id: str, properties: Dict) -> bool:
        """更新筆記屬性"""
        try:
            print(f"嘗試更新筆記屬性: task_id={task_id}, properties={properties}")
            print(f"當前索引中的 task_id: {list(self.notes_index.keys())}")
            
            if task_id in self.notes_index:
                print(f"找到筆記: {task_id}")
                allowed_props = ['color', 'favorite', 'custom_tags', 'tags']
                for prop in allowed_props:
                    if prop in properties:
                        print(f"更新屬性: {prop} = {properties[prop]}")
                        self.notes_index[task_id][prop] = properties[prop]
                self._save_index()
                print(f"更新後的筆記: {self.notes_index[task_id]}")
                return True
            else:
                print(f"未找到筆記: {task_id}")
                return False
        except Exception as e:
            print(f"Failed to update note properties {task_id}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def search_notes(self, query: str = "", tags: List[str] = None, color: str = "", favorite: bool = None) -> List[Dict]:
        """搜尋筆記"""
        try:
            results = []
            for task_id, note_info in self.notes_index.items():
                note_file = self.notes_dir / f"{task_id}.json"
                if not note_file.exists():
                    continue
                
                matches = True
                
                if query:
                    search_text = f"{note_info.get('title', '')} {note_info.get('summary', '')} {note_info.get('filename', '')}".lower()
                    if query.lower() not in search_text:
                        matches = False
                
                if tags and matches:
                    note_tags = note_info.get('tags', []) + note_info.get('custom_tags', [])
                    if not any(tag in note_tags for tag in tags):
                        matches = False
                
                if color and matches:
                    if note_info.get('color', 'emerald') != color:
                        matches = False
                
                if favorite is not None and matches:
                    if note_info.get('favorite', False) != favorite:
                        matches = False
                
                if matches:
                    full_note = self.get_note(task_id)
                    result_item = {
                        "task_id": task_id,
                        "filename": note_info["filename"],
                        "status": "completed",
                        "created_at": note_info["created_at"],
                        "color": note_info.get("color", "emerald"),
                        "favorite": note_info.get("favorite", False),
                        "tags": note_info.get("tags", []),
                        "custom_tags": note_info.get("custom_tags", []),
                        "result": full_note
                    }
                    results.append(result_item)
            
            results.sort(key=lambda x: x["created_at"], reverse=True)
            return results
        except Exception as e:
            print(f"Search notes error: {e}")
            return []
    
    def get_all_tags(self) -> List[str]:
        """獲取所有標籤"""
        try:
            all_tags = set()
            for note_info in self.notes_index.values():
                all_tags.update(note_info.get('tags', []))
                all_tags.update(note_info.get('custom_tags', []))
            return sorted(list(all_tags))
        except Exception as e:
            print(f"Get all tags error: {e}")
            return []
    
    def delete_note(self, task_id: str) -> bool:
        """刪除筆記"""
        try:
            note_file = self.notes_dir / f"{task_id}.json"
            if note_file.exists():
                note_file.unlink()
            
            if task_id in self.notes_index:
                del self.notes_index[task_id]
                self._save_index()
            
            return True
        except Exception as e:
            print(f"Failed to delete note {task_id}: {e}")
            return False

# 全域實例
notes_manager = NotesManager()

def get_all_notes():
    """獲取所有筆記列表的全域函數"""
    try:
        # 從 task_store 和 notes_manager 中獲取筆記
        from .gemini_processor import task_store
        
        notes = []
        
        # 從 task_store 中獲取當前任務，但只有在 notes_manager 索引中不存在時才添加
        for task_id, task_data in task_store.items():
            # 只有當筆記不在已保存的筆記中時才從 task_store 添加
            if task_data.get("status") == "completed" and task_id not in [note["task_id"] for note in notes_manager.get_notes_list()]:
                # 檢查是否在 notes_manager 的索引中
                if task_id in notes_manager.notes_index:
                    saved_info = notes_manager.notes_index[task_id]
                    note_item = {
                        "task_id": task_id,
                        "filename": task_data.get("filename", "未知檔案"),
                        "status": task_data.get("status", "unknown"),
                        "created_at": task_data.get("created_at", "2024-01-01T00:00:00"),
                        "color": saved_info.get("color", "emerald"),
                        "favorite": saved_info.get("favorite", False),
                        "tags": saved_info.get("tags", []),
                        "custom_tags": saved_info.get("custom_tags", []),
                        "result": task_data.get("result")
                    }
                else:
                    note_item = {
                        "task_id": task_id,
                        "filename": task_data.get("filename", "未知檔案"),
                        "status": task_data.get("status", "unknown"),
                        "created_at": task_data.get("created_at", "2024-01-01T00:00:00"),
                        "color": "emerald",
                        "favorite": False,
                        "tags": [],
                        "custom_tags": [],
                        "result": task_data.get("result")
                    }
                notes.append(note_item)
        
        # 從已存的筆記中獲取（這些是主要的筆記來源）
        saved_notes = notes_manager.get_notes_list()
        for saved_note in saved_notes:
            # 讀取完整筆記內容
            full_note = notes_manager.get_note(saved_note["task_id"])
            note_item = {
                "task_id": saved_note["task_id"],
                "filename": saved_note["filename"],
                "status": "completed",
                "created_at": saved_note["created_at"],
                "color": saved_note.get("color", "emerald"),
                "favorite": saved_note.get("favorite", False),
                "tags": saved_note.get("tags", []),
                "custom_tags": saved_note.get("custom_tags", []),
                "result": full_note
            }
            notes.append(note_item)
        
        # 按創建時間排序（最新的在前）
        notes.sort(key=lambda x: x["created_at"], reverse=True)
        
        return notes
    except Exception as e:
        print(f"獲取筆記列表錯誤: {e}")
        import traceback
        traceback.print_exc()
        return []