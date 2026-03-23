# DSE Enhancer

> 每天40分钟，精准提高DSE英语成绩

## 项目简介

DSE Enhancer 是一个专为在港大陆学生设计的 AI 自适应学习平台，帮助学生高效备考香港 DSE 英语考试。

## 核心特性

- 🧠 **AI 自适应学习** - 智能分析弱项，每天自动安排针对性练习
- 📚 **完整题库** - 涵盖 DSE 历年真题，AI 辅助生成新题
- ✍️ **AI 评分反馈** - 作文口语即时评分，详细修改建议
- ⏰ **每日 40 分钟** - 碎片化设计，贴合课后学习场景
- 📊 **能力图谱** - 可视化展示听说读写四个维度
- 🏆 **游戏化 PK** - 排行榜激励，好友对战增加学习乐趣

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **样式**: Tailwind CSS
- **状态管理**: Zustand

## 快速开始

### 前置要求

- Node.js 18+
- PostgreSQL 15+

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/swj19821119/dse-enhancer.git
cd dse-enhancer

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，配置数据库连接

# 4. 初始化数据库
npm run db:generate
npm run db:push

# 5. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

## 部署

详细部署指南请参考 [DEPLOY.md](./DEPLOY.md)

### 使用 Docker

```bash
docker-compose up -d
```

## 项目结构

```
dse-enhancer/
├── app/              # Next.js App Router
├── components/       # React 组件
├── lib/             # 工具库
├── store/           # Zustand 状态管理
├── prisma/          # Prisma Schema
└── ...
```

## 开发团队

- **梅** - 产品负责人
- **兰** - 技术负责人

## 许可证

MIT
