# DSE Enhancer - 开发规范指南

> 本规范旨在确保所有开发者/AI助手遵循一致的开发标准和最佳实践
> 版本: v1.0 | 最后更新: 2026-03-25

---

## 📋 快速导航

| 规范类别 | 文档 | 说明 |
|---------|------|------|
| **开发流程** | [CONTRIBUTING.md](CONTRIBUTING.md) | 本文件 - 开发工作流、Git规范、代码标准 |
| **任务计划** | [ROADMAP.md](ROADMAP.md) | 功能开发优先级和任务列表 |
| **产品需求** | [dse-enhancer-prd-merged.md](dse-enhancer-prd-merged.md) | PRD产品需求文档 |
| **部署指南** | [DEPLOY.md](DEPLOY.md) | 部署配置和运维指南 |

---

## 🚀 开发工作流

### 1. 开始新任务前的检查清单

```markdown
□ 阅读 ROADMAP.md，确认当前优先级任务
□ 阅读 PRD 相关章节，理解产品需求
□ 检查GitHub Issues/PR，避免重复开发
□ 确认本地环境配置正确（详见README.md）
```

### 2. 功能开发流程

```
Step 1: 创建功能分支
    git checkout -b feature/功能名称

Step 2: 开发功能
    - 编写代码（遵循本规范）
    - 本地测试通过
    - 确保类型检查无错误

Step 3: 提交代码
    - 遵循Git提交规范
    - 单次提交只包含一个逻辑变更

Step 4: 推送并创建PR（如果是团队协作）
    - 或在本地合并到main后push

Step 5: 自动部署
    - push到main后自动触发部署
    - 检查GitHub Actions状态
```

---

## 📝 Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 | 使用场景 |
|------|------|---------|
| **feat** | 新功能 | 添加新功能、新页面、新API |
| **fix** | Bug修复 | 修复问题、错误 |
| **docs** | 文档 | 修改文档、注释 |
| **style** | 格式 | 代码格式化、分号、空格（不影响功能）|
| **refactor** | 重构 | 重构代码，既不修复bug也不添加功能 |
| **perf** | 性能 | 性能优化 |
| **test** | 测试 | 添加或修改测试 |
| **chore** | 构建 | 构建过程、依赖更新、工具配置 |
| **ci** | CI/CD | 持续集成配置修改 |

### Scope 范围

- `auth` - 认证相关
- `api` - API接口
- `ui` - 用户界面
- `db` - 数据库
- `study` - 学习模块
- `placement` - 入学测试
- `question` - 题库系统
- `scoring` - 计分系统
- `deploy` - 部署相关

### Subject 主题

- 简短描述（不超过50字符）
- 使用祈使句，现在时（"Add" not "Added"）
- 首字母小写
- 不要以句号结尾

### 示例

```bash
# 好的提交信息
feat(auth): add JWT token refresh mechanism
fix(api): resolve user registration validation error
docs(readme): update deployment instructions
refactor(study): simplify daily study flow state management
ci(deploy): add health check to deployment script

# 避免这样
update code
fix bug
添加功能
```

### Body 和 Footer（可选）

```
feat(study): implement one-click start study session

- Add StudySession component with timer
- Integrate with Zustand store
- Support both relaxed and diligent modes

Closes #123
```

---

## 💻 代码规范

### TypeScript 规范

#### 1. 类型定义

```typescript
// ✅ 好的示例
interface User {
  id: string;
  email: string;
  name: string;
  grade: 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6';
  currentLevel: number; // 1.0 - 5.9
  createdAt: Date;
}

type StudyMode = 'relaxed' | 'diligent';

// 使用明确的返回类型
async function getUserById(id: string): Promise<User | null> {
  // ...
}

// ❌ 避免这样
function getUser(id: string) {
  // ...
}
```

#### 2. 函数命名

```typescript
// ✅ 使用动词开头，明确功能
function calculateScore(answers: Answer[]): number
function validateEmail(email: string): boolean
function formatDate(date: Date): string

// ❌ 避免模糊命名
function calc(a: any): any
function check(s: string): boolean
```

#### 3. 组件命名

```typescript
// ✅ 使用 PascalCase，明确描述功能
export function StudySessionCard() {}
export function QuestionOptions() {}
export function AbilityRadarChart() {}

// ❌ 避免模糊命名
export function Card() {}
export function Component() {}
```

#### 4. 常量命名

```typescript
// ✅ 使用 UPPER_SNAKE_CASE
const MAX_QUESTIONS_PER_SESSION = 15;
const DEFAULT_STUDY_TIME = 40; // minutes
const LEVEL_THRESHOLD = {
  PASS: 60,
  GOOD: 80,
  EXCELLENT: 90
};

// 枚举使用 PascalCase
enum QuestionType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  READING = 'reading',
  LISTENING = 'listening'
}
```

### React/Next.js 规范

#### 1. 组件结构

```typescript
// ✅ 推荐结构
'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import { Button } from '@/components/ui/button';

interface StudyCardProps {
  title: string;
  duration: number;
  onStart: () => void;
}

export function StudyCard({ title, duration, onStart }: StudyCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useStore((state) => state.user);

  const handleStart = async () => {
    setIsLoading(true);
    await onStart();
    setIsLoading(false);
  };

  return (
    <div className="p-4 rounded-lg border">
      <h3>{title}</h3>
      <p>{duration} 分钟</p>
      <Button onClick={handleStart} disabled={isLoading}>
        {isLoading ? '加载中...' : '开始学习'}
      </Button>
    </div>
  );
}
```

#### 2. Hooks 使用规范

```typescript
// ✅ 按顺序使用 Hooks
function useStudySession() {
  const [session, setSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // ✅ 在useEffect中进行副作用操作
  useEffect(() => {
    if (user) {
      loadSession();
    }
  }, [user]);

  // ✅ 使用useCallback缓存函数
  const startSession = useCallback(async () => {
    setIsLoading(true);
    // ...
    setIsLoading(false);
  }, []);

  return { session, isLoading, startSession };
}
```

#### 3. 服务器组件 vs 客户端组件

```typescript
// ✅ 默认使用服务器组件（不需要'use client'）
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getUser();
  return <Dashboard user={user} />;
}

// ✅ 只在需要客户端交互时添加'use client'
// components/study-timer.tsx
'use client';

import { useState, useEffect } from 'react';

export function StudyTimer() {
  const [timeLeft, setTimeLeft] = useState(2400); // 40分钟

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div>{formatTime(timeLeft)}</div>;
}
```

### 数据库规范（Prisma）

#### 1. 模型定义

```prisma
// ✅ 使用清晰的字段名和注释
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  name          String
  grade         String   // F1-F6
  currentLevel  Float    @default(1.0) // 1.0-5.9
  targetLevel   Float    @default(3.0)
  
  // 关系字段
  studyRecords  DailyStudyRecord[]
  errorQuestions UserErrorQuestion[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("users")
}

model Question {
  id          String       @id @default(uuid())
  type        QuestionType
  difficulty  Float        // 0.5-5.9
  topic       String       // 知识点标签
  grade       String       // F1-F6
  content     Json         // 题目内容
  answer      String
  explanation String?
  
  @@index([type, difficulty])
  @@index([grade])
}
```

#### 2. 迁移规范

```bash
# 修改schema.prisma后

# 1. 生成迁移文件（开发环境）
npm run db:migrate:dev --name add_user_preferences

# 2. 应用迁移
npm run db:push

# 3. 生产环境使用deploy
npm run db:migrate:deploy
```

### API 开发规范

#### 1. 路由结构

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── placement/
│   ├── start/route.ts
│   └── submit/route.ts
├── study/
│   ├── start/route.ts
│   ├── submit/route.ts
│   └── finish/route.ts
└── questions/
    └── route.ts
```

#### 2. API 响应格式

```typescript
// ✅ 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 成功响应
return NextResponse.json({
  code: 200,
  data: { id: '123', name: '张三' },
  message: 'success'
});

// 错误响应
return NextResponse.json(
  {
    code: 400,
    data: null,
    message: '参数错误：email不能为空'
  },
  { status: 400 }
);
```

#### 3. 错误处理

```typescript
// ✅ 使用try-catch处理错误
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 验证输入
    if (!body.email) {
      return NextResponse.json(
        { code: 400, data: null, message: 'email不能为空' },
        { status: 400 }
      );
    }

    // 执行业务逻辑
    const result = await createUser(body);
    
    return NextResponse.json({
      code: 200,
      data: result,
      message: 'success'
    });
  } catch (error) {
    console.error('Create user error:', error);
    
    return NextResponse.json(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

---

## 🎨 UI/UX 规范

### 1. 使用 Tailwind CSS 规范

```typescript
// ✅ 使用一致的间距
<div className="p-4 md:p-6 lg:p-8">
<div className="space-y-4">

// ✅ 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ 颜色系统
<Button className="bg-primary hover:bg-primary/90">
<Badge className="bg-success text-white">
<Alert className="border-destructive text-destructive">
```

### 2. 组件复用

```typescript
// ✅ 优先使用Shadcn UI组件
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ✅ 不要重复造轮子
// ❌ 不要自己写按钮样式
<button className="px-4 py-2 bg-blue-500 text-white rounded">
```

### 3. 中文排版

```typescript
// ✅ 中文字体优化
<body className="font-sans text-gray-900 antialiased">

// ✅ 合适的行高和间距
<p className="leading-relaxed text-lg">
<h1 className="text-2xl font-bold mb-4">
```

---

## 🧪 测试规范

### 1. 测试文件位置

```
__tests__/
├── unit/
│   ├── scoring.test.ts
│   └── placement.test.ts
├── integration/
│   └── api.test.ts
└── e2e/
    └── study-flow.test.ts
```

### 2. 单元测试示例

```typescript
// __tests__/unit/scoring.test.ts
import { calculateScore } from '@/lib/scoring';

describe('calculateScore', () => {
  it('should calculate base score correctly', () => {
    const answers = [
      { isCorrect: true, timeSpent: 30 },
      { isCorrect: true, timeSpent: 45 },
      { isCorrect: false, timeSpent: 60 }
    ];
    
    const score = calculateScore(answers);
    
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- scoring

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

---

## 📚 文档规范

### 1. 代码注释

```typescript
/**
 * 计算用户得分
 * 使用边际递减算法：额外做题越多，边际得分越低
 * 
 * @param answers - 答题记录数组
 * @param difficulty - 当前难度系数
 * @returns 最终得分 (0-100)
 * 
 * @example
 * const score = calculateScore([
 *   { isCorrect: true, timeSpent: 30 },
 *   { isCorrect: false, timeSpent: 45 }
 * ], 2.5);
 */
export function calculateScore(
  answers: Answer[],
  difficulty: number
): number {
  // ...
}

// 简单的单行注释
const MAX_RETRY = 3; // 最大重试次数
```

### 2. README 更新

添加新功能后，更新相关文档：
- 更新 README.md 的功能列表
- 更新 ROADMAP.md 的任务状态
- 添加 API 使用示例

---

## 🔒 安全规范

### 1. 敏感信息

```typescript
// ✅ 使用环境变量
const JWT_SECRET = process.env.JWT_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;

// ❌ 永远不要硬编码敏感信息
const password = '123456';
```

### 2. 输入验证

```typescript
// ✅ 使用 Zod 进行输入验证
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  grade: z.enum(['F1', 'F2', 'F3', 'F4', 'F5', 'F6'])
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = userSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { code: 400, data: null, message: result.error.message },
      { status: 400 }
    );
  }
  
  // 处理验证后的数据
  const user = result.data;
}
```

### 3. SQL 注入防护

```typescript
// ✅ 使用 Prisma ORM（自动防注入）
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// ❌ 永远不要直接拼接SQL
const query = `SELECT * FROM users WHERE id = '${userId}'`;
```

---

## 🚀 部署规范

### 1. 部署前检查

```bash
# 1. 确保代码已提交
git status

# 2. 本地测试通过
npm run build
npm test

# 3. 类型检查无错误
npx tsc --noEmit

# 4. Lint检查
npm run lint
```

### 2. 自动部署

Push 到 main 分支后自动触发部署：
- GitHub Actions 会自动运行
- 检查部署状态：https://github.com/swj19821119/dse-enhancer/actions

### 3. 部署后验证

```bash
# 检查网站是否可访问
curl http://43.139.84.228:3000

# 检查服务器状态
ssh ubuntu@43.139.84.228 "pm2 list"
```

---

## ❓ 常见问题

### Q: 如何处理类型错误？

```bash
# 1. 运行类型检查，查看错误
npx tsc --noEmit

# 2. 根据错误信息修复
# 常见错误：
# - 缺少类型定义 → 添加 interface
# - null/undefined → 使用可选链操作符 ?.
# - 类型不匹配 → 使用类型断言（谨慎）或调整逻辑
```

### Q: 如何处理数据库变更？

```bash
# 1. 修改 prisma/schema.prisma

# 2. 创建迁移
npm run db:migrate:dev --name add_new_table

# 3. 应用迁移
npm run db:push

# 4. 生成Prisma Client
npm run db:generate
```

### Q: 如何调试API？

```bash
# 1. 查看服务器日志
ssh ubuntu@43.139.84.228 "pm2 logs"

# 2. 本地测试API
curl http://localhost:3000/api/endpoint

# 3. 使用控制台日志
console.log('Debug:', data);
```

---

## 📞 需要帮助？

遇到问题？按以下顺序查找解决方案：

1. **查看本文档** - 检查是否违反规范
2. **查看 PRD** - 确认需求理解正确
3. **查看 ROADMAP** - 确认实现方案
4. **GitHub Issues** - 搜索是否有类似问题
5. **询问维护者** - 创建Issue或PR讨论

---

## ✅ 提交前最终检查清单

```markdown
代码质量：
□ 类型检查通过 (npx tsc --noEmit)
□ 没有 console.log 调试代码（保留必要的）
□ 没有未使用的变量/导入
□ 代码格式化（使用项目配置）

功能完整：
□ 功能按PRD要求实现
□ 错误处理完善
□ 边界情况考虑
□ 响应式适配（移动端）

Git规范：
□ 提交信息符合规范
□ 单次提交只做一件事
□ 没有提交敏感信息

文档：
□ 必要注释已添加
□ README/ROADMAP已更新（如需要）
```

---

*感谢你的贡献！遵循这些规范能确保项目质量，让协作更顺畅。* 🎉
