# 🚀 部署指南

## 本地開發環境

### 快速啟動
```bash
# 1. 克隆專案
git clone https://github.com/your-username/ai-smart-meeting-notes-assistant.git
cd ai-smart-meeting-notes-assistant

# 2. 安裝依賴
# 後端
cd backend
pip install -r requirements.txt
cp .env.example .env
# 編輯 .env 添加 Gemini API Key

# 前端
cd ../frontend
npm install

# 3. 啟動服務
# 後端 (新終端)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 前端 (新終端)
cd frontend
npm run dev
```

### 環境變數配置
```env
# backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

## 生產環境部署

### Docker 部署 (推薦)

#### 1. 建立 Docker 配置
```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

COPY backend/ .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine

WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./uploads:/app/local_uploads

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend
```

### Vercel + Railway 部署

#### 前端 (Vercel)
1. 連接 GitHub 倉庫到 Vercel
2. 設置環境變數：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
3. 自動部署設置完成

#### 後端 (Railway)
1. 連接 GitHub 倉庫到 Railway
2. 設置環境變數：
   ```
   GEMINI_API_KEY=your_api_key
   PORT=8000
   ```
3. 添加 `railway.toml`：
   ```toml
   [build]
   builder = "NIXPACKS"
   buildCommand = "pip install -r backend/requirements.txt"

   [deploy]
   startCommand = "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
   ```

### AWS 部署

#### 使用 AWS App Runner
1. 建立 `apprunner.yaml`：
   ```yaml
   version: 1.0
   runtime: python3
   build:
     commands:
       build:
         - pip install -r backend/requirements.txt
   run:
     runtime-version: 3.11
     command: uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
     network:
       port: 8000
       env: PORT
   ```

#### 使用 ECS + Fargate
1. 建立 ECR 倉庫
2. 推送 Docker 映像
3. 建立 ECS 任務定義
4. 配置 Application Load Balancer

## 環境配置

### 生產環境變數
```env
# 後端
GEMINI_API_KEY=prod_api_key
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://yourdomain.com

# 前端
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

### 安全配置
- 使用 HTTPS
- 設置 CORS 白名單
- 配置 API 速率限制
- 啟用請求日誌記錄

## 監控和日誌

### 應用監控
```python
# backend/app/middleware/monitoring.py
import time
from fastapi import Request
import logging

logger = logging.getLogger(__name__)

async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    return response
```

### 健康檢查端點
```python
# backend/app/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }
```

## 備份和恢復

### 數據備份
```bash
# 備份上傳文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/local_uploads/

# 備份配置
cp backend/.env config_backup_$(date +%Y%m%d).env
```

### 自動備份腳本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# 建立備份目錄
mkdir -p $BACKUP_DIR

# 備份文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz backend/local_uploads/

# 清理舊備份 (保留7天)
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup completed: uploads_$DATE.tar.gz"
```

## 性能優化

### 前端優化
- 啟用 Next.js 圖片優化
- 使用 CDN 分發靜態資源
- 實施代碼分割和懶加載

### 後端優化
- 使用 Redis 快取
- 實施連接池
- 配置 Gunicorn 多進程

```python
# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
max_requests = 1000
max_requests_jitter = 100
```

## 故障排除

### 常見問題
1. **API 連接失敗**
   - 檢查 CORS 設置
   - 驗證 API URL 配置

2. **Gemini API 錯誤**
   - 確認 API Key 有效
   - 檢查配額限制

3. **文件上傳失敗**
   - 檢查文件大小限制
   - 驗證存儲權限

### 日誌查看
```bash
# Docker 日誌
docker-compose logs -f backend
docker-compose logs -f frontend

# 系統日誌
tail -f /var/log/app.log
```

---

選擇適合你需求的部署方案，並根據實際情況調整配置。