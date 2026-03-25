# DSE Enhancer - 部署指南

## 前置要求

- Node.js 18+ 
- PostgreSQL 15+
- Docker（可选，用于容器化部署）

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dse_enhancer?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送数据库 schema
npm run db:push

# 或者使用迁移（推荐）
npm run db:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 生产部署

### 使用 Docker Compose（推荐）

1. 确保 Docker 和 Docker Compose 已安装

2. 配置环境变量（`.env` 文件）

3. 启动服务：

```bash
docker-compose up -d
```

4. 查看日志：

```bash
docker-compose logs -f
```

### 手动部署

1. 构建应用：

```bash
npm run build
```

2. 启动生产服务器：

```bash
npm start
```

3. 使用 Nginx 反向代理（推荐）：

配置文件见 `nginx.conf`

## 数据库管理

### 查看和编辑数据

```bash
npm run db:studio
```

这会打开 Prisma Studio Web 界面。

### 重置数据库（小心使用！）

```bash
# 警告：这会删除所有数据！
npx prisma migrate reset
```

## 常见问题

### 数据库连接失败

检查 PostgreSQL 是否运行，以及 `.env` 中的 `DATABASE_URL` 是否正确。

### 端口被占用

修改 `next.config.js` 或 `docker-compose.yml` 中的端口配置。

### 构建失败

确保 Node.js 版本符合要求（18+），并重新安装依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 自动化部署（GitHub Actions）

### 🎯 部署策略

采用**定时部署 + 智能检查**策略：
- ✅ 每天晚上11点（香港时间）自动检查并部署
- ✅ 只有在代码有更新时才实际部署
- ✅ 支持手动触发紧急部署
- ✅ 自动回滚机制保障稳定性

### ⏰ 定时部署时间

**默认配置**：每天晚上11点（香港时间）

```yaml
# .github/workflows/deploy.yml
on:
  schedule:
    - cron: '0 15 * * *'  # UTC 15:00 = 香港时间 23:00
```

### 🔧 配置步骤

#### 1. 配置GitHub Secrets

在GitHub仓库设置中添加：

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret名称 | 说明 |
|------------|------|
| `SSH_PRIVATE_KEY` | 服务器SSH私钥 |
| `SERVER_IP` | 腾讯云服务器IP |

**生成SSH密钥对**：

```bash
# 在本地生成新的SSH密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github-actions-deploy -C "github-actions"

# 查看私钥内容（复制到GitHub Secrets）
cat ~/.ssh/github-actions-deploy

# 查看公钥内容（添加到服务器）
cat ~/.ssh/github-actions-deploy.pub
```

**在服务器上添加公钥**：

```bash
# 在腾讯云服务器上执行
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 2. 手动触发部署

```
GitHub仓库 → Actions → Deploy to Tencent Cloud → Run workflow
```

#### 3. 部署流程

```
每天晚上11:00
    │
    ▼
检查代码是否有更新
    │
    ├─ 有更新 → 构建 → 测试 → 部署 → 健康检查
    │
    └─ 无更新 → 跳过部署
```

#### 4. 安全机制

- **自动备份**：每次部署前备份当前版本
- **自动回滚**：部署失败时自动回滚到上一个版本
- **健康检查**：部署后自动检查网站是否可访问
- **零停机部署**：使用PM2平滑重启

### 📊 监控

在GitHub Actions页面查看：
- 部署状态（成功/失败）
- 执行时间
- 详细日志

---

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL (MVP: SQLite)
- **样式**: Tailwind CSS
- **UI组件**: 自定义 Shadcn UI 风格
- **状态管理**: Zustand
- **认证**: JWT + bcryptjs
- **部署**: GitHub Actions + PM2

## 项目结构

```
dse-enhancer/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── dashboard/         # 仪表板页面
│   ├── login/            # 登录页面
│   ├── register/         # 注册页面
│   ├── study/            # 学习页面
│   ├── vocabulary/       # 词汇页面
│   ├── questions/        # 题库页面
│   ├── globals.css       # 全局样式
│   ├── layout.tsx        # 根布局
│   └── page.tsx          # 首页
├── components/           # React 组件
│   └── ui/              # UI 基础组件
├── lib/                  # 工具库
│   ├── auth.ts          # 认证逻辑
│   ├── prisma.ts        # Prisma 客户端
│   └── utils.ts         # 工具函数
├── store/                # Zustand 状态管理
│   └── auth.ts          # 认证状态
├── prisma/               # Prisma Schema
│   └── schema.prisma    # 数据库模型
├── docker-compose.yml    # Docker Compose 配置
├── Dockerfile           # Docker 镜像配置
├── nginx.conf           # Nginx 配置
├── tailwind.config.js   # Tailwind 配置
└── package.json         # 项目依赖
```
