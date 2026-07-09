# 游纪 · MyGame

> 把日常任务变成一场 RPG 的桌面自我管理应用。

你是一名「骑士」，日常事务是「任务」。完成任务获得经验、金币与精力，解锁成就与 AI 生成的
SVG 勋章，点亮技能树，维持连击，并周期性地把进展凝练成叙事化的「剧情日志」。

一个 Electron 桌面应用，本地优先、离线可用，所有数据存在本机 SQLite。

## ✨ 核心功能

- **任务 → 成长**：完成任务结算经验 / 金币 / 精力（EP）
- **三资源系统**：精力（EP）、意志力、精神——任务按「耗能 / 自驱 / 喜好」消耗资源，
  睡觉、休息、记录心情来恢复
- **本地校准**：根据历史记录自适应修正任务预估与资源系数，越用越准
- **成就与 AI 勋章**：达成条件解锁成就，AI 现场生成 SVG 勋章
- **技能树**：D3 力导向图可视化的技能升级
- **连击（Streak）**：维持每日节奏，断签有提醒
- **剧情日志**：AI 把一段时间的进展总结成叙事文本
- **多窗口**：主看板 + 常驻 HUD + 悬浮任务面板 + 全局热键快速记录 + 成就庆祝全屏
- **多 Provider AI**：Anthropic 与多家 OpenAI 兼容服务，API key 只留在主进程

## 🧱 技术栈

| 层 | 选型 |
|----|------|
| 桌面 | Electron 31（多窗口） |
| UI | React 18 + TypeScript 5.5 |
| 构建 | electron-vite + Vite 5 |
| 样式 | Tailwind CSS 4 + Framer Motion |
| 状态 | Zustand 5 |
| 数据库 | better-sqlite3 + Drizzle ORM |
| 可视化 | D3.js（技能树） |
| AI | Anthropic SDK + OpenAI 兼容客户端 |

## 🏗️ 架构

- **主进程**（`electron/`）：窗口生命周期、IPC、SQLite/Drizzle、全部 AI 调用、
  全局快捷键、托盘、通知。不含 React。
- **渲染进程**（`src/`）：跨 5 个窗口共享组件与 store 的 React UI。
- **Preload**（`electron/preload/`）：暴露给渲染进程的 IPC 桥。

```
renderer (React) → preload IPC → 主进程 IPC handler → Drizzle → SQLite
                 ← Zustand store ← IPC 返回 ←──────────────────┘
```

数据、AI、勋章等按 domain 拆分：IPC handler、Zustand store、DB repository、React 组件
各自一个目录一类职责。所有 AI 生成内容缓存进 SQLite，保证离线可用。

## 🚀 开发

需要 Node.js 与 npm。

```bash
npm install          # 安装依赖（postinstall 会重建原生 better-sqlite3）
npm run dev          # 启动应用（HMR）
npm run build        # 类型检查 + 构建
npm run build:win    # 构建并打包 Windows 安装包（另有 :mac / :linux）
npm run typecheck    # tsc --noEmit
npm run lint         # eslint --fix
npm run format       # prettier --write
```

数据库文件位于用户数据目录（`%APPDATA%/my-game/my-game.db`），迁移在启动时自动执行。

## 📁 目录结构

```
electron/
  main.ts              # 入口 / 启动序列
  windows/             # 每个窗口一个文件
  ipc/                 # IPC handler，按 domain 一个文件
  services/
    ai/                # AI 客户端、缓存、各场景 prompt
    db/                # schema、migrations、各表 repository
    resources/         # 三资源结算与本地校准
    companion/         # AI 桌面伴侣（开发中，默认关闭）
  preload/
src/
  *.tsx / *.html       # 各窗口入口
  components/          # 按功能拆分的组件
  stores/  hooks/  utils/  types/
```

## 📄 License

本项目采用 **[PolyForm Noncommercial License 1.0.0](./LICENSE)**。

允许任何人查看、修改、分发源码，**但仅限非商业用途**。研究、学习、个人使用、
业余项目、非营利组织使用均属许可范围；任何商业用途需另行获得授权。

Copyright (c) 2026 Rekk0
