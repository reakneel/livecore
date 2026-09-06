# 智核 LiveCore

**B站直播间智能互动控制台 · Standalone Vite Application**

LiveCore 是一个可直接运行、可直接部署的 **Vite + React + TypeScript** 前端产品。当前第一落地点是 Bilibili 直播间：连接公开直播数据与弹幕事件，将平台消息归一化为 LiveEvent，并在控制台中提供实时 Feed、规则建议、连接状态和房间管理。

> **重要边界**：`livecore` 本身就是产品前端，不需要被另一个 Vite 项目消费，也不依赖 `livecore-bilibili` 才能启动。

## 快速开始

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`。

生产构建：

```bash
npm run build
npm run preview
```

质量检查：

```bash
npm run typecheck
npm test
```

## 当前落地能力

- Vite + React + TypeScript 独立运行
- TanStack Router 客户端路由
- LiveCore Console UI
- Demo / Bilibili 真实房间双模式
- Bilibili 房间信息解析与开播状态检查
- Bilibili WebSocket 弹幕连接
- 认证帧、心跳、嵌套 packet、zlib / Brotli 数据解析
- 弹幕、礼物、进场、关注、分享、舰队、Super Chat 等统一 LiveEvent
- 连接状态、错误状态、指数退避 + jitter 重连
- 房间切换时的 session 隔离，避免旧连接污染新房间
- 实时事件 Feed 与规则建议队列
- 浏览器端配置持久化
- 响应式控制台
- favicon / Open Graph 分享资源
- Vitest 基础单元测试
- GitHub Actions：typecheck + test + production build
- Vercel SPA fallback 配置

## 架构

```text
Browser
  ↓
Vite
  ↓
React
  ↓
TanStack Router
  ↓
ConsoleApp
  ↓
LiveEngine
  ↓
Platform Registry
  ↓
Bilibili Adapter / WebSocket
  ↓
LiveEvent
```

核心目录：

```text
src/
├── components/console/   # 产品控制台 UI
├── components/ui/        # 基础 UI primitives
├── lib/livecore/         # Engine、事件、调度、规则、连接运行时
├── lib/platforms/        # 平台 adapter contract + Bilibili adapter
└── routes/               # SPA routes
```

平台抽象已经保留，但当前目标是**产品优先**：先让 LiveCore 自己可运行、可连接、可部署，再扩展其它平台。

## 浏览器运行边界

房间公开信息由 Bilibili Web API 获取，弹幕由浏览器 WebSocket 连接。实际部署时，Bilibili 接口的 CORS、WebSocket 策略或网络环境可能造成限制；遇到这类问题，应增加独立 edge/backend proxy，而不是把账号 Cookie、模型密钥等敏感凭据放进前端。

AI 回复目前在纯 Vite 浏览器模式安全降级，不在客户端暴露模型 API Key。后续可通过独立后端代理接入。

控制台默认停在「建议」层，不会使用账号 Cookie 自动向 Bilibili 发送弹幕、点赞或分享。请遵守 Bilibili 用户协议及适用法律法规。

## 部署

这是标准 Vite SPA，可部署到 Vercel、静态 CDN 或任意支持 SPA fallback 的 Web Server。仓库已经提供 `vercel.json`。

Vercel / 静态部署通常无需额外环境变量即可运行 Demo；真实 Bilibili 房间能力取决于浏览器到 Bilibili API / WebSocket 的网络策略。

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

## 项目边界与后续

`livecore-bilibili` 是后续独立的平台能力 / SDK 项目，不是 LiveCore 当前运行时依赖。

当前产品已经完成第一阶段落地，后续只做增量能力：

1. AI 独立后端代理
2. 多房间 Dashboard
3. 第二个平台 adapter
4. 更完整的生产级监控与观测

## License

当前仓库尚未声明开源许可证；在添加正式 License 前，请按项目所有者的授权范围使用。
