import re
from typing import Dict, List, Tuple

class DataAnonymizer:
    """資料去識別化服務"""
    
    def __init__(self):
        # 定義各種敏感資料的正則表達式模式
        self.patterns = {
            # 中文姓名 (2-4個中文字)
            'name': r'[\u4e00-\u9fff]{2,4}(?=先生|小姐|女士|同學|老師|經理|主任|總監|董事|先生說|小姐說|表示|認為|提到)',
            
            # 台灣手機號碼
            'phone': r'09\d{2}[-\s]?\d{3}[-\s]?\d{3}',
            
            # 台灣市話
            'landline': r'0[2-8][-\s]?\d{3,4}[-\s]?\d{4}',
            
            # Email
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            
            # 台灣身分證字號
            'id_card': r'[A-Z][12]\d{8}',
            
            # 地址 (包含縣市區)
            'address': r'[\u4e00-\u9fff]+[縣市][\u4e00-\u9fff]*[區鄉鎮市][\u4e00-\u9fff]*[路街巷弄段號樓][\d\-\u4e00-\u9fff]*',
            
            # 公司名稱 (包含常見公司後綴)
            'company': r'[\u4e00-\u9fff\w\s]+(?:股份有限公司|有限公司|企業|集團|科技|實業|貿易|工業|建設|投資|開發)',
            
            # 銀行帳號 (10-16位數字)
            'bank_account': r'\b\d{10,16}\b',
            
            # 信用卡號 (4組4位數字)
            'credit_card': r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
        }
        
        # 替換標籤
        self.replacements = {
            'name': '[姓名]',
            'phone': '[電話號碼]',
            'landline': '[市話號碼]',
            'email': '[電子郵件]',
            'id_card': '[身分證號]',
            'address': '[地址]',
            'company': '[公司名稱]',
            'bank_account': '[銀行帳號]',
            'credit_card': '[信用卡號]'
        }
        
        # 記錄替換的對應關係，用於還原
        self.replacement_map = {}
        self.counter = {}
    
    def anonymize_text(self, text: str) -> Tuple[str, Dict]:
        """
        對文本進行去識別化處理
        
        Args:
            text: 原始文本
            
        Returns:
            tuple: (去識別化後的文本, 替換記錄)
        """
        anonymized_text = text
        replacements_made = {}
        
        for data_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, anonymized_text)
            
            for match in matches:
                original_value = match.group()
                
                # 為每種類型的資料建立唯一標識
                if data_type not in self.counter:
                    self.counter[data_type] = 0
                
                self.counter[data_type] += 1
                
                # 生成替換標籤
                if self.counter[data_type] == 1:
                    replacement = self.replacements[data_type]
                else:
                    replacement = f"{self.replacements[data_type][:-1]}{self.counter[data_type]}]"
                
                # 記錄替換
                if data_type not in replacements_made:
                    replacements_made[data_type] = []
                
                replacements_made[data_type].append({
                    'original': original_value,
                    'replacement': replacement,
                    'position': match.span()
                })
                
                # 執行替換
                anonymized_text = anonymized_text.replace(original_value, replacement, 1)
        
        return anonymized_text, replacements_made
    
    def get_anonymization_summary(self, replacements: Dict) -> str:
        """
        生成去識別化摘要報告
        
        Args:
            replacements: 替換記錄
            
        Returns:
            str: 摘要報告
        """
        if not replacements:
            return "未發現需要去識別化的敏感資料"
        
        summary_lines = ["已自動去識別化以下敏感資料："]
        
        type_names = {
            'name': '姓名',
            'phone': '手機號碼',
            'landline': '市話號碼',
            'email': '電子郵件',
            'id_card': '身分證號',
            'address': '地址',
            'company': '公司名稱',
            'bank_account': '銀行帳號',
            'credit_card': '信用卡號'
        }
        
        for data_type, items in replacements.items():
            type_name = type_names.get(data_type, data_type)
            count = len(items)
            summary_lines.append(f"• {type_name}: {count} 筆")
        
        return "\n".join(summary_lines)

# 全域實例
anonymizer = DataAnonymizer()