# DSE Enhancer MVP 调整计划

## 调整原则
1. **数据库**：保持SQLite，MVP阶段不迁移到PostgreSQL
2. **AI服务**：MVP阶段不使用收费AI服务，使用浏览器原生Web Speech API
3. **PK对战**：MVP阶段不开发，后续业务需要时再考虑
4. **音频方案**：使用浏览器Web Speech API（TTS + 语音识别），无需后端存储

---

## 1. 数据库Schema调整

### 1.1 移除的表
- `VocabularyPkGame` - PK对战表（MVP不开发）
- `AudioRecord` - 语音记录表（改用浏览器Web Speech API，无需存储）

### 1.2 需要添加的字段

#### User表
```prisma
model User {
  // ...现有字段
  phone         String?   // 手机号（香港+852）
  parentId      String?   // 家长账号ID（亲子账号，MVP后开发）
  studyMode     String    @default("relaxed") // "relaxed" | "diligent"
}
```

#### Vocabulary表
```prisma
model Vocabulary {
  // ...现有字段
  part          String    @default("part_a") // "part_a" | "part_b"
}
```

#### Question表
```prisma
model Question {
  // ...现有字段
  part          String?   // "part_a" | "part_b"
}
```

#### DailyStudyRecord表
```prisma
model DailyStudyRecord {
  // ...现有字段
  studyMode     String    @default("relaxed") // "relaxed" | "diligent"
}
```

### 1.3 需要移除的关系
- User模型中的 `pkGamesAsUser1` 和 `pkGamesAsUser2` 关系
- User模型中的 `audioRecords` 关系
- Question模型中的 `audioRecords` 关系

---

## 2. MVP功能范围（调整后）

### ✅ 保留功能（8个核心功能）

1. **用户系统**
   - 注册/登录（邮箱+密码）
   - 无注册体验（访客模式）
   - 个人档案（年级、目标等级）
   - VIP状态（基础字段，后续开发支付）

2. **入学自适应测试**
   - 年级选择（小学到中六）
   - 15题自适应测试
   - 能力定级（6维度）
   - 能力图谱展示

3. **每日学习流程**
   - 轻松学模式（35分钟）
   - 勤奋学模式（45分钟，含Part B）
   - 4个模块：词汇、语法、阅读、错题复习
   - 进度追踪和完成报告

4. **词汇模块**
   - 单词卡片展示
   - Part A/Part B区分
   - 生词本（认识/不认识）
   - 浏览器TTS发音（Web Speech API）

5. **语法模块**
   - 按难度分级（1-5级）
   - 按知识点分类
   - 即时反馈和解析

6. **阅读模块**
   - 文章阅读
   - 生词点击查词
   - 选择题答题

7. **错题本**
   - 错题记录
   - 错题复习
   - 间隔重复（简化版算法）

8. **数据看板**
   - 首页统计
   - 学习记录
   - 能力图谱

### ❌ 移除功能（MVP后开发）

1. **PK对战** - 需要Redis + WebSocket，暂不开发
2. **排行榜** - 依赖PK对战数据，暂不开发
3. **AI写作评分** - 需要ArkCode/GPT-4o API，成本过高
4. **AI口语评分** - 需要Whisper ASR + AI评分，成本过高
5. **听力模块** - 需要TTS音频生成，成本过高
6. **亲子账号** - 复杂度较高，MVP后开发
7. **完整真题模考** - 需要大量题目数据，MVP后填充

---

## 3. 音频方案调整

### 原方案（成本过高）
- 后端TTS生成音频 → 存储到OSS → CDN分发
- 用户录音 → 上传到OSS → Whisper ASR转文字 → AI评分

### 新方案（零成本）
- **词汇发音**：使用浏览器Web Speech API（TTS）
- **听力练习**：MVP阶段暂不提供，或提供文字稿
- **口语练习**：MVP阶段暂不提供
- **写作练习**：MVP阶段提供自评+范文对比，无AI评分

### Web Speech API使用示例
```typescript
// TTS - 文字转语音
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB'; // 英音
  utterance.rate = 0.9; // 语速稍慢
  speechSynthesis.speak(utterance);
};

// 语音识别（可选，MVP暂不使用）
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-GB';
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('识别结果:', transcript);
};
```

---

## 4. API调整清单

### 需要实现的API（MVP）

#### 认证相关
- [x] `POST /api/auth/register` - 注册
- [x] `POST /api/auth/login` - 登录
- [ ] `POST /api/auth/logout` - 登出
- [ ] `GET /api/auth/me` - 获取当前用户

#### 用户相关
- [ ] `GET /api/user/me` - 获取用户信息
- [ ] `PUT /api/user/profile` - 更新个人信息
- [ ] `GET /api/user/abilities` - 获取能力图谱
- [ ] `PUT /api/user/mode` - 切换学习模式

#### 入学测试
- [ ] `POST /api/placement/start` - 开始入学测试
- [ ] `POST /api/placement/submit` - 提交答案
- [ ] `GET /api/placement/result` - 获取测试结果

#### 每日学习
- [ ] `POST /api/study/start-daily` - 开始每日学习
- [ ] `GET /api/study/current` - 获取当前学习进度
- [ ] `POST /api/study/submit` - 提交模块答案
- [ ] `POST /api/study/complete` - 完成每日学习

#### 词汇模块
- [ ] `GET /api/vocabulary/daily` - 获取今日单词
- [ ] `POST /api/vocabulary/status` - 更新单词状态
- [ ] `GET /api/vocabulary/list` - 获取生词本

#### 题库相关
- [x] `GET /api/questions` - 获取题目列表
- [ ] `GET /api/questions/:id` - 获取单个题目
- [ ] `POST /api/questions/answer` - 提交答案

#### 错题本
- [ ] `GET /api/errors` - 获取错题列表
- [ ] `POST /api/errors/review` - 复习错题
- [ ] `DELETE /api/errors/:id` - 移除错题

### 暂不实现的API（MVP后）

- [ ] `POST /api/writing/score` - AI写作评分（需要AI服务）
- [ ] `POST /api/speaking/score` - AI口语评分（需要AI服务）
- [ ] `GET /api/vocabulary/pk/start` - PK对战（需要Redis）
- [ ] `GET /api/rankings/weekly` - 排行榜（需要Redis）
- [ ] `POST /api/family/create-child` - 亲子账号（MVP后）

---

## 5. 开发阶段调整（基于成本优化）

### 阶段1：基础架构（Week 1）
- [ ] 调整数据库Schema（移除PK对战表，添加必要字段）
- [ ] 生成Prisma Client
- [ ] 配置环境变量
- [ ] 部署到测试环境

### 阶段2：认证与用户（Week 2）
- [ ] 实现注册/登录API
- [ ] 实现用户信息API
- [ ] 实现无注册体验（访客模式）
- [ ] 前端登录/注册页面

### 阶段3：入学测试（Week 3）
- [ ] 实现入学测试API
- [ ] 实现自适应算法
- [ ] 实现能力定级
- [ ] 前端测试页面
- [ ] 能力图谱页面

### 阶段4：核心学习流程（Week 4-5）
- [ ] 实现每日学习API
- [ ] 实现轻松学/勤奋学模式
- [ ] 实现词汇模块（含Web Speech API TTS）
- [ ] 实现语法模块
- [ ] 实现阅读模块
- [ ] 前端学习流程页面

### 阶段5：错题本与数据（Week 6）
- [ ] 实现错题本API
- [ ] 实现间隔重复算法（简化版）
- [ ] 实现学习记录统计
- [ ] 前端错题本页面
- [ ] 数据看板优化

### 阶段6：测试与优化（Week 7）
- [ ] 编写单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] Bug修复

### 阶段7：部署上线（Week 8）
- [ ] 配置Docker
- [ ] 配置Nginx
- [ ] SSL证书
- [ ] 生产环境部署
- [ ] 上线监控

**总计：8周（2个月）**

---

## 6. 成本对比

### 原方案成本（每月）
| 项目 | 费用 |
|------|------|
| PostgreSQL（腾讯云） | ¥200-500 |
| Redis（腾讯云） | ¥100-200 |
| AI服务（ArkCode/GPT-4o） | ¥500-2000（按量） |
| 对象存储（OSS） | ¥50-100 |
| CDN | ¥100-300 |
| **总计** | **¥950-3100/月** |

### MVP方案成本（每月）
| 项目 | 费用 |
|------|------|
| SQLite（本地文件） | ¥0 |
| Web Speech API（浏览器原生） | ¥0 |
| 服务器（腾讯云轻量） | ¥50-100 |
| **总计** | **¥50-100/月** |

**成本降低：95%以上**

---

## 7. 风险与应对

### 风险1：Web Speech API兼容性
- **风险**：部分浏览器不支持Web Speech API
- **应对**：提供降级方案（显示音标+播放按钮禁用）
- **检测代码**：
```typescript
const isTTSSupported = 'speechSynthesis' in window;
const isRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
```

### 风险2：SQLite并发性能
- **风险**：SQLite并发写入性能差
- **应对**：
  - MVP阶段用户量少，问题不大
  - 使用连接池限制并发
  - 后续迁移到PostgreSQL

### 风险3：无AI评分体验下降
- **风险**：写作/口语无AI评分，用户体验不如竞品
- **应对**：
  - 提供详细范文对比
  - 提供自评清单
  - 强调"MVP版本，AI功能即将上线"
  - 快速迭代，2个月内上线AI功能

---

## 8. 后续迭代计划

### MVP+1（上线后1个月）
- 接入AI写作评分（ArkCode API）
- 听力模块（TTS音频）
- 更多真题数据

### MVP+2（上线后2-3个月）
- 口语AI评分（Whisper + GPT-4o）
- 迁移到PostgreSQL
- PK对战 + 排行榜（Redis）

### MVP+3（上线后3-6个月）
- 亲子账号体系
- 完整真题模考
- 移动端APP

---

## 9. 执行检查清单

### 立即执行
- [ ] 调整prisma/schema.prisma（移除PK对战表，添加字段）
- [ ] 运行 `npx prisma generate` 生成新Client
- [ ] 运行 `npx prisma db push` 更新数据库

### 本周完成
- [ ] 实现所有基础API
- [ ] 替换所有mock数据为真实数据库操作
- [ ] 集成Web Speech API到词汇模块

### 下周完成
- [ ] 完成入学测试流程
- [ ] 完成每日学习流程
- [ ] 完成错题本功能

---

**计划制定时间**: 2026-03-25
**计划版本**: v1.0（成本优化版）
**预计MVP上线时间**: 2026-05-25（8周后）
