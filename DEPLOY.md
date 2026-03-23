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

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **样式**: Tailwind CSS
- **UI组件**: 自定义 Shadcn UI 风格
- **状态管理**: Zustand
- **认证**: JWT + bcryptjs

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
