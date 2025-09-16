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
                "tags": self._extract_tags(result)
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
        
        # 限制標籤數量和長度
        return tags[:3]  # 最多3個標籤
    
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