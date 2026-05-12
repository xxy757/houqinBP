#!/bin/bash
set -e

echo ">>> 拉取最新代码..."
git pull

echo ">>> 重新构建并启动容器..."
docker-compose up -d --build

echo ">>> 清理无用镜像..."
docker image prune -f

echo ">>> 部署完成！访问 http://$(hostname -I | awk '{print $1}')"
