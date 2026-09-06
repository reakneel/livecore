# LiveCore

LiveCore 是一个**可直接运行的 Vite + React 前端项目**，当前第一落地点是 Bilibili 直播间智能互动控制台。

本仓库就是产品前端本体，不是需要被另一个 Vite 项目消费的 SDK。克隆后安装依赖即可启动；控制台视觉风格、Demo 流、Bilibili 房间连接、事件 Feed、建议队列和响应式布局都在这里运行。

## 快速开始

```bash
npm install
npm run dev
```

默认开发地址：`http://localhost:5173`

生产构建：

```bash
npm run build
npm run preview
```

类型检查：`npm run typecheck`

## 当前能力

- Vite + React + TypeScript 独立运行
- TanStack Router 客户端路由
- Bilibili 房间信息解析
- Bilibili 弹幕 WebSocket 连接
- 认证帧 / 心跳 / 人气 / 通知帧处理
- zlib / Brotli / 嵌套 packet 解析
- 弹幕、礼物、进场、关注、分享、舰队、Super Chat 等统一事件模型
- 指数退避 + jitter 重连
- 实时事件 Feed
- 规则建议队列
- Demo / 真实 Bilibili 房间双模式
- 浏览器端配置持久化
- 移动端响应式控制台

## 项目边界

`livecore` 是前端应用；`livecore-bilibili` 是后续独立的平台能力/SDK 项目。当前不要求启动或部署其它仓库，LiveCore 自己即可运行。

```text
livecore
├── Vite
├── React
├── Console UI
├── LiveEngine
├── unified LiveEvent
└── Bilibili adapter/runtime
```

平台抽象位于 `src/lib/platforms/`，但当前阶段的目标是把**前端产品先跑起来并可直接部署**，而不是提前把 LiveCore 改造成 SDK 或 API 服务。

## 安全边界

控制台默认停在「建议」层，不会使用账号 Cookie 自动向 Bilibili 发送弹幕、点赞或分享。请遵守 Bilibili 用户协议及适用法律法规。

## Roadmap

1. ✅ Vite 独立可运行 + Bilibili 初始支持
2. 房间体验与异常恢复完善
3. AI 服务接入（独立后端代理保护密钥）
4. 多房间 Dashboard
5. 第二个平台 adapter
