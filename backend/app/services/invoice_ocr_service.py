import os
import google.generativeai as genai
from PIL import Image
import json
import re
from typing import Dict, Any
from datetime import datetime
try:
    from ..services.token_service import token_service
except ImportError:
    # 如果無法導入 token_service，創建一個虛擬的
    class MockTokenService:
        def record_usage(self, *args, **kwargs):
            pass
    token_service = MockTokenService()

class InvoiceOCRService:
    """發票 OCR 服務類別"""
    
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
    async def extract_invoice_info(self, image_path: str) -> Dict[str, Any]:
        """從發票圖片中提取結構化資訊"""
        try:
            prompt = """
            請分析這張發票圖片，提取以下資訊並以 JSON 格式回傳：
            {
                "invoice_number": "發票號碼",
                "invoice_date": "發票日期 (YYYY-MM-DD 格式)",
                "vendor_name": "商家名稱",
                "vendor_tax_id": "商家統一編號",
                "total_amount": 總金額數字,
                "tax_amount": 稅額數字,
                "net_amount": 未稅金額數字,
                "category": "費用類別 (交通、餐飲、辦公用品、住宿、其他)",
                "items": [
                    {
                        "description": "商品描述",
                        "quantity": 數量,
                        "unit_price": 單價,
                        "amount": 小計
                    }
                ]
            }
            
            注意事項：
            1. 如果某個欄位無法識別，請設為 null
            2. 金額請轉換為數字格式
            3. 日期請使用 YYYY-MM-DD 格式
            4. 費用類別請根據商家類型和商品內容判斷
            5. 只回傳 JSON，不要其他文字
            """
            
            image_file = genai.upload_file(image_path)
            response = self.model.generate_content([prompt, image_file])
            
            # 記錄 token 使用量
            try:
                if hasattr(response, 'usage_metadata') and response.usage_metadata:
                    input_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0)
                    output_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0)
                    
                    token_service.record_usage(
                        service_type="invoice_ocr",
                        input_tokens=input_tokens,
                        output_tokens=output_tokens,
                        audio_input_tokens=0,
                        image_count=1
                    )
            except Exception as token_error:
                print(f"Token recording error: {token_error}")
                pass
            
            result_text = response.text.strip()
            
            # 清理回應文字
            if result_text.startswith('```json'):
                result_text = result_text[7:]
            if result_text.endswith('```'):
                result_text = result_text[:-3]
            
            invoice_data = json.loads(result_text)
            invoice_data = self._validate_and_clean_data(invoice_data)
            
            return {
                "success": True,
                "data": invoice_data,
                "raw_text": result_text
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    def _validate_and_clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """驗證和清理提取的資料"""
        required_fields = [
            "invoice_number", "invoice_date", "vendor_name", 
            "total_amount", "category"
        ]
        
        for field in required_fields:
            if field not in data:
                data[field] = None
        
        # 清理金額
        for amount_field in ["total_amount", "tax_amount", "net_amount"]:
            if data.get(amount_field):
                try:
                    amount_str = str(data[amount_field])
                    amount_str = re.sub(r'[^\d.]', '', amount_str)
                    data[amount_field] = float(amount_str) if amount_str else 0.0
                except:
                    data[amount_field] = 0.0
        
        # 驗證日期格式
        if data.get("invoice_date"):
            try:
                if isinstance(data["invoice_date"], str):
                    date_str = data["invoice_date"]
                    date_str = re.sub(r'[年月日]', '-', date_str)
                    date_str = re.sub(r'[^\d-]', '', date_str)
                    
                    if len(date_str) >= 8:
                        datetime.strptime(date_str[:10], '%Y-%m-%d')
                        data["invoice_date"] = date_str[:10]
            except:
                data["invoice_date"] = None
        
        if not data.get("category"):
            data["category"] = "其他"
        
        return data