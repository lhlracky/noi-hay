# 越南语口语练习 App — 技术架构文档

## 1. 技术选型总览

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│           Next.js 14 (App Router)                    │
│         TypeScript + Tailwind CSS                    │
│         Web Audio API (录音)                         │
│         Canvas API (波形可视化)                       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────▼──────────────────────────────┐
│                   Backend API                        │
│              Node.js + Fastify                       │
│              TypeScript + Prisma ORM                 │
│              Redis (缓存/队列)                       │
└──────┬───────────┬──────────────┬───────────────────┘
       │           │              │
  ┌────▼───┐  ┌───▼────┐  ┌─────▼──────┐
  │ ASR    │  │ LLM    │  │ PostgreSQL │
  │ 语音识别│  │ 对话AI │  │  数据库     │
  └────────┘  └────────┘  └────────────┘
```

---

## 2. 前端架构

### 2.1 技术栈
| 层 | 选型 | 理由 |
|----|------|------|
| 框架 | Next.js 14 (App Router) | SSR + 路由 + API Routes 一体化 |
| 语言 | TypeScript | 类型安全，减少运行时错误 |
| 样式 | Tailwind CSS + shadcn/ui | 快速开发，风格统一 |
| 状态 | Zustand | 轻量，适合中等复杂度 |
| 录音 | Web Audio API + MediaRecorder | 浏览器原生，无需插件 |
| HTTP | fetch + React Query | 缓存 + 重试 + 加载状态 |

### 2.2 核心模块

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页/欢迎页
│   ├── learn/              # 学习路径
│   ├── practice/           # 场景练习
│   │   └── [scenarioId]/   # 动态场景页
│   ├── review/             # 发音回顾
│   └── profile/            # 个人中心
├── components/
│   ├── audio/
│   │   ├── Recorder.tsx        # 录音组件
│   │   ├── Waveform.tsx        # 波形可视化
│   │   ├── ToneChart.tsx       # 声调曲线图
│   │   └── ScoreDisplay.tsx    # 分数展示
│   ├── chat/
│   │   ├── ChatBubble.tsx      # 对话气泡
│   │   ├── ChatInput.tsx       # 语音输入区
│   │   └── ScenarioCard.tsx    # 场景卡片
│   └── ui/                     # 通用 UI 组件
├── hooks/
│   ├── useRecorder.ts      # 录音逻辑封装
│   ├── useASR.ts           # 语音识别
│   └── useConversation.ts  # 对话状态管理
├── lib/
│   ├── audio.ts            # 音频处理工具
│   ├── api.ts              # API 客户端
│   └── vietnamese.ts       # 越南语工具函数
└── stores/
    ├── practiceStore.ts    # 练习状态
    └── userStore.ts        # 用户状态
```

### 2.3 录音与音频处理

```typescript
// hooks/useRecorder.ts 核心逻辑
interface UseRecorderOptions {
  maxDuration?: number;      // 最大录音时长 (ms)
  silenceThreshold?: number; // 静音阈值 (dB)
  silenceTimeout?: number;   // 静音自动停止 (ms)
}

// 流程:
// 1. getUserMedia() 获取麦克风权限
// 2. MediaRecorder 录制为 webm/opus
// 3. 实时 AnalyserNode 绘制波形
// 4. 静音检测 → 自动停止
// 5. Blob → Base64 或 FormData 上传
```

### 2.4 声调可视化

越南语有 6 个声调，声调曲线是发音评估的核心：

```
声调:  ngang(平)  huyền(沉)  sắc(升)  hỏi(问)  ngã(跌)  nặng(重)
曲线:  ─────     ╲          ╱        ╲╱        ∽         •
       ma        mà        má        mả        mã        mạ
```

前端用 Canvas 绘制用户实际声调 vs 标准声调的对比图。

---

## 3. 后端架构

### 3.1 技术栈
| 层 | 选型 | 理由 |
|----|------|------|
| 运行时 | Node.js 20 LTS | 生态丰富，异步 I/O |
| 框架 | Fastify | 性能优于 Express，TypeScript 友好 |
| ORM | Prisma | 类型安全，迁移方便 |
| 数据库 | PostgreSQL 16 | 可靠，支持 JSONB |
| 缓存 | Redis 7 | 会话缓存、任务队列 |
| 对象存储 | S3 / MinIO | 音频文件存储 |
| 部署 | Docker + Fly.io / Railway | 快速上线 |

### 3.2 API 设计

```
POST   /api/auth/login              # 登录
POST   /api/auth/register           # 注册

# 场景
GET    /api/scenarios                # 场景列表
GET    /api/scenarios/:id            # 场景详情（含对话脚本）

# 练习
POST   /api/practice/recognize      # 语音识别（上传音频 → 文字）
POST   /api/practice/evaluate       # 发音评估（上传音频 → 评分）
POST   /api/practice/converse       # AI 对话（发送文字 → AI回复）
POST   /api/practice/converse-voice # 语音对话（音频 → 识别 → 对话 → TTS）

# 进度
GET    /api/progress                 # 学习进度概览
GET    /api/progress/history         # 练习历史
POST   /api/progress/record          # 记录练习结果

# 用户
GET    /api/user/profile             # 用户信息
PUT    /api/user/settings            # 更新设置
```

### 3.3 语音处理流水线

```
用户录音 (webm/opus)
    │
    ▼
[音频预处理]
    ├─ 格式转换: webm → wav (16kHz, mono)
    ├─ 降噪: RNNoise
    └─ VAD: 语音活动检测，去除静音段
    │
    ▼
[ASR 语音识别] ──────────────────────┐
    ├─ 主模型: Whisper large-v3       │
    ├─ 备选: Google Cloud Speech      │
    └─ 输出: 文本 + 时间戳 + 置信度   │
    │                                 │
    ▼                                 │
[发音评估] ◄─────────────────────────┘
    ├─ 音素级别对齐 (Forced Alignment)
    ├─ 声调检测 (基频 F0 提取)
    ├─ 相似度评分 (与标准发音对比)
    └─ 输出: 总分 + 维度分 + 逐词评分
    │
    ▼
[结果返回前端]
    JSON: {
      transcript: "Xin chào, tôi muốn gọi món",
      score: { overall: 82, tone: 75, vowel: 88, ... },
      words: [
        { text: "Xin", score: 90, tone: "correct" },
        { text: "chào", score: 70, tone: "needs_work" },
        ...
      ],
      suggestion: "注意 'chào' 的声调是升调(sắc)，需要从低到高"
    }
```

### 3.4 AI 对话系统

```
┌──────────────────────────────────────────┐
│              LLM 对话引擎                 │
│                                          │
│  System Prompt:                          │
│  "你是越南河内一家餐厅的服务员。           │
│   用简单越南语和顾客对话。                 │
│   如果顾客说错了，温和地纠正。             │
│   每次回复不超过2句话。"                   │
│                                          │
│  对话历史: [...]                          │
│  用户最新输入: "Tôi muốn phở bò"         │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 1. 语法检查                        │  │
│  │ 2. 生成回复（越南语）               │  │
│  │ 3. 附带中文翻译                     │  │
│  │ 4. 附带表达建议                     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  输出:                                   │
│  {                                       │
│    reply_vi: "Dạ, phở bò ngon lắm!      │
│               Anh muốn phở tái hay chín?",│
│    reply_zh: "好的，牛肉河粉很好吃！      │
│               您要生牛肉还是熟牛肉？",      │
│    correction: null,                     │
│    new_words: ["tái(生的)", "chín(熟的)"]│
│  }                                       │
└──────────────────────────────────────────┘
```

**LLM 选型：**
| 方案 | 优势 | 劣势 |
|------|------|------|
| GPT-4o | 越南语能力强 | 成本高 |
| Claude 3.5 | 长上下文好 | 越南语稍弱 |
| Gemini 2.0 | 多模态原生支持 | API 限制多 |
| 本地 Qwen2.5 | 免费、可控 | 需要 GPU |

**推荐方案**：MVP 用 GPT-4o-mini（成本低+速度快），后续优化用微调的小模型。

---

## 4. 数据模型

```prisma
// prisma/schema.prisma

model User {
  id          String   @id @default(cuid())
  phone       String?  @unique
  wechatId    String?  @unique
  nickname    String
  level       Level    @default(A1)
  goal        Goal?
  createdAt   DateTime @default(now())
  
  progress    Progress[]
  sessions    PracticeSession[]
  settings    UserSetting?
}

model UserSetting {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])
  accent      Accent  @default(NORTH)  // 北部/南部口音
  speed       Speed   @default(NORMAL) // 语速偏好
  dailyGoal   Int     @default(10)     // 每日目标(分钟)
}

model Scenario {
  id          String   @id @default(cuid())
  titleVi     String                    // 越南语标题
  titleZh     String                    // 中文标题
  icon        String                    // emoji
  level       Level
  category    Category
  description String
  dialogues   Json                      // 对话脚本 JSON
  vocabulary  Json[]                    // 重点词汇
  isActive    Boolean  @default(true)
  
  sessions    PracticeSession[]
}

model PracticeSession {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  scenarioId  String?
  scenario    Scenario? @relation(fields: [scenarioId], references: [id])
  type        PracticeType              // VOCAB / SENTENCE / DIALOGUE
  
  score       Float?                    // 总分
  details     Json?                     // 详细评分
  duration    Int                       // 时长(秒)
  audioUrl    String?                   // 录音文件URL
  
  createdAt   DateTime  @default(now())
}

model Progress {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime @default(now())
  
  totalMinutes Int     @default(0)
  sessionsCount Int    @default(0)
  avgScore     Float?
  streakDays   Int     @default(0)
  
  @@unique([userId, date])
}

enum Level { A1 A2 B1 B2 }
enum Goal { TRAVEL BUSINESS INTEREST STUDY }
enum Accent { NORTH SOUTH }
enum Speed { SLOW NORMAL FAST }
enum Category { RESTAURANT TRANSPORT SHOPPING HOTEL HEALTH PHONE INTRO DAILY }
enum PracticeType { VOCAB SENTENCE DIALOGUE }
```

---

## 5. 核心技术难点与方案

### 5.1 越南语 ASR 准确率

**问题**：越南语是声调语言，通用 ASR 模型声调识别率低。

**方案**：
1. **Whisper 微调**：用越南语语音数据集（VLSP、Common Voice vi）微调
2. **声调后处理**：ASR 输出后，用基频(F0)分析校正声调标注
3. **多模型投票**：Whisper + Google ASR 结果对比，取高置信度

### 5.2 发音评分算法

```
评分 = weighted_sum(
  声调准确度   × 0.40,  // 越南语核心
  音素准确度   × 0.30,
  语速适当度   × 0.15,
  完整度       × 0.15
)

声调准确度计算:
1. 提取用户音频的 F0 基频曲线
2. 提取标准音频的 F0 基频曲线
3. DTW (动态时间规整) 对齐
4. 计算曲线相似度 (0-100)

音素准确度计算:
1. Forced Alignment 获取每个音素的时间段
2. 提取 MFCC 特征
3. 与标准音素模板对比
4. 计算相似度
```

### 5.3 实时性优化

| 环节 | 目标延迟 | 优化策略 |
|------|---------|---------|
| 录音上传 | < 500ms | 流式上传，边录边传 |
| ASR | < 2s | Whisper small (速度优先) |
| 评分 | < 1s | 异步计算，先返回文字 |
| AI 回复 | < 3s | 流式输出，GPT-4o-mini |
| TTS | < 1.5s | 预生成常用句，Edge TTS |

---

## 6. 部署架构

```
                    ┌─────────────┐
                    │   Vercel    │  ← 前端 (Next.js)
                    │   CDN       │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Fly.io    │  ← 后端 API
                    │   Region:   │    (新加坡/胡志明)
                    │   Singapore │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼────┐ ┌────▼─────┐ ┌────▼─────┐
        │PostgreSQL│ │  Redis   │ │   S3     │
        │ (Neon)   │ │ (Upstash)│ │ (R2)    │
        └──────────┘ └──────────┘ └──────────┘
              │
        ┌─────▼──────────────┐
        │   AI Services      │
        │   - OpenAI API     │
        │   - Whisper API    │
        │   - Edge TTS       │
        └────────────────────┘
```

### 6.1 环境变量

```env
# 数据库
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI 服务
OPENAI_API_KEY=sk-...
WHISPER_MODEL=whisper-1

# 存储
S3_BUCKET=vietnamese-audio
S3_ENDPOINT=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# 认证
JWT_SECRET=...
WECHAT_APP_ID=...
WECHAT_APP_SECRET=...
```

---

## 7. 开发路线图

### Phase 1: MVP（4 周）
- [ ] 项目初始化 (Next.js + Fastify + Prisma)
- [ ] 录音组件 + 波形可视化
- [ ] ASR 接入 (Whisper API)
- [ ] 基础发音评分 (整体分数)
- [ ] 3 个场景对话 (餐厅/打车/自我介绍)
- [ ] 简单用户系统 (游客模式)
- [ ] 基础 UI (shadcn/ui)

### Phase 2: 完善（3 周）
- [ ] 声调评估 + 声调曲线图
- [ ] 10+ 场景对话
- [ ] 学习路径 + 分级系统
- [ ] 用户进度追踪
- [ ] 微信登录
- [ ] 性能优化

### Phase 3: 上线（2 周）
- [ ] 部署流水线
- [ ] 监控报警
- [ ] 用户测试 + Bug 修复
- [ ] Landing Page
- [ ] 小范围邀请测试

### Phase 4: 增长（持续）
- [ ] 游戏化（成就、连续打卡）
- [ ] 社交功能
- [ ] 移动端 App (React Native)
- [ ] 更多语言（泰语、印尼语）

---

## 8. 项目结构

```
vietnamese-speaking-app/
├── docs/                    # 文档
│   ├── PRD.md
│   └── TECHNICAL.md
├── frontend/                # Next.js 前端
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
├── backend/                 # Fastify 后端
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── asr.ts          # 语音识别服务
│   │   │   ├── scoring.ts      # 发音评分服务
│   │   │   ├── conversation.ts # AI 对话服务
│   │   │   └── tts.ts          # 语音合成服务
│   │   ├── prisma/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

*文档版本：v1.0 | 创建日期：2026-05-18*
