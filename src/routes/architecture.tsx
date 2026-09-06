import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/architecture")({ component: ArchitecturePage });

const LAYERS = [
  {
    title: "应用入口",
    items: ["读取人格、间隔、冷启动配置", "启动连接 / 消息 / AI / 行为模块", "演示厅与真实 Bilibili 房间两种源"],
  },
  {
    title: "平台适配",
    items: ["LiveEngine 不直接依赖未来平台实现", "当前启用 Bilibili adapter / client", "后续新增平台只扩展 adapter 与平台注册表"],
  },
  {
    title: "业务逻辑",
    items: ["消息处理器解析弹幕、礼物、进场", "事件分发器统一路由 LiveEvent", "行为调度器：定时打卡、随机氛围、条件触发"],
  },
  {
    title: "AI 集成",
    items: ["当前浏览器模式安全降级，不暴露模型 API 密钥", "多轮上下文（最近 20 条）由 RoomContext 管理", "后续通过独立后端代理接入模型与鉴权"],
  },
  {
    title: "网络通信",
    items: ["Bilibili 直播二进制协议（认证 / 心跳 / 通知）", "25 秒 Ping，监听人气 Pong", "指数退避 + 抖动重连"],
  },
  {
    title: "基础设施",
    items: ["配置外置到 localStorage", "带层级的环形日志", "建议队列代替真实发送适配器"],
  },
];

function ArchitecturePage() {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="inline-flex h-10 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          返回控制台
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">分层架构</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
          LiveCore 保持现有控制台体验，把平台连接能力收敛到 adapter 边界。当前先完成 Bilibili 落地；未来接入其他平台时，
          UI、事件模型和业务引擎无需跟着平台协议变化。
        </p>
        <ol className="mt-8 space-y-3">
          {LAYERS.map((layer, i) => (
            <li key={layer.title} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs tabular-nums text-subtle">0{i + 1}</span>
                <h2 className="text-base font-medium">{layer.title}</h2>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {layer.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <section className="mt-8 rounded-xl border border-border bg-surface p-5 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-medium text-fg">合规边界</h2>
          <p className="mt-2">
            接收公开弹幕流是学习协议的正当路径。自动发送、伪造在线、绕过风控不属于本项目范围。若你自行实现出站适配器，请遵守
            Bilibili 用户协议，并承担账号风险。
          </p>
        </section>
      </div>
    </div>
  );
}
