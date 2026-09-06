import { Check, Sparkles, Trash2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Suggestion, SuggestionSource } from "@/lib/livecore/types";
import { cn, formatClock } from "@/lib/utils";

const SOURCE: Record<SuggestionSource, string> = {
  rule: "规则",
  ai: "AI",
  schedule: "定时",
  random: "随机",
};

export function SuggestionQueue({
  items,
  onAccept,
  onDismiss,
  onAi,
  aiBusy,
}: {
  items: Suggestion[];
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  onAi: () => void;
  aiBusy?: boolean;
}) {
  const queued = items.filter((s) => s.status === "queued").slice().reverse();
  const history = items.filter((s) => s.status !== "queued").slice(-8).reverse();

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-medium">建议队列</h2>
          <p className="text-xs text-muted">默认只生成草稿，不会发到 B 站</p>
        </div>
        <Button size="sm" variant="accent" onClick={onAi} disabled={aiBusy}>
          <Wand2 />
          起草一条
        </Button>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-3 p-3">
          {queued.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
              冷启动结束后，规则引擎与调度器会把草稿放在这里。
            </div>
          ) : (
            queued.map((s) => (
              <article
                key={s.id}
                className="rise-in rounded-lg border border-border bg-surface-2 p-3"
              >
                <div className="flex items-center gap-2">
                  <Badge variant={s.source === "ai" ? "live" : "default"}>{SOURCE[s.source]}</Badge>
                  <span className="text-[11px] text-subtle">{s.reason}</span>
                  <span className="ml-auto font-mono text-[10px] tabular-nums text-subtle">
                    {formatClock(s.ts)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-snug">{s.text}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => onAccept(s.id)} className="flex-1">
                    <Check />
                    采纳到日志
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onDismiss(s.id)}>
                    <Trash2 />
                    忽略
                  </Button>
                </div>
              </article>
            ))
          )}

          {history.length > 0 ? (
            <div className="pt-2">
              <p className="mb-2 px-1 text-[11px] tracking-wide text-subtle">最近处理</p>
              <ul className="space-y-1.5">
                {history.map((s) => (
                  <li
                    key={s.id}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs",
                      s.status === "accepted" ? "text-ok" : "text-subtle",
                    )}
                  >
                    {s.status === "accepted" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    <span className="truncate">{s.text}</span>
                    <span className="ml-auto shrink-0">
                      {s.status === "accepted" ? "已采纳" : s.status === "dismissed" ? "已忽略" : "过期"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </section>
  );
}
