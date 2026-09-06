import { PERSONAS } from "@/lib/livecore/types";
import type { EngineConfig, EngineStats, LayerHealth, LayerId, LogEntry } from "@/lib/livecore/types";
import { persistConfig } from "@/lib/livecore/store";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn, formatClock } from "@/lib/utils";

const LAYER_META: { id: LayerId; name: string; desc: string }[] = [
  { id: "infra", name: "基础设施", desc: "配置 · 日志 · 持久化" },
  { id: "net", name: "网络通信", desc: "WebSocket · 心跳 · 重连" },
  { id: "msg", name: "消息处理", desc: "解析 · 分发 · 上下文" },
  { id: "ai", name: "AI 集成", desc: "人格 · 情感 · 生成" },
  { id: "behavior", name: "行为调度", desc: "冷启动 · 定时 · 抖动" },
];

function healthBadge(h: LayerHealth) {
  if (h === "ok") return <Badge variant="ok">正常</Badge>;
  if (h === "warn") return <Badge variant="warn">工作中</Badge>;
  if (h === "error") return <Badge variant="danger">异常</Badge>;
  return <Badge>待机</Badge>;
}

export function LayerStack({ layers }: { layers: Record<LayerId, LayerHealth> }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-medium">分层架构</h2>
      <p className="mt-1 text-xs text-muted">自下而上：连接保活，再叠加理解与建议。</p>
      <ol className="mt-3 space-y-2">
        {[...LAYER_META].reverse().map((layer, i) => (
          <li
            key={layer.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2"
            style={{ marginLeft: `${i * 4}px` }}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium">{layer.name}</span>
              <span className="block text-[11px] text-subtle">{layer.desc}</span>
            </span>
            {healthBadge(layers[layer.id])}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StatsStrip({ stats }: { stats: EngineStats }) {
  const cells = [
    ["弹幕", stats.danmaku],
    ["礼物", stats.gifts],
    ["进场", stats.enters],
    ["人气", stats.popularity],
    ["建议", stats.suggestions],
    ["采纳", stats.accepted],
  ] as const;
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {cells.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-border bg-surface px-3 py-2">
          <div className="text-[11px] text-muted">{label}</div>
          <div className="font-mono text-lg font-medium tabular-nums">{value.toLocaleString("zh-CN")}</div>
        </div>
      ))}
    </div>
  );
}

export function ConfigPanel({
  config,
  coldRemaining,
  onChange,
}: {
  config: EngineConfig;
  coldRemaining: number;
  onChange: (patch: Partial<EngineConfig>) => void;
}) {
  const update = (patch: Partial<EngineConfig>) => {
    onChange(patch);
    queueMicrotask(persistConfig);
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-medium">行为与人格</h2>
      <p className="mt-1 text-xs text-muted">
        冷启动剩余{" "}
        <span className="font-mono tabular-nums text-fg">{Math.ceil(coldRemaining)}s</span>
        ，之后才开始出建议。
      </p>

      <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => update({ personaId: p.id, personaPrompt: p.prompt })}
            className={cn(
              "rounded-md px-2 py-2 text-xs leading-tight transition-colors",
              config.personaId === p.id ? "bg-surface-3 text-fg" : "text-muted hover:text-fg",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-subtle">
        {PERSONAS.find((p) => p.id === config.personaId)?.blurb}
      </p>

      <div className="mt-4 space-y-4">
        <Toggle
          label="自动建议"
          hint="规则引擎 + 调度器写入队列"
          checked={config.autoSuggest}
          onCheckedChange={(v) => update({ autoSuggest: v })}
        />
        <Toggle
          label="按活跃度调频"
          hint="热闹时多建议，冷清时少说话"
          checked={config.activityBoost}
          onCheckedChange={(v) => update({ activityBoost: v })}
        />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>回复上限 {config.replyMaxLen} 字</Label>
          </div>
          <Slider
            min={8}
            max={36}
            step={1}
            value={[config.replyMaxLen]}
            onValueChange={([v]) => v && update({ replyMaxLen: v })}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>建议最小间隔 {config.minGapSec}s</Label>
          </div>
          <Slider
            min={8}
            max={60}
            step={1}
            value={[config.minGapSec]}
            onValueChange={([v]) => v && update({ minGapSec: v })}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>冷启动 {config.coldStartSec}s</Label>
          </div>
          <Slider
            min={8}
            max={120}
            step={1}
            value={[config.coldStartSec]}
            onValueChange={([v]) => v && update({ coldStartSec: v })}
          />
        </div>
      </div>
    </section>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[11px] text-subtle">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function LogPanel({ logs }: { logs: LogEntry[] }) {
  const rows = [...logs].reverse().slice(0, 40);
  return (
    <section className="flex min-h-48 flex-col rounded-xl border border-border bg-surface">
      <header className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">运行日志</h2>
      </header>
      <ScrollArea className="h-48">
        <ul className="px-3 py-2 font-mono text-[11px] leading-relaxed">
          {rows.length === 0 ? (
            <li className="px-1 py-6 text-center text-subtle">等待连接…</li>
          ) : (
            rows.map((l) => (
              <li key={l.id} className="flex gap-2 py-0.5">
                <span className="shrink-0 tabular-nums text-subtle">{formatClock(l.ts)}</span>
                <span
                  className={cn(
                    "shrink-0 uppercase",
                    l.level === "error" && "text-danger",
                    l.level === "warn" && "text-warn",
                    l.level === "info" && "text-muted",
                    l.level === "debug" && "text-subtle",
                  )}
                >
                  {l.layer}
                </span>
                <span className="min-w-0 text-fg/80">{l.message}</span>
              </li>
            ))
          )}
        </ul>
      </ScrollArea>
    </section>
  );
}
