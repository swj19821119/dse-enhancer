# DSE Enhancer - 部署文档

## 前置准备

### 1. 需要的资源

- ✅ GitHub 仓库
- ✅ 腾讯云轻量级服务器（推荐配置：2核4G以上）
- ✅ 域名（可选，用于SSL）
- ✅ Docker Hub 账号（用于存储Docker镜像）

---

## 第一步：配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

### 1. 打开 GitHub Secrets 配置页面

- 访问：https://github.com/swj19821119/dse-enhancer/settings/secrets/actions
- 点击 "New repository secret"

### 2. 添加以下 Secrets

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `DOCKER_HUB_USERNAME` | 你的 Docker Hub 用户名 | |
| `DOCKER_HUB_TOKEN` | 你的 Docker Hub Access Token | 在 Docker Hub 账号设置中生成 |
| `SERVER_HOST` | 你的腾讯云轻量级服务器 IP | 例如：`123.45.67.89` |
| `SERVER_USERNAME` | 服务器用户名 | 通常是 `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | 服务器 SSH 私钥 | 私钥内容，包括 `-----BEGIN RSA PRIVATE KEY-----` 等 |

---

## 第二步：在腾讯云轻量级服务器上准备环境

### 1. 登录到服务器

```bash
ssh root@your-server-ip
```

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 3. 创建项目目录

```bash
mkdir -p /root/dse-enhancer
cd /root/dse-enhancer
```

### 4. 上传配置文件

从你的本地电脑上传以下文件到服务器 `/root/dse-enhancer/` 目录：

- `docker-compose.yml`
- `nginx.conf`
- `.env` (从 `.env.example` 复制并填写你的值)

### 5. 配置 `.env` 文件

```bash
cd /root/dse-enhancer
cp .env.example .env
nano .env  # 或用 vim .env
```

填写以下内容：

```env
DATABASE_URL=postgresql://dse:your_password@postgres:5432/dse_enhancer
POSTGRES_PASSWORD=your_password_here
POSTGRES_USER=dse
POSTGRES_DB=dse_enhancer
REDIS_URL=redis://redis:6379
ARK_API_KEY=your_ark_api_key_here
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 第三步：首次部署

### 1. 在服务器上启动服务

```bash
cd /root/dse-enhancer
docker-compose up -d
```

### 2. 检查服务状态

```bash
docker-compose ps
docker-compose logs -f
```

---

## 第四步：配置 SSL（可选但推荐）

### 1. 安装 Certbot

```bash
sudo apt-get update
sudo apt-get install certbot
```

### 2. 申请 SSL 证书

```bash
certbot certonly --standalone -d your-domain.com
```

### 3. 更新 nginx.conf

修改 `nginx.conf` 中的证书路径：

```nginx
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
```

### 4. 重启 Nginx

```bash
docker-compose restart nginx
```

---

## 自动化部署

完成以上配置后，以后每次 push 代码到 GitHub main 分支，GitHub Actions 会自动：

1. 构建 Docker 镜像
2. 推送到 Docker Hub
3. SSH 登录到你的服务器
4. 拉取最新镜像
5. 重启容器

---

## 常见问题

### 如何查看日志？

```bash
cd /root/dse-enhancer
docker-compose logs -f app
docker-compose logs -f postgres
```

### 如何重启服务？

```bash
cd /root/dse-enhancer
docker-compose restart
```

### 如何更新服务？

```bash
cd /root/dse-enhancer
docker-compose pull
docker-compose up -d
```

---

## 技术支持

如有问题，请查看日志或联系开发者。
