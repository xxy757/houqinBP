#!/bin/bash
set -e

# ============ 配置区 ============
SERVER_USER="root"           # 服务器用户名
SERVER_IP="你的服务器IP"     # 服务器地址
SERVER_DIR="/opt/houqin"     # 服务器项目路径
# ================================

echo ">>> 同步代码到服务器..."
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'frontend/dist' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude 'backend/data/*.db' \
    ./ ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/

echo ">>> 在服务器上构建并部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
cd /opt/houqin
docker-compose up -d --build
docker image prune -f
EOF

echo ">>> 部署完成！"
