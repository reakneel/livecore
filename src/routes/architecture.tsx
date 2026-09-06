import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/architecture")({ component: ArchitecturePage });

const LAYERS = [
  {
    title: "应用入口",
    items: ["读取人格、间隔、冷启动配置", "启动连接 / 消息 / AI / 行为模块", "演示厅与真实房间两种源"],
  },
  {
    title: "业务逻辑",
    items: ["消息处理器解析弹幕、礼物、进场", "事件分发器路由到 on_danmu / on_gift / on_enter", "行为调度器：定时打卡、随机氛围、条件触发"],
  },
  {
    title: "AI 集成",
    items: ["可切换：xAI Grok / 规则引擎降级", "多轮上下文（最近 20 条）", "情感标签进入 prompt，负向时改为安抚"],
  },
  {
    title: "网络通信",
    items: ["B 站直播二进制协议（认证 / 心跳 / zlib 通知）", "25 秒 Ping，监听人气 Pong", "指数退避 + 抖动重连"],
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
          智核按「连接 → 理解 → 建议」叠加能力。每一层可独立替换：换平台只要换网络适配器，换模型只要换 AI
          引擎，出站动作由适配器决定——当前默认适配器是模拟器，不会把弹幕打到直播间。
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
            B 站用户协议，并承担账号风险。
          </p>
        </section>
      </div>
    </div>
  );
}
