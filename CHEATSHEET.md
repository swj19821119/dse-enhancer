# DSE Enhancer - 开发规范速查表

> 快速参考指南 - 适合贴在屏幕旁或打印

---

## 🎯 开始工作前的3件事

1. ✅ 阅读 **ROADMAP.md** - 确认当前优先级任务
2. ✅ 阅读 **PRD** 相关章节 - 理解产品需求  
3. ✅ 查看 **GitHub Actions** - 确认部署状态正常

---

## 📝 Git 提交速查

```bash
# 格式
type(scope): subject

# 常用类型
feat    - 新功能
fix     - Bug修复
docs    - 文档
style   - 格式（空格、分号）
refactor- 重构
test    - 测试
chore   - 构建/依赖
ci      - CI/CD配置

# 示例
feat(study): add daily study timer component
fix(api): resolve user login validation error
docs(readme): update API usage examples
```

---

## 💻 TypeScript 速查

```typescript
// 接口命名 - PascalCase
interface StudySession {
  id: string;
  mode: 'relaxed' | 'diligent';
  startTime: Date;
}

// 函数命名 - 动词开头
function calculateScore(answers: Answer[]): number
function validateEmail(email: string): boolean

// 组件命名 - PascalCase
export function StudyTimer() {}
export function QuestionCard() {}

// 常量 - UPPER_SNAKE_CASE
const MAX_QUESTIONS = 15;
const DEFAULT_TIME = 40;
```

---

## 🎨 代码规范速查

### 组件结构
```typescript
'use client'; // 只在需要时

import { useState } from 'react'; // React hooks
import { Button } from '@/components/ui/button'; // UI组件

interface Props {
  title: string;
}

export function Component({ title }: Props) {
  const [state, setState] = useState();
  
  return <div>{title}</div>;
}
```

### Tailwind 常用
```typescript
// 间距
className="p-4 md:p-6 space-y-4"

// 响应式
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// 颜色
className="bg-primary text-white hover:bg-primary/90"

// 状态
className="disabled:opacity-50 disabled:cursor-not-allowed"
```

---

## 🗄️ Prisma 速查

```bash
# 修改 schema.prisma 后

# 生成迁移（开发）
npm run db:migrate:dev --name add_feature

# 应用迁移
npm run db:push

# 生成Client
npm run db:generate

# 查看数据
npm run db:studio
```

### 常用字段类型
```prisma
id          String   @id @default(uuid())
email       String   @unique
name        String
age         Int
score       Float
data        Json
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

---

## 🔌 API 开发速查

### 响应格式
```typescript
// 成功
return NextResponse.json({
  code: 200,
  data: result,
  message: 'success'
});

// 错误
return NextResponse.json(
  { code: 400, data: null, message: '错误信息' },
  { status: 400 }
);
```

### 输入验证
```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { code: 400, message: result.error.message },
    { status: 400 }
  );
}
```

---

## 🧪 测试速查

```bash
# 运行测试
npm test

# 测试特定文件
npm test -- scoring

# 覆盖率报告
npm test -- --coverage
```

### 测试示例
```typescript
// __tests__/unit/example.test.ts
describe('functionName', () => {
  it('should do something', () => {
    const result = functionName(input);
    expect(result).toBe(expected);
  });
});
```

---

## 🚀 部署流程

```bash
# 1. 本地检查
npm run build          # 构建
npm test              # 测试
npx tsc --noEmit      # 类型检查

# 2. 提交代码
git add .
git commit -m "feat: description"
git push origin main

# 3. 自动部署（GitHub Actions）
# 查看状态：https://github.com/swj19821119/dse-enhancer/actions

# 4. 验证部署
curl http://43.139.84.228:3000
```

---

## ❌ 常见错误 & 解决

| 错误 | 原因 | 解决 |
|------|------|------|
| `Type error` | 类型不匹配 | 添加类型定义或类型断言 |
| `Cannot find module` | 路径错误 | 检查import路径，使用@/别名 |
| `Prisma Client error` | 数据库未连接 | 运行 `npm run db:generate` |
| `Build failed` | 代码错误 | 查看详细错误信息，修复代码 |
| `Deploy failed` | 部署问题 | 查看GitHub Actions日志 |

---

## 🔗 重要链接

```
GitHub:     https://github.com/swj19821119/dse-enhancer
Actions:    https://github.com/swj19821119/dse-enhancer/actions
PRD:        dse-enhancer-prd-merged.md
ROADMAP:    ROADMAP.md
部署指南:   DEPLOY.md
完整规范:   CONTRIBUTING.md

生产环境:   http://43.139.84.228:3000
本地开发:   http://localhost:3000
```

---

## 💡 黄金法则

1. **先读文档，再写代码** 📖
2. **一个提交，一件事** ✨
3. **类型优先，any最后** 🔒
4. **测试覆盖，信心倍增** ✅
5. **注释清晰，维护省心** 📝

---

*保持简单，保持清晰，保持高质量* 🎯
