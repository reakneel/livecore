import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, PlugZap, Square, Tv } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventFeed } from "@/components/console/event-feed";
import { SuggestionQueue } from "@/components/console/suggestions";
import { ConfigPanel, LayerStack, LogPanel, StatsStrip } from "@/components/console/sidebar";
import { getEngine, useLiveCore } from "@/lib/livecore/store";
import type { ConnectionState } from "@/lib/livecore/types";
import { formatOnline } from "@/lib/utils";

function stateMeta(s: ConnectionState): { label: string; variant: "default" | "live" | "ok" | "warn" | "danger" } {
  switch (s) {
    case "live":
      return { label: "已接入", variant: "live" };
    case "connecting":
    case "authenticating":
    case "reconnecting":
      return { label: s === "reconnecting" ? "重连中" : "连接中", variant: "warn" };
    case "error":
      return { label: "失败", variant: "danger" };
    case "offline":
      return { label: "已断开", variant: "default" };
    default:
      return { label: "待机", variant: "default" };
  }
}

export function ConsoleApp() {
  const snap = useLiveCore();
  const [roomInput, setRoomInput] = useState("21452505");
  const [aiBusy, setAiBusy] = useState(false);
  const live = snap.connection === "live";

  useEffect(() => {
    if (snap.connection === "idle") {
      void getEngine().startDemo();
    }
  }, [snap.connection]);

  const askAi = async (eventId?: string) => {
    setAiBusy(true);
    try {
      await getEngine().requestAi(eventId);
    } finally {
      setAiBusy(false);
    }
  };

  const meta = stateMeta(snap.connection);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(80%_50%_at_50%_-10%,color-mix(in_oklab,var(--color-accent)_14%,transparent),transparent)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex flex-wrap items-center gap-3 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-9 items-center justify-center rounded-lg border border-border bg-surface">
              <span className="size-2 rounded-full bg-accent pulse-dot" />
              <span className="absolute size-5 rounded-full border border-accent/50" />
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-lg font-semibold tracking-tight">智核</h1>
                <span className="font-mono text-xs text-muted">LiveCore</span>
              </div>
              <p className="text-xs text-muted">B 站直播间智能互动控制台</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge variant={meta.variant} className="gap-1.5">
              {live ? <span className="size-1.5 rounded-full bg-accent pulse-dot" /> : null}
              {meta.label}
            </Badge>
            <Link
              to="/architecture"
              className="inline-flex h-10 items-center rounded-md px-3 text-xs text-muted hover:text-fg"
            >
              架构说明
            </Link>
          </div>
        </header>

        <div className="mb-4 rounded-xl border border-border bg-surface p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted">当前房间</div>
              <div className="truncate text-sm font-medium">
                {snap.room ? (
                  <>
                    {snap.room.title}
                    <span className="ml-2 font-normal text-muted">
                      {snap.room.uname} · {snap.room.area} · {formatOnline(snap.room.online)} 人气
                    </span>
                  </>
                ) : (
                  "未连接"
                )}
              </div>
              {snap.error ? <p className="mt-1 text-xs text-danger">{snap.error}</p> : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                inputMode="numeric"
                placeholder="B 站房间号"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.replace(/[^\d]/g, ""))}
                className="sm:w-40"
                aria-label="房间号"
              />
              <Button
                variant="secondary"
                onClick={() => void getEngine().startBilibili(Number(roomInput) || 0)}
                disabled={!roomInput}
              >
                <PlugZap />
                连接真实房间
              </Button>
              <Button variant="secondary" onClick={() => void getEngine().startDemo()}>
                <Tv />
                演示厅
              </Button>
              <Button variant="ghost" onClick={() => getEngine().stop()}>
                <Square />
                停止
              </Button>
            </div>
          </div>
        </div>

        <StatsStrip stats={snap.stats} />

        <div className="mt-4 hidden gap-4 lg:grid lg:grid-cols-12 lg:items-start">
          <div className="flex h-feed flex-col lg:col-span-5">
            <EventFeed events={snap.events} onAsk={(id) => void askAi(id)} />
          </div>
          <div className="flex h-feed flex-col lg:col-span-4">
            <SuggestionQueue
              items={snap.suggestions}
              onAccept={(id) => getEngine().accept(id)}
              onDismiss={(id) => getEngine().dismiss(id)}
              onAi={() => void askAi()}
              aiBusy={aiBusy}
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-3">
            <LayerStack layers={snap.layers} />
            <ConfigPanel
              config={snap.config}
              coldRemaining={snap.coldRemaining}
              onChange={(p) => getEngine().setConfig(p)}
            />
          </div>
        </div>

        <div className="mt-4 lg:hidden">
          <Tabs defaultValue="feed">
            <TabsList className="w-full">
              <TabsTrigger value="feed">事件</TabsTrigger>
              <TabsTrigger value="queue">建议</TabsTrigger>
              <TabsTrigger value="sys">系统</TabsTrigger>
            </TabsList>
            <TabsContent value="feed" className="flex h-96 flex-col">
              <EventFeed events={snap.events} onAsk={(id) => void askAi(id)} />
            </TabsContent>
            <TabsContent value="queue" className="flex h-96 flex-col">
              <SuggestionQueue
                items={snap.suggestions}
                onAccept={(id) => getEngine().accept(id)}
                onDismiss={(id) => getEngine().dismiss(id)}
                onAi={() => void askAi()}
                aiBusy={aiBusy}
              />
            </TabsContent>
            <TabsContent value="sys" className="space-y-4">
              <LayerStack layers={snap.layers} />
              <ConfigPanel
                config={snap.config}
                coldRemaining={snap.coldRemaining}
                onChange={(p) => getEngine().setConfig(p)}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-4">
          <LogPanel logs={snap.logs} />
        </div>

        <footer className="mt-4 flex flex-wrap items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          <Activity className="mt-0.5 size-3.5 shrink-0 text-accent" />
          <p>
            本控制台实现完整的分层框架（连接保活、事件分发、人格引擎、行为调度），默认停在「建议」这一层：
            不会使用账号 Cookie 向 B 站发送弹幕、点赞或分享。请在平台规则允许的范围内做技术实验，账号风险自负。
          </p>
        </footer>
      </div>
    </div>
  );
}
