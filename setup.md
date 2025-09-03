# 🚀 專案設置指南

## Git 初始化和 GitHub 設置

### 1. 初始化 Git 倉庫
```bash
# 在專案根目錄執行
git init
git add .
git commit -m "feat: 初始化 AI Smart Meeting Notes Assistant 專案"
```

### 2. 在 GitHub 上創建倉庫
1. 登入 GitHub
2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
3. 倉庫名稱: `ai-smart-meeting-notes-assistant`
4. 描述: `智能會議筆記助手 - 將音頻錄音轉換為結構化筆記`
5. 選擇 Public 或 Private
6. **不要**勾選 "Add a README file"（我們已經有了）
7. 點擊 "Create repository"

### 3. 連接本地倉庫到 GitHub
```bash
# 添加遠程倉庫（替換為你的 GitHub 用戶名）
git remote add origin https://github.com/YOUR_USERNAME/ai-smart-meeting-notes-assistant.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4. 創建開發分支
```bash
# 創建並切換到開發分支
git checkout -b develop
git push -u origin develop

# 在 GitHub 上設置 develop 為默認分支（可選）
```

## 🤝 邀請同事協作

### 方法一：直接邀請協作者
1. 在 GitHub 倉庫頁面，點擊 "Settings"
2. 左側選單選擇 "Collaborators"
3. 點擊 "Add people"
4. 輸入同事的 GitHub 用戶名或郵箱
5. 選擇權限級別（推薦 "Write" 或 "Maintain"）
6. 發送邀請

### 方法二：使用 Fork 和 Pull Request 工作流
1. 同事 Fork 你的倉庫
2. 同事在自己的 Fork 中開發
3. 完成後提交 Pull Request
4. 你審查並合併代碼

## 📋 協作開發工作流程

### 功能開發流程
```bash
# 1. 同步最新代碼
git checkout develop
git pull origin develop

# 2. 創建功能分支
git checkout -b feature/audio-upload-enhancement

# 3. 開發並提交
git add .
git commit -m "feat(audio): 添加拖拽上傳功能"

# 4. 推送分支
git push origin feature/audio-upload-enhancement

# 5. 在 GitHub 上創建 Pull Request
```

### 分支保護規則設置
在 GitHub 倉庫設置中：
1. Settings → Branches
2. 添加規則保護 `main` 和 `develop` 分支
3. 啟用以下選項：
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Restrict pushes that create files larger than 100MB

## 🔧 開發環境同步

### 環境變數管理
```bash
# 後端環境變數
cp backend/.env.example backend/.env
# 編輯 .env 文件，添加必要的 API 密鑰
```

### 依賴安裝腳本
創建快速安裝腳本：

**Windows (install.bat):**
```batch
@echo off
echo 安裝後端依賴...
cd backend
pip install -r requirements.txt
cd ..

echo 安裝前端依賴...
cd frontend
npm install
cd ..

echo 設置完成！
pause
```

**macOS/Linux (install.sh):**
```bash
#!/bin/bash
echo "安裝後端依賴..."
cd backend
pip install -r requirements.txt
cd ..

echo "安裝前端依賴..."
cd frontend
npm install
cd ..

echo "設置完成！"
```

## 📊 專案管理建議

### GitHub Projects 設置
1. 在倉庫中創建 Project
2. 設置看板：
   - Backlog（待辦）
   - In Progress（進行中）
   - Review（審查中）
   - Done（完成）

### Issue 標籤系統
- `bug`: 錯誤修復
- `enhancement`: 功能增強
- `documentation`: 文檔相關
- `good first issue`: 適合新手
- `help wanted`: 需要幫助
- `priority-high`: 高優先級
- `priority-medium`: 中優先級
- `priority-low`: 低優先級

### Milestone 規劃
- v1.0.0: 基礎功能（音頻上傳、轉錄、基本筆記生成）
- v1.1.0: 心智圖功能
- v1.2.0: 用戶界面優化
- v2.0.0: 高級 AI 功能

## 🔄 持續集成設置（可選）

### GitHub Actions 工作流程
創建 `.github/workflows/ci.yml`：

```yaml
name: CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v3
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    - name: Run tests
      run: |
        cd backend
        pytest

  test-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    - name: Run tests
      run: |
        cd frontend
        npm test
```

## 📞 溝通渠道

### 建議的溝通方式
1. **GitHub Issues**: 功能討論、錯誤回報
2. **GitHub Discussions**: 一般討論、想法分享
3. **Pull Request Comments**: 代碼審查討論
4. **Slack/Discord**: 即時溝通（可選）

### 會議安排
- **每週同步會議**: 討論進度和阻礙
- **Sprint 規劃**: 每兩週規劃下一階段工作
- **代碼審查會議**: 重要功能的集體審查

---

完成以上設置後，你的專案就可以支援多人協作開發了！記得定期同步代碼，保持良好的溝通。