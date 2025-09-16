# Graphviz 心智圖功能安裝指南

## 概述

本專案新增了使用 Graphviz 生成高品質 PNG 心智圖的功能，可以創建專業的、支援繁體中文的心智圖。

## 安裝需求

### 1. Python 依賴

已經添加到 `requirements.txt` 中：

```
graphviz>=0.20.0
```

安裝命令：
```bash
cd backend
pip install -r requirements.txt
```

### 2. 系統 Graphviz 安裝

**重要：** 除了 Python 庫，還需要安裝系統級的 Graphviz 軟體。

#### Windows
1. 下載 Graphviz 安裝包：https://graphviz.org/download/
2. 選擇 Windows 版本下載並安裝
3. 確保安裝路徑添加到系統 PATH 環境變數中
4. 重啟命令提示符或 IDE

#### macOS
```bash
brew install graphviz
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install graphviz
```

#### CentOS/RHEL
```bash
sudo yum install graphviz
# 或者使用 dnf
sudo dnf install graphviz
```

## 功能特點

### 1. 心智圖樣式
- **中央主題**: 深色背景 (#2c3e50)，白色文字，圓角矩形
- **主分支**: 彩色背景，使用柔和的粉彩色調
- **子節點**: 淺灰色背景 (#f5f5f5)，黑色文字
- **連接線**: 曲線樣式，灰色 (#808080)

### 2. 字體支援
- 使用 `Microsoft JhengHei UI` 字體
- 完全支援繁體中文顯示
- 自動調整字體大小

### 3. 輸出格式
- 高解析度 PNG 圖像 (300 DPI)
- 透明背景支援
- 適合用於簡報和文檔

## API 端點

### 生成 PNG 心智圖
```
POST /api/v1/notes/{task_id}/mindmap-png
```

**回應格式：**
```json
{
  "status": "success",
  "png_path": "/uploads/mindmap_1234567890.png",
  "full_path": "d:\\AI Tools\\backend\\local_uploads\\mindmap_1234567890.png",
  "message": "PNG 心智圖生成成功"
}
```

### 測試端點
```
POST /api/v1/test-png-mindmap
```

## 測試安裝

運行測試腳本來驗證安裝：

```bash
cd backend
python test_graphviz_mindmap.py
```

**預期輸出：**
```
🧠 Graphviz 心智圖生成測試
==================================================
✅ Graphviz Python 庫已安裝
✅ 系統 Graphviz 已正確安裝
開始測試 Graphviz 心智圖生成...
✅ PNG 心智圖生成成功！
📁 文件路徑: d:\AI Tools\backend\local_uploads\mindmap_1234567890.png
📊 文件大小: 45678 bytes
🎨 心智圖已保存，可以使用圖片查看器打開查看
```

## 故障排除

### 1. "graphviz executables not found" 錯誤
**原因：** 系統未安裝 Graphviz 或未添加到 PATH

**解決方案：**
- 確保已安裝系統級 Graphviz
- 檢查 PATH 環境變數
- 重啟終端或 IDE

### 2. 中文字體顯示問題
**原因：** 系統缺少指定字體

**解決方案：**
- Windows: 確保有 `Microsoft JhengHei UI` 字體
- 其他系統: 可以修改代碼中的字體設定為系統可用字體

### 3. 權限錯誤
**原因：** 無法寫入輸出目錄

**解決方案：**
- 確保 `backend/local_uploads` 目錄存在且可寫
- 檢查文件權限設定

## 使用範例

### Python 代碼範例

```python
from app.services.enhanced_mindmap_generator import generate_enhanced_mindmap

# 準備內容區塊
content_blocks = [
    {
        "type": "heading_2",
        "content": {"text": "會議主題"}
    },
    {
        "type": "bullet_list",
        "content": {
            "items": ["重點一", "重點二", "重點三"]
        }
    }
]

# 生成 PNG 心智圖
png_path = await generate_enhanced_mindmap(content_blocks)
print(f"心智圖已生成: {png_path}")
```

### 前端調用範例

```javascript
// 生成 PNG 心智圖
const response = await fetch(`/api/v1/notes/${taskId}/mindmap-png`, {
  method: 'POST'
});

const result = await response.json();
if (result.status === 'success') {
  // 顯示生成的心智圖
  const imageUrl = result.png_path;
  document.getElementById('mindmap-image').src = imageUrl;
}
```

## 心智圖數據結構

支援嵌套字典格式，範例：

```python
mindmap_data = {
    '會議主題': {
        '戰略規劃': {
            '市場分析': ['競爭對手研究', '市場趨勢', '客戶需求'],
            '產品策略': ['功能規劃', '定價策略']
        },
        '執行計畫': {
            '團隊組建': ['人員招募', '角色分工'],
            '時程安排': ['里程碑設定', '交付時間']
        }
    }
}
```

## 注意事項

1. **性能考量**: PNG 生成比 ReactFlow 心智圖慢，適合用於最終輸出
2. **文件大小**: 生成的 PNG 文件較大，建議定期清理舊文件
3. **字體相容性**: 不同系統可能需要調整字體設定
4. **記憶體使用**: 大型心智圖可能消耗較多記憶體

## 更新日誌

- **v1.0**: 初始版本，支援基本 PNG 心智圖生成
- **v1.1**: 添加繁體中文支援和自定義樣式
- **v1.2**: 優化性能和錯誤處理