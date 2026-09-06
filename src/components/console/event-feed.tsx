import { Gift, MessageSquare, Radio, Sparkles, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { EventKind, LiveEvent, Sentiment } from "@/lib/livecore/types";
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
          <p className="text-xs text-muted">弹幕 / 礼物 / 进场 · 点击一条可让智核起草回复</p>
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
            {visible.map((ev) => (
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
                        {ev.user?.name ?? "系统"}
                      </span>
                      <span className="text-[10px] tracking-wide text-subtle uppercase">
                        {KIND_LABEL[ev.kind]}
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
                    <span className="mt-0.5 block text-sm leading-snug text-fg/90">{ev.text}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}
