# DSE Enhancer

> 每天40分钟，精准提高DSE英语成绩

## 📖 项目文档导航

| 文档 | 说明 | 必读 |
|------|------|------|
| [ROADMAP.md](ROADMAP.md) | **后续开发任务计划** - 新开发者必读 | ⭐⭐⭐ |
| [CONTRIBUTING.md](CONTRIBUTING.md) | **开发规范指南** - 代码标准、Git规范 | ⭐⭐⭐ |
| [CHEATSHEET.md](CHEATSHEET.md) | **开发速查表** - 快速参考 | ⭐⭐ |
| [dse-enhancer-prd-merged.md](dse-enhancer-prd-merged.md) | PRD产品需求文档 | ⭐⭐⭐ |
| [DEPLOY.md](DEPLOY.md) | 部署配置指南 | ⭐⭐ |
| [DEPLOY-CHECKLIST.md](DEPLOY-CHECKLIST.md) | 部署检查清单 | ⭐ |

## 项目简介

DSE Enhancer 是一个专为在港大陆学生设计的 AI 自适应学习平台，帮助学生高效备考香港 DSE 英语考试。

### 🎯 当前状态
- ✅ 基础架构完成（Next.js + Prisma + SQLite）
- ✅ 自动化部署完成（GitHub Actions + PM2）
- ✅ 用户认证系统完成
- ✅ PRD文档完整（含DSE官方难度标准）
- ⏳ **核心学习功能待开发（详见 ROADMAP.md）**

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

## 项目文档

### 📋 PRD 唯一真相源

**⚠️ 重要提示**: 本项目的产品需求文档（PRD）只有一份，作为唯一真相源：

- **`dse-enhancer-prd-merged.md`** - 主PRD文档（v2.3）
  - 包含完整的产品定位、功能设计、技术架构
  - 所有协作者（agents/开发者）必须以此文档为准
  - 任何PRD修改请直接更新此文件

**辅助文档**：
- `PRD_UPDATE_SUMMARY.md` - 版本更新记录
- `MVP_ADJUSTMENT_PLAN.md` - MVP实施计划

**已废弃的旧PRD文件**（已从GitHub删除）：
- ~~`dse-enhancer-prd.md`~~
- ~~`dse-enhancer-prd-v2.1.md`~~
- ~~`dse-enhancer-prd-notion.md`~~

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
