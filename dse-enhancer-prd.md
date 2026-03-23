# DSE Enhancer - Product Requirements Document

**项目名称**: DSE Enhancer
**定位**: 香港DSE英语AI自适应学习平台，专为在港大陆学生设计
**核心 slogan**: 每天40分钟，精准提高DSE英语成绩
**MVP阶段**: 2026-Q1

---

## 1. 产品定位

### 目标用户
- 在港就读的大陆学生
- DSE英语成绩普遍在2-3级，目标提升到3-5级
- 每天放学后可以抽出40分钟集中学习

### 核心痛点
1. 大陆学生基础不差，但不适应DSE的题型和出题思路
2. 香港本地培训班太贵，时间不灵活
3. 现有线上平台内容太泛，不针对DSE垂直场景
4. 缺乏个性化自适应，不知道每天该练什么

### 差异化
- ✅ 垂直只做DSE英语，完全贴合考纲
- ✅ **无注册体验** - 用户不注册也能进行首次测试评估和练习体验，降低使用门槛
- ✅ AI自适应学习，每天自动安排针对性练习
- ✅ 一键开始，40分钟完成，碎片化设计贴合课后场景
- ✅ AI评分写作口语，即时反馈，不需要等老师批改
- ✅ 游戏化PK排行榜，激励坚持学习

---

## 2. 核心业务流程

### 整体流程
```
用户访问 → 【无注册体验】→ 可直接进行首次测试评估和练习体验
    ↓
    ↓ (体验满意后引导注册)
    ↓
注册/登录 → 选择年级 → 入学自适应测试 → 能力定级 → 生成初始学习计划
    ↓
每日访问 → 点击【一键开始今日40分钟】→ 系统自动组合内容 → 按顺序完成四个模块
    ↓
每日结算 → 各模块计分 → 生成总分 → 分析弱项 → 调整明日练习 → 打卡完成
    ↓
持续迭代 → 能力提升 → 调整难度 → 直到达到目标分数
```

### 无注册体验说明
- **未注册用户**：可以进行首次测试评估和练习体验，但成绩不会保存，无法使用自适应学习功能
- **体验目标**：降低用户门槛，先体验产品价值，满意后再引导注册

### 关键设计：一键开始每日学习
用户不需要自己选内容，系统根据：
1. 当前能力水平
2. 历史得分弱项
3. 错题知识点
4. 学习进度

自动组合成：
- 词汇 10分钟
- 语法 10分钟
- 阅读/听力 10分钟（轮流，偏弱项优先）
- 错题复习 10分钟

总共约40分钟，符合用户场景。

---

## 3. 功能模块详情

### 3.1 用户体系

| 功能 | 说明 |
|------|------|
| 注册登录 | 邮箱/手机号 + 验证码 |
| 个人档案 | 年级、目标分数、当前等级、学习天数、累计积分 |
| 能力图谱 | 可视化展示听/说/读/写四个维度的当前等级 |
| 会员系统 | 免费试用7天，付费会员解锁全部功能 |

### 3.2 入学自适应测试

```
流程：
1. 用户选择年级（中三/中四/中五/中六）
2. 15分钟，15题，从难度适中开始
3. 答对 → 下一题难度提升；答错 → 难度降低
4. 完成后算法计算出用户水平（Level 1-5，对应DSE等级）
5. 输出能力报告：强项/弱项分析
6. 生成个性化学习路径
```

### 3.3 首页数据看板

```
┌──────────────────────────────────────┐
│ 👋 你好，张三！ 连续学习 7 天         │
├──────────────────────────────────────┤
│  🚀 [ 点击一键开始今日40分钟学习 ]    │  ← 超大显眼按钮
├──────────────────────────────────────┤
│ 📈 昨日总分：82 / 100                 │
│   词汇：18/25  语法：22/25            │
│   阅读：21/25  听力：21/25            │
├──────────────────────────────────────┤
│ 🎯 能力图谱                           │
│   阅读：■■■■□ 4级                     │
│   听力：■■■□□ 3级                     │
│   写作：■■□□□ 2级                     │
│   口语：■■□□□ 2级                     │
├──────────────────────────────────────┤
│ 🏆 排行榜 - 本周学习时长              │
│   1. 李四  320分钟                     │
│   2. 王五  280分钟                     │
│   3. 你   240分钟                     │
├──────────────────────────────────────┤
│ 🔍 自由练习                           │
│ [词汇] [阅读] [听力] [写作] [口语]    │
└──────────────────────────────────────┘
```

### 3.4 词汇闯关模块

**业务流程**：
```
进入词汇板块
  ├─ 选择：【闯关背单词】/【生词本复习】/【PK对战】
  └─ 闯关背单词
       ↓
       本日解锁关卡 → 开始
       ↓
       单词卡片：
       ┌─────────────────────────┐
       │  单词：analyse          │
       │  音标： /ˈænəlaɪz/      │
       │  中文： v. 分析         │
       │                         │
       │  [🔊 播放] [🎤 跟读]    │
       └─────────────────────────┘
             ↓
         点击【🎤 跟读】→ 用户录音 → ASR识别 → 发音评分
             ✓ 准确 → 下一个
             ✗ 不准 → 标红错音节 → 示范 → 再读一次
             ↓
         真题例句：
         "The data can be analysed to find patterns."
             ↓
         选择认识/不认识 → 不认识自动加入生词本
             ↓
         完成一组 → 小结 → 下一组
             ↓
         完成本日目标 → 解锁下一关 → 获得积分/勋章
```

**核心特性**：
- 按DSE考频排序，先背高频词
- 按主题分组（环境/教育/科技/文化...）
- 全部用DSE真题例句，在语境中记忆
- 支持跟读发音评分，背单词同时练口语
- 间隔重复算法，生词自动重复复习
- 游戏化闯关，连胜 streak 激励

### 3.5 听力练习模块

**业务流程**：
```
进入听力 → 选择难度/知识点 → 开始
    ↓
    ┌──────────────────────────────┐
    │  🎧 题目：DSE 2023 Paper 3    │
    │                              │
    │  [▶播放] [⏸暂停]              │
    │                              │
    │  Question 1: _______         │
    │  [输入框]                     │
    │                              │
    │  [交卷]                      │
    └──────────────────────────────┘
    ↓
交卷 → 立即批改 → 错题显示原文翻译 → 生词一键加入生词本
    ↓
错题自动收藏 → 加入错题本复习
```

**音源方案**：
- MVP：使用Google TTS/阿里云TTS生成英音，成本极低
- 后期：可以找真人录音替换，提升体验

### 3.6 阅读练习模块

**业务流程**：
```
进入阅读 → 选择主题/难度 → 开始
    ↓
    ┌──────────────────────────────┐
    │  文章（支持滚动）             │
    │                              │
    │  点击生词 → 弹窗出翻译        │
    │  [加入生词本]                 │
    └──────────────────────────────┘
    ↓
    读完文章 → 开始答题（选择+简答）
    ↓
    交卷 → 批改 → 错题分析 → 生词统计
```

### 3.7 语法专项练习

**业务流程**：
- 按DSE常考语法点分类（时态/冠词/从句/虚拟语气...）
- 大陆学生常见弱项重点标注
- 每次10题，做完马上改分，看解析
- 错题自动收藏

### 3.8 写作练习模块

**业务流程**：
```
进入写作 → 选择题目（真题/模拟）
    ↓
    ┌──────────────────────────────┐
    │  题目要求展示                 │
    │  字数要求：400-600            │
    └──────────────────────────────┘
    ↓
    用户输入作文 → 提交AI评分
    ↓
    AI返回评分报告：
    ┌──────────────────────────────┐
    │  总分：XX/5 (DSE等级)        │
    │                              │
    │  内容扣题：⭐⭐⭐⭐           │
    │  组织结构：⭐⭐⭐            │
    │  词汇运用：⭐⭐⭐⭐           │
    │  语法准确：⭐⭐⭐            │
    │                              │
    │  修改建议：                   │
    │  第3段可以更紧扣主题...       │
    │  这些句型可以升级...          │
    │                              │
    │  [查看参考范文]               │
    └──────────────────────────────┘
```

**评分逻辑**：
- 使用大语言模型按照DSE评分标准从四个维度打分
- 给出具体修改建议
- MVP可以用AI直接评分，后期可以加人工批改付费服务

### 3.9 口语练习模块

**业务流程**：
```
进入口语 → 选择题型（Part A个人独白/Part B小组讨论）
    ↓
    看题目准备1分钟 → 点击开始录音
    ↓
    录音完成 → 提交
    ↓
    AI处理：
    1. Whisper ASR转文字
    2. 发音评分（单词准确性/重音/流利度）
    3. 内容评分（扣题/词汇/语法）
    ↓
    输出报告：
    ┌──────────────────────────────┐
    │  总分：XX/5                   │
    │  发音：⭐⭐⭐⭐               │
    │  内容：⭐⭐⭐                 │
    │                              │
    │  发音不准的单词标红          │
    │  内容改进建议                 │
    └──────────────────────────────┘
```

### 3.10 错题本模块

**业务流程**：
```
进入错题本
  ├─ 支持按题型/知识点筛选
  └─ 开始复习
       ↓
       错题重现 → 再做一次
       ↓
       做对 → 从错题本移除
       做错 → 保留，下次继续复习
```

**算法**：间隔重复，做错的题增加复习频率

### 3.11 词汇PK对战模块

**业务流程**：
```
进入PK → 匹配对手（或邀请好友）
    ↓
    准备：10个单词
    ↓
    回合制：显示中文 → 用户拼英文 → 答对得分
    ↓
    10题结束 → 算分 → 排名更新 → 赢者得积分
```

**目的**：增加互动性和用户粘性，满足你要的PK激励

### 3.12 每日总结报告

完成每日40分钟后输出：

```
┌──────────────────────────────────────┐
│  🎉 恭喜完成今日40分钟学习！           │
│                                      │
│  总分：XXX / 100                     │
│  词汇：XX / 25    语法：XX / 25       │
│  阅读：XX / 25    听力：XX / 25       │
│                                      │
│  💪 你今日弱项：语法第三条件句        │
│  👉 明日会增加相关练习                │
│                                      │
│  连续学习：7天  积分：+50             │
└──────────────────────────────────────┘
```

### 3.13 自适应调整算法

```
每日总分 = Σ(模块得分 × 难度权重)

调整规则：
1. 某模块得分 < 60 → 明日增加该模块练习权重
2. 某模块得分 > 85 → 明日升高难度，减少基础练习
3. 错题知识点 → 自动加入第二天错题复习
4. 保持每日总时长约40分钟
```

---

## 4. 题库建设策略

### MVP阶段
1. **真题整理**：整理公开的DSE历年真题（2012-2024），用于产品验证
2. **AI辅助出题**：用大模型按照DSE题型和难度生成新题，人工抽检
3. **听力音源**：TTS生成，成本极低
4. **作文口语**：AI评分，不需要人工

### 后续扩容
1. 每年更新最新真题
2. 用户报错反馈，人工审核更新题库
3. 逐步换成真人录音听力

### 标签体系
每道题必须打标签：
- 题型：词汇/语法/阅读/听力/写作/口语
- 知识点：具体语法点/主题
- 难度：1-5级
- DSE年份：如果是真题

---

## 5. 商业模型（MVP不着急，先做出来）

- 免费试用7天
- 月卡/季卡/年卡付费会员
- 价格比香港本地培训班便宜很多
- 后续可以加人工作文批改增值服务

---

## 6. MVP范围确认

✓ **必须做**：
- [x] 用户注册登录 + 个人档案
- [x] 入学自适应测试 + 能力分级
- [x] 一键开始每日40分钟学习流程
- [x] 词汇闯关（含跟读评分）
- [x] 语法专项练习
- [x] 阅读练习
- [x] 听力练习（TTS音源）
- [x] AI作文评分
- [x] 口语练习 + AI评分
- [x] 错题本 + 间隔复习
- [x] 每日计分 + 自适应调整
- [x] 数据看板 + 能力图谱
- [x] 词汇PK + 排行榜

✗ **后续做**：
- [ ] 完整模考
- [ ] 人工作文批改付费服务
- [ ] 讨论社区
- [ ] 移动端小程序

---

# DSE Enhancer - Technical Architecture Document

---

## 1. 技术选型

### 整体架构
- **前端**：React 18 + TypeScript + Tailwind CSS + Shadcn UI
  - 原因：组件丰富，开发快，样式美观，适合MVP
  - Tailwind  Utility-first 快速开发

- **后端**：Node.js + Express / Next.js Full Stack
  - 原因：全JS栈，开发效率高，前后端可以一人维护
  - 选择Next.js = 前端+后端一体化，部署简单

- **数据库**：PostgreSQL
  - 原因：支持复杂查询，结构化数据适合本题库系统
  - 腾讯云PostgreSQL托管，省心

- **缓存**：Redis (可选，MVP可以不用，后期加)

- **AI能力**：
  - 作文/口语内容评分：调用ArkCode / GPT-4o API
  - ASR语音识别：OpenAI Whisper (本地部署或API)
  - TTS语音合成：Google Text-to-Speech / 阿里云TTS API
  - 发音评分：可以用Whisper+比对，或第三方API

- **部署**：
  - 服务器：你已经买的腾讯云Ubuntu
  - Docker + Docker Compose 容器化部署
  - Nginx 反向代理 + SSL证书 (Let's Encrypt)
  - CI/CD：GitHub Actions → 代码push自动构建部署

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                        用户浏览器                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      Nginx (反向代理SSL)                   │
└────────────────────────────┬────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   Next.js App     │ │   PostgreSQL      │ │   Redis (可选)   │
│  (前端+后端API)   │ │   主数据存储       │ │   缓存会话       │
└───────────────────┘ └───────────────────┘ └───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   第三方API调用                           │
│  - AI评分 (ArkCode/GPT)                                  │
│  - ASR (Whisper)                                         │
│  - TTS (Google/阿里云)                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 数据库表结构设计

### 3.1 用户表 `users`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| email | VARCHAR(255) | 邮箱，唯一 |
| phone | VARCHAR(20) | 手机号 |
| password_hash | VARCHAR(255) | 密码哈希 |
| name | VARCHAR(100) | 用户昵称 |
| grade | VARCHAR(20) | 年级：form3/form4/form5/form6 |
| target_level | INT | 目标DSE等级 1-5 |
| current_level | INT | 当前预估DSE等级 1-5 |
| is_vip | BOOLEAN | 是否会员 |
| vip_expire_at | TIMESTAMP | 会员过期时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 3.2 能力等级表 `user_abilities`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 关联用户 |
| reading_level | INT | 阅读等级 1-5 |
| listening_level | INT | 听力等级 1-5 |
| writing_level | INT | 写作等级 1-5 |
| speaking_level | INT | 口语等级 1-5 |
| vocabulary_level | INT | 词汇等级 1-5 |
| grammar_level | INT | 语法等级 1-5 |
| updated_at | TIMESTAMP | 更新时间 |

### 3.3 词汇表 `vocabulary`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| word | VARCHAR(100) | 单词 |
| phonetic | VARCHAR(100) | 音标 |
| definition | VARCHAR(255) | 中文释义 |
| frequency | INT | DSE考频 |
| topic | VARCHAR(100) | 主题分类 |
| example | TEXT | 真题例句 |
| difficulty | INT | 难度 1-5 |
| created_at | TIMESTAMP | 创建时间 |

### 3.4 用户单词记忆表 `user_vocabulary`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| vocabulary_id | UUID | 单词 |
| status | ENUM | learned/unknown/learning |
| last_reviewed | TIMESTAMP | 上次复习时间 |
| next_review | TIMESTAMP | 下次复习时间（间隔重复） |
| difficulty_factor | FLOAT | SR算法难度因子 |
| created_at | TIMESTAMP | 创建时间 |

### 3.5 题库表 `questions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| type | ENUM | vocabulary/grammar/reading/listening/writing/speaking |
| sub_type | VARCHAR(50) | 子题型 |
| topic | VARCHAR(100) | 知识点/主题 |
| difficulty | INT | 难度 1-5 |
| content | JSONB | 题目内容（结构化存储选项/文章等）|
| answer | JSONB | 参考答案 |
| explanation | TEXT | 解析 |
| source | VARCHAR(50) | 来源：dse-20xx/ai-generated |
| year | INT | DSE年份（如果是真题）|
| is_approved | BOOLEAN | 是否通过人工审核 |
| created_at | TIMESTAMP | 创建时间 |

### 3.6 用户答题记录表 `user_answers`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| question_id | UUID | 题目 |
| user_answer | JSONB | 用户答案 |
| is_correct | BOOLEAN | 是否正确 |
| score | INT | 得分 |
| created_at | TIMESTAMP | 答题时间 |

### 3.7 错题本表 `user_error_questions`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| question_id | UUID | 错题 |
| error_count | INT | 错了几次 |
| last_wrong_at | TIMESTAMP | 上次做错时间 |
| created_at | TIMESTAMP | 创建时间 |

### 3.8 每日学习记录表 `daily_study_records`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| study_date | DATE | 学习日期 |
| total_minutes | INT | 学习时长（分钟）|
| total_score | INT | 今日总分 |
| vocabulary_score | INT | 词汇得分 |
| grammar_score | INT | 语法得分 |
| reading_score | INT | 阅读得分 |
| listening_score | INT | 听力得分 |
| completed | BOOLEAN | 是否完成40分钟 |
| created_at | TIMESTAMP | 创建时间 |

### 3.9 学习会话表 `study_sessions`

```
一键开始后会创建一个会话，保存当前进度
```
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| current_module | INT | 当前到第几个模块 |
| modules | JSONB | 预生成的模块列表题目 |
| started_at | TIMESTAMP | 开始时间 |
| finished_at | TIMESTAMP | 结束时间 |
| created_at | TIMESTAMP | 创建时间 |

### 3.10 词汇PK对战表 `vocabulary_pk_games`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user1_id | UUID | 玩家1 |
| user2_id | UUID | 玩家2 |
| score1 | INT | 玩家1得分 |
| score2 | INT | 玩家2得分 |
| status | ENUM | waiting/playing/finished |
| started_at | TIMESTAMP | 开始时间 |
| finished_at | TIMESTAMP | 结束时间 |

### 3.11 语音记录表 `audio_records`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户 |
| question_id | UUID | 关联题目 |
| audio_url | VARCHAR(255) | 音频文件地址 |
| duration | INT | 时长（秒）|
| asr_text | TEXT | ASR识别结果 |
| pronunciation_score | FLOAT | 发音得分 |
| content_score | FLOAT | 内容得分 |
| created_at | TIMESTAMP | 创建时间 |

---

## 4. API 接口设计

### 认证相关
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出

### 用户相关
- `GET /api/user/me` - 获取当前用户信息
- `GET /api/user/abilities` - 获取用户能力图谱
- `PUT /api/user/profile` - 更新个人信息

### 入学测试
- `POST /api/placement/start` - 开始入学测试
- `POST /api/placement/submit` - 提交答案，计算结果

### 每日学习
- `POST /api/study/start-daily` - 一键开始今日学习，生成会话
- `GET /api/study/current-session` - 获取当前会话
- `POST /api/study/next-module` - 进入下一个模块
- `POST /api/study/finish-daily` - 完成今日学习，结算

### 词汇模块
- `GET /api/vocabulary/daily-words` - 获取今日单词
- `POST /api/vocabulary/pronunciation-check` - 检查发音
- `POST /api/vocabulary/update-status` - 更新单词会/不会状态
- `GET /api/vocabulary/pk/start` - 开始PK
- `POST /api/vocabulary/pk/submit-answer` - 提交PK答案

### 答题
- `POST /api/questions/submit` - 提交答案，返回批改结果

### 写作口语
- `POST /api/writing/score` - 提交作文，AI评分
- `POST /api/speaking/score` - 提交录音，AI评分

### 错题本
- `GET /api/errors/list` - 获取错题列表
- `POST /api/errors/review` - 错题复习提交

### 排行榜
- `GET /api/rankings/weekly` - 每周排行榜

---

## 5. 前端目录结构

```
src/
├── components/        # 通用组件
│   ├── ui/           # Shadcn UI 基础组件
│   ├── Card/         # 业务组件
│   └── ...
├── pages/            # 页面
│   ├── Home/         # 首页看板
│   ├── Login/        # 登录页
│   ├── Register/     # 注册页
│   ├── Vocabulary/  # 词汇闯关
│   ├── Reading/      # 阅读练习
│   ├── Listening/    # 听力练习
│   ├── Writing/      # 写作练习
│   ├── Speaking/     # 口语练习
│   ├── ErrorBook/    # 错题本
│   └── Profile/      # 个人中心
├── hooks/            # 自定义 hooks
├── utils/            # 工具函数
├── services/         # API 调用封装
├── store/            # 状态管理 (Zustand)
├── types/            # TypeScript 类型定义
└── styles/           # 全局样式
```

---

## 6. 后端目录结构 (Next.js)

```
app/
├── api/              # API 路由
│   ├── auth/
│   ├── study/
│   ├── vocabulary/
│   ├── questions/
│   └── ...
├── (front)/          # 前端页面路由
└── ...

lib/
├── db/               # 数据库连接
├── ai/               # AI服务封装 (评分/ASR/TTS)
├── utils/            # 工具函数
├── algorithms/       # 算法 (自适应/间隔重复)
└── ...
```

---

## 7. 编码规范

1. **TypeScript**：所有代码必须加类型，禁止 `any`
2. **命名**：驼峰命名，函数名动词开头，如 `getUser()`
3. **组件**：一个文件一个组件，组件名大驼峰
4. **API**：统一返回格式 `{code: number, data: T, message: string}`
5. **错误处理**：所有异步操作必须捕获错误
6. **Git**：每次提交一个清晰的功能，commit message 语义化

---

## 8. 部署方案 (腾讯云 Ubuntu)

### 基础设施
- 服务器：腾讯云 Ubuntu 22.04
- 域名：你需要注册一个域名，解析到服务器IP
- SSL：Let's Encrypt 免费证书
- 数据库：腾讯云PostgreSQL托管，或者Docker跑在服务器上

### Docker Compose 配置
```yaml
version: '3.8'
services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://...
      - AI_API_KEY=...
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
  postgres:
    image: postgres:15-alpine
    restart: always
    volumes:
      - postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=...
  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis-data:/data
volumes:
  postgres-data:
  redis-data:
```

### CI/CD (GitHub Actions)
```
代码push到GitHub main分支 → 自动构建Docker镜像 → SSH到服务器拉取最新镜像 → 重启容器 → 完成部署
```

---

## 9. 环境变量需要配置

```
# 数据库
DATABASE_URL=postgresql://user:password@host:port/dbname

# AI API
ARK_API_KEY=your-ark-api-key
# 或者 OPENAI_API_KEY=your-openai-key

# TTS
GOOGLE_TTS_API_KEY=...
# 或者 ALIYUN_TTS_ACCESS_KEY=...

# JWT密钥
JWT_SECRET=your-jwt-secret

# 域名
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

---

## 10. 开发顺序建议

1. **阶段1**：项目初始化 → 数据库建表 → 认证系统 → 首页看板
2. **阶段2**：入学测试 → 能力定级
3. **阶段3**：词汇闯关 → 跟读评分 → 生词本
4. **阶段4**：语法练习 → 阅读练习 → 听力练习
5. **阶段5**：一键开始每日流程 → 计分 → 自适应调整
6. **阶段6**：写作AI评分 → 口语AI评分
7. **阶段7**：错题本 → 复习
8. **阶段8**：词汇PK → 排行榜
9. **阶段9**：部署上线 → 测试

---

## 11. 风险与注意事项

1. **版权**：MVP用公开真题验证，商业化后需要转自研AI出题
2. **AI评分准确性**：需要持续校准，和真实DSE评分标准对齐
3. **音频存储**：录音文件存在云存储，控制成本
4. **成本控制**：API调用按量付费，MVP阶段用户少成本很低

---

**版本**: v1.0 (MVP)
**最后更新**: 2026-03-23
**产品负责人**: 梅
**技术负责人**: 兰
