# 貢獻指南

感謝你對 AI Smart Meeting Notes Assistant 專案的興趣！本指南將幫助你了解如何為專案做出貢獻。

## 🚀 開始之前

1. **Fork 專案**: 點擊 GitHub 頁面右上角的 "Fork" 按鈕
2. **克隆你的 Fork**:
   ```bash
   git clone https://github.com/your-username/ai-smart-meeting-notes-assistant.git
   cd ai-smart-meeting-notes-assistant
   ```
3. **添加上游倉庫**:
   ```bash
   git remote add upstream https://github.com/original-owner/ai-smart-meeting-notes-assistant.git
   ```

## 📋 開發環境設置

請參考 [README.md](./README.md) 中的快速開始部分設置開發環境。

## 🌿 分支策略

### 主要分支
- `main`: 生產就緒的穩定代碼
- `develop`: 開發分支，包含最新的功能

### 功能分支命名規範
- `feature/功能名稱`: 新功能開發
- `bugfix/錯誤描述`: 錯誤修復
- `hotfix/緊急修復`: 生產環境緊急修復
- `docs/文檔更新`: 文檔相關更新

### 分支工作流程
1. 從 `develop` 創建新分支:
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. 進行開發並提交:
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   ```

3. 推送到你的 Fork:
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 提交規範

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

### 提交類型
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更新
- `style`: 代碼格式調整（不影響功能）
- `refactor`: 重構代碼
- `test`: 添加或修改測試
- `chore`: 構建過程或輔助工具的變動
- `perf`: 性能優化

### 提交格式
```
<類型>(<範圍>): <描述>

[可選的正文]

[可選的腳註]
```

### 範例
```bash
feat(audio): 添加 MP4 格式支援
fix(mindmap): 修復節點重疊問題
docs(readme): 更新安裝指南
```

## 🧪 測試要求

### 後端測試
```bash
cd backend
pytest tests/ -v
```

### 前端測試
```bash
cd frontend
npm test
npm run test:coverage
```

### 測試覆蓋率
- 新功能必須包含相應的測試
- 測試覆蓋率應保持在 80% 以上
- 修復錯誤時應添加回歸測試

## 📋 代碼審查清單

提交 Pull Request 前請確認：

### 通用要求
- [ ] 代碼遵循專案的編碼規範
- [ ] 所有測試通過
- [ ] 添加了必要的測試
- [ ] 更新了相關文檔
- [ ] 提交信息遵循規範

### 前端特定要求
- [ ] TypeScript 類型定義正確
- [ ] 組件有適當的 props 驗證
- [ ] 響應式設計在不同螢幕尺寸下正常工作
- [ ] 無 console.log 或調試代碼

### 後端特定要求
- [ ] API 端點有適當的錯誤處理
- [ ] 數據驗證使用 Pydantic 模型
- [ ] 異步操作正確處理
- [ ] 添加了 API 文檔註解

## 🎨 代碼風格

### Python (後端)
- 使用 Black 進行代碼格式化
- 遵循 PEP 8 規範
- 使用類型提示
- 函數和類必須有 docstring

```bash
# 格式化代碼
black backend/
# 檢查代碼風格
flake8 backend/
```

### TypeScript/React (前端)
- 使用 Prettier 進行代碼格式化
- 遵循 ESLint 規則
- 使用函數式組件和 Hooks
- 組件必須有 TypeScript 類型定義

```bash
# 格式化代碼
npm run format
# 檢查代碼風格
npm run lint
```

## 📖 文檔要求

### 代碼註解
- **Python**: 使用繁體中文註解說明函數用途和複雜邏輯
- **TypeScript**: 使用繁體中文註解說明組件功能和複雜邏輯

### API 文檔
- 所有 API 端點必須有 FastAPI 自動生成的文檔
- 使用 Pydantic 模型定義請求和響應格式
- 添加適當的範例和錯誤代碼說明

### README 更新
- 新功能需要更新 README.md
- 添加使用範例和配置說明
- 更新 API 文檔連結

## 🐛 問題回報

### 回報格式
使用提供的 Issue 模板，包含：
- 問題描述
- 重現步驟
- 預期行為
- 實際行為
- 環境信息（OS、瀏覽器、Node.js/Python 版本）
- 螢幕截圖（如適用）

### 標籤使用
- `bug`: 錯誤回報
- `enhancement`: 功能請求
- `documentation`: 文檔相關
- `good first issue`: 適合新貢獻者
- `help wanted`: 需要幫助

## 🔄 Pull Request 流程

1. **創建 PR**: 從你的功能分支向 `develop` 分支提交 PR
2. **填寫模板**: 使用 PR 模板填寫詳細信息
3. **自我檢查**: 確認所有檢查項目都已完成
4. **等待審查**: 維護者會審查你的代碼
5. **處理反饋**: 根據審查意見修改代碼
6. **合併**: 審查通過後，維護者會合併 PR

### PR 標題格式
```
<類型>(<範圍>): <簡短描述>
```

### PR 描述模板
```markdown
## 變更類型
- [ ] 新功能
- [ ] 錯誤修復
- [ ] 文檔更新
- [ ] 重構
- [ ] 其他

## 變更描述
簡要描述這個 PR 的變更內容

## 測試
- [ ] 添加了新的測試
- [ ] 所有現有測試通過
- [ ] 手動測試通過

## 檢查清單
- [ ] 代碼遵循專案規範
- [ ] 自我審查了代碼
- [ ] 添加了必要的註解
- [ ] 更新了相關文檔
```

## 🏷️ 發布流程

1. **版本號**: 遵循 [Semantic Versioning](https://semver.org/)
2. **變更日誌**: 更新 CHANGELOG.md
3. **標籤**: 創建 git 標籤
4. **發布**: 創建 GitHub Release

## 💬 溝通渠道

- **GitHub Issues**: 錯誤回報和功能請求
- **GitHub Discussions**: 一般討論和問題
- **Pull Request**: 代碼審查和討論

## 🙏 致謝

感謝所有貢獻者的努力！你的貢獻讓這個專案變得更好。

---

如有任何問題，請隨時在 GitHub Issues 中提問或聯繫維護者。