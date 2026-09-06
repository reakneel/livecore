# LiveCore

LiveCore 是 LiveCore 直播 SDK 的前端集成项目，当前以 **Bilibili 初始支持** 为第一落地点。

本仓库只维护 Web / Vite 消费侧代码与交互体验，不复制 Python SDK 的运行时。现有控制台风格保持不变，直播连接、事件流、建议队列、AI 辅助和配置均在前端统一呈现。

## 当前能力

- Bilibili 房间信息解析
- Bilibili 弹幕 WebSocket 连接
- 认证帧 / 心跳 / 人气 / 通知帧处理
- zlib / Brotli / 嵌套 packet 解析（由当前 TypeScript runtime 提供）
- 弹幕、礼物、进场、关注、分享、舰队、Super Chat 等统一事件模型
- 指数退避 + jitter 重连
- 实时事件 Feed
- 规则建议队列
- AI 回复辅助（服务端调用 xAI，未配置时安全降级）
- Demo / 真实 Bilibili 房间双模式
- 浏览器端 localStorage 配置持久化

## 与 livecore-bilibili 的关系

`livecore-bilibili` 是平台连接 / 协议 SDK；本仓库是前端集成层。

```text
livecore
  │
  ├── Console UI
  ├── LiveEngine
  ├── unified LiveEvent
  └── platform registry
          │
          └── Bilibili adapter
                  │
                  └── livecore-bilibili capability
```

当前为了快速落地，浏览器侧保留了 TypeScript runtime。平台边界已经收敛到 `src/lib/platforms/`，后续可以把这里的 Bilibili adapter 替换为 HTTP + WebSocket API，而不改变 UI 和事件层。

## 使用方式

本仓库 intentionally 只包含 `src/` 与前端集成代码，构建配置、依赖和部署由消费它的 Vite / TanStack Start 项目提供。

将仓库作为源码依赖后，入口为 `/`，架构说明位于 `/architecture`。

## 安全边界

当前控制台只接收公开直播事件，并把自动互动保持在“建议队列”层；默认不会自动向直播间发送弹幕、点赞或分享。请遵守 Bilibili 用户协议及适用法律法规。

## Roadmap

1. Bilibili 初始支持（当前）
2. 稳定 API / WebSocket adapter
3. 房间管理与多房间状态
4. 第二个平台 adapter
5. 多平台统一 Dashboard
