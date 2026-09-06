import type { LiveEvent, Suggestion } from "./types";

const MAX_EVENTS = 20;
const MAX_REPLIES = 24;

export class RoomContext {
  private recent: LiveEvent[] = [];
  private replies: Suggestion[] = [];
  private lastTextAt = new Map<string, number>();

  reset() {
    this.recent = [];
    this.replies = [];
    this.lastTextAt.clear();
  }

  pushEvent(ev: LiveEvent) {
    this.recent = [...this.recent.slice(-(MAX_EVENTS - 1)), ev];
  }

  pushReply(s: Suggestion) {
    this.replies = [...this.replies.slice(-(MAX_REPLIES - 1)), s];
    this.lastTextAt.set(s.text, s.ts);
  }

  recentEvents(): LiveEvent[] {
    return this.recent;
  }

  recentDanmaku(limit = 8): LiveEvent[] {
    return this.recent.filter((e) => e.kind === "danmaku").slice(-limit);
  }

  alreadySaid(text: string, withinMs = 90_000): boolean {
    const last = this.lastTextAt.get(text);
    return last !== undefined && Date.now() - last < withinMs;
  }

  seenSimilar(text: string, withinMs = 8_000): boolean {
    const key = text.trim();
    for (const ev of this.recent) {
      if (ev.kind !== "danmaku") continue;
      if (ev.text?.trim() === key && Date.now() - ev.ts < withinMs) return true;
    }
    return false;
  }

  activityPerMinute(): number {
    const since = Date.now() - 60_000;
    return this.recent.filter((e) => e.ts >= since && e.kind !== "popularity").length;
  }

  transcript(): string {
    return this.recent
      .filter((e) => e.kind === "danmaku" || e.kind === "gift" || e.kind === "superchat")
      .slice(-10)
      .map((e) => {
        const who = e.user?.name ?? "系统";
        return `${who}: ${e.text ?? ""}`;
      })
      .join("\n");
  }
}
