import { Gift, MessageSquare, Radio, Sparkles, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EventKind, LiveEvent, MonitorEvent, Sentiment } from "@/lib/livecore/types";
import { cn, formatClock } from "@/lib/utils";

const KIND_LABEL: Record<EventKind, string> = {
  danmaku: "弹幕",
  gift: "礼物",
  enter: "进场",
  follow: "关注",
  share: "分享",
  guard: "上舰",
  superchat: "醒目",
  like: "点赞",
  system: "系统",
  popularity: "人气",
};

function KindIcon({ kind }: { kind: EventKind }) {
  const cls = "size-3.5";
  if (kind === "gift" || kind === "guard" || kind === "superchat") return <Gift className={cls} />;
  if (kind === "enter" || kind === "follow" || kind === "share") return <UserRound className={cls} />;
  if (kind === "system") return <Radio className={cls} />;
  if (kind === "like") return <Sparkles className={cls} />;
  return <MessageSquare className={cls} />;
}

function sentimentClass(s?: Sentiment) {
  if (s === "positive") return "text-ok";
  if (s === "negative") return "text-danger";
  return "text-subtle";
}

function monitorOf(event: LiveEvent): MonitorEvent {
  if (event.monitor) return event.monitor;

  // Compatibility fallback for demo/legacy events. The UI consumes the same
  // normalized shape regardless of which platform produced the event.
  return {
    kind: event.kind,
    kind_label: KIND_LABEL[event.kind],
    user: event.user ?? null,
    gift: event.gift
      ? { name: event.gift.name, num: event.gift.num, unit_price: event.gift.price }
      : null,
    amount:
      event.gift
        ? { value: event.gift.price * Math.max(event.gift.num, 1), currency: "gold_coin" }
        : null,
    text: event.text ?? "",
    meta_summary: "",
    raw_cmd: event.rawCmd ?? "",
    popularity: event.popularity ?? 0,
  };
}

function formatAmount(value: number, currency: string) {
  if (currency === "CNY") return `¥${(value / 100).toFixed(2)}`;
  if (currency === "gold_coin") return `${value.toLocaleString()} 金瓜子`;
  return `${value.toLocaleString()} ${currency}`;
}

function EventDetails({ event }: { event: LiveEvent }) {
  const monitor = monitorOf(event);
  const hasUser = Boolean(monitor.user?.name);
  const hasGift = Boolean(monitor.gift?.name);
  const hasAmount = monitor.amount !== null;
  const hasMeta = Boolean(monitor.meta_summary);

  return (
    <span className="mt-1 block space-y-1 text-xs text-muted">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{monitor.kind_label}</span>
        {hasUser ? <span>· {monitor.user!.name}</span> : null}
        {hasGift ? (
          <span>
            · {monitor.gift!.name} × {monitor.gift!.num}
          </span>
        ) : null}
        {hasAmount ? <span>· {formatAmount(monitor.amount!.value, monitor.amount!.currency)}</span> : null}
      </span>
      {hasMeta ? (
        <span className="block truncate font-mono text-[10px] text-subtle" title={monitor.meta_summary}>
          meta: {monitor.meta_summary}
        </span>
      ) : null}
    </span>
  );
}

export function EventFeed({
  events,
  onAsk,
}: {
  events: LiveEvent[];
  onAsk: (id: string) => void;
}) {
  const visible = [...events].reverse();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">事件流</h2>
          <p className="text-xs text-muted">统一事件 / 用户 / 礼物 / 金额 / meta · 平台协议由 Adapter 隔离</p>
        </div>
        <Badge>{events.length} 条</Badge>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        {visible.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted">
            尚未收到事件。启动演示厅或连接房间后，消息会在这里滚动。
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((ev) => {
              const monitor = monitorOf(ev);
              return (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => onAsk(ev.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-[var(--motion-quick)] hover:bg-surface-2"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-2 text-muted",
                        ev.kind === "superchat" && "border-accent/40 text-accent",
                        ev.kind === "gift" && "text-warn",
                      )}
                    >
                      <KindIcon kind={ev.kind} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-xs font-medium text-fg">
                          {monitor.user?.name ?? "系统"}
                        </span>
                        <span className="text-[10px] tracking-wide text-subtle uppercase">
                          {monitor.kind_label}
                        </span>
                        {ev.sentiment && ev.kind === "danmaku" ? (
                          <span className={cn("text-[10px]", sentimentClass(ev.sentiment))}>
                            {ev.sentiment === "positive"
                              ? "正向"
                              : ev.sentiment === "negative"
                                ? "负向"
                                : "中性"}
                          </span>
                        ) : null}
                        <span className="ml-auto font-mono text-[10px] tabular-nums text-subtle">
                          {formatClock(ev.ts)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-fg/90">{monitor.text}</span>
                      <EventDetails event={ev} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}
