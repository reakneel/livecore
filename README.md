# 智核 LiveCore

**B站直播间智能互动控制台 · Standalone Vite Application**

LiveCore 是一个可直接运行、可直接部署的 **Vite + React + TypeScript** 前端产品。当前第一落地点是 Bilibili 直播间：控制台负责 UI、状态与交互，B 站连接与协议处理交给独立的 `livecore-bilibili` Python SDK，通过本仓库内置的轻量 HTTP + WebSocket adapter 接入。

> **重要边界**：`livecore` 本身就是产品前端，不需要被另一个 Vite 项目消费。`livecore-bilibili` 是后端连接 SDK；浏览器不会重新实现 B 站 packet / heartbeat / reconnect / parser。

## 架构

```text
Browser
  ↓
Vite + React
  ↓
ConsoleApp → LiveEngine → Platform Adapter
                         ↓
                  HTTP + WebSocket
                         ↓
              server/main.py (aiohttp)
                         ↓
             livecore-bilibili SDK
                         ↓
          Bili HTTP / WebSocket / Protocol
                         ↓
                     LiveEvent
                         ↓
                   Console Feed
```

SDK 仓库的 README 明确建议 Vite 与 SDK 之间增加薄的 HTTP + WebSocket API adapter，典型接口为：

```text
GET    /api/rooms
POST   /api/rooms/:room_id/start
DELETE /api/rooms/:room_id
GET    /api/rooms/:room_id/health
WS     /api/rooms/:room_id/events
```

本仓库现在按这个边界实现。SDK 负责连接生命周期、guest / authenticated handshake、heartbeat、reconnect、packet 展开与 `LiveEvent`；Vite 只消费统一事件流。

## 快速开始

### 仅运行 UI / Demo

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`。

### 运行真实 B 站房间

需要 Python 3.11+。

终端 1：安装并启动 SDK adapter：

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate

pip install -r server/requirements.txt
npm run dev:server
```

终端 2：启动 Vite：

```bash
npm install
npm run dev
```

然后在控制台输入正在直播的 B 站房间号。

Vite 开发服务器会把 `/api` 与 WebSocket 请求代理到 `127.0.0.1:8787`，浏览器不直接连接 B 站协议层。

### 生产构建

```bash
npm run build
npm run preview
```

### 前端质量检查

```bash
npm run typecheck
npm test
npm run build
```

## 当前落地能力

- Vite + React + TypeScript 独立运行
- TanStack Router 客户端路由
- LiveCore Console UI
- Demo / Bilibili 真实房间双模式
- SDK-backed Bilibili room lifecycle
- HTTP + WebSocket Vite adapter
- guest / authenticated handshake 入口
- SDK 负责 heartbeat、reconnect、packet expand、Brotli / zlib 与事件解析
- 弹幕、礼物、进场、关注、分享、舰队、Super Chat、人气等统一 `LiveEvent`
- 实时事件 Feed 与规则建议队列
- 连接状态、错误状态、房间 session 隔离
- 浏览器端配置持久化
- 响应式控制台
- favicon / Open Graph 分享资源
- Vitest 基础单元测试
- GitHub Actions：typecheck + test + production build
- Vercel SPA fallback 配置

## 核心目录

```text
src/
├── components/console/   # 产品控制台 UI
├── components/ui/        # 基础 UI primitives
├── lib/livecore/         # Engine、事件、调度、规则、SDK API adapter
├── lib/platforms/        # 平台 adapter contract + Bilibili gateway adapter
└── routes/               # SPA routes

server/
├── main.py               # aiohttp HTTP + WebSocket adapter
├── requirements.txt      # livecore-bilibili + aiohttp
└── __init__.py
```

已经删除浏览器侧重复的 Bilibili `client.ts / protocol.ts / parser.ts`。这些职责现在只存在于 `livecore-bilibili` SDK，避免两套协议实现逐渐产生行为漂移。

## SDK 对接

当前依赖直接指向：

```text
https://github.com/reakneel/livecore-bilibili.git
```

SDK 当前版本为 `0.1.0`，Python >= 3.11。其 README 定义的核心连接层包括 `MultiRoomSupervisor`、`ConnectionSupervisor`、`ConnectionHealth`、`BiliLiveClient` 和 `LiveEvent`。

`ConnectionSupervisor` 已提供公开的 event/state hook，因此 adapter 不需要访问 SDK 私有字段。

## 浏览器与部署边界

真实 Bilibili 连接现在不再由浏览器直接实现协议，而是由 Python SDK adapter 负责。这解决了浏览器 CORS / WebSocket 环境差异，也避免把 SDK 的 Python 协议栈复制到 TypeScript。

因此：

- **Demo**：只运行 Vite 即可。
- **真实 Bilibili**：Vite + Python adapter 必须同时运行。
- **Vercel**：可以部署 Vite 前端，但真实房间能力需要一个独立的 Python adapter 服务；不要把 Python SDK 塞进 Vite bundle。
- AI 回复目前安全降级，不在客户端暴露模型 API Key。
- 控制台默认不会使用账号 Cookie 自动向 Bilibili 发送弹幕、点赞或分享。

## CI

GitHub Actions 在 push / pull request 到 `main` 时执行：

```text
npm install
  ↓
npm run typecheck
  ↓
npm test
  ↓
npm run build
```

Python adapter 的运行依赖和 CI 可以独立演进；前端 CI 不需要把 Python SDK 打进浏览器 bundle。

## 后续

1. SDK adapter 稳定化与 integration test
2. 多房间 Dashboard
3. AI 独立后端代理
4. 第二个平台 adapter
5. 生产级 metrics / tracing

## License

当前仓库尚未声明开源许可证；在添加正式 License 前，请按项目所有者的授权范围使用。
