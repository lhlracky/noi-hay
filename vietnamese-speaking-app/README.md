# Nói Hay 🇻🇳 — 越南语口语练习

AI 驱动的越南语口语练习应用。选场景，开口说，AI 听你发音并给反馈。

## 功能

- 🎙️ **录音 + 实时波形可视化** — 浏览器麦克风录音，实时音频波形
- 📊 **发音评分** — 声调、发音、语速、完整度 4 维度评分 + 逐词反馈
- 💬 **AI 场景对话** — 6 个真实场景（餐厅/打车/购物/酒店/医疗/打招呼）
- 🎯 **声调专项练习** — 越南语 6 声调逐个突破
- 📚 **词汇跟读** — 谐音标注，先练词再练对话
- 🤖 **真实 AI 后端** — Whisper ASR 语音识别 + GPT-4o-mini 动态对话

## 快速开始

```bash
cd frontend
npm install

# 可选：配置 API Key（不配置也能用，会降级为 Mock 模式）
cp .env.example .env.local
# 编辑 .env.local，填入 OPENAI_API_KEY

npm run dev
```

打开 http://localhost:3000

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 14 + TypeScript + Tailwind CSS |
| 录音 | Web Audio API + MediaRecorder |
| ASR | OpenAI Whisper API（可选） |
| 对话 | GPT-4o-mini + JSON mode（可选） |
| 评分 | 自研：编辑距离 + 声调分析 + 加权评分 |
| 状态 | React hooks + 简单 state |

## 项目结构

```
frontend/src/
├── app/
│   ├── page.tsx                    # 首页（场景选择 + 快捷入口）
│   ├── practice/[id]/page.tsx      # 练习页（录音 → 评分 → 对话）
│   ├── tones/page.tsx              # 声调专项练习
│   └── api/practice/
│       ├── evaluate/route.ts       # ASR + 发音评分 API
│       └── converse/route.ts       # AI 对话 API
├── components/
│   ├── audio/Recorder.tsx          # 录音组件（麦克风 + 波形）
│   ├── audio/Waveform.tsx          # Canvas 实时波形
│   ├── audio/ScoreDisplay.tsx      # 评分展示（4维度 + 逐词）
│   └── chat/ChatInterface.tsx      # 对话界面（气泡 + 打字动画）
├── hooks/useRecorder.ts            # 录音逻辑封装
└── lib/
    ├── scenarios.ts                # 6个场景数据
    └── vietnamese.ts               # 越南语工具（声调检测等）
```

## 模式说明

| 模式 | 无 API Key | 有 API Key |
|------|-----------|------------|
| 语音识别 | 返回目标文本 | Whisper 真实识别 |
| 发音评分 | 模拟分数 | 编辑距离 + 声调分析 |
| AI 对话 | 固定回复 | GPT-4o-mini 动态对话 |

## 截图

_运行后访问 http://localhost:3000 查看_

## 下一步

- [ ] 声调基频(F0)曲线对比可视化
- [ ] 用户系统 + 学习进度持久化
- [ ] 每日打卡 + 推送提醒
- [ ] 部署到 Vercel
- [ ] React Native 移动端
