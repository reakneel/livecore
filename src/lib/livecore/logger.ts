import { uid } from "@/lib/utils";
import type { LayerId, LogEntry } from "./types";

const MAX = 200;

export class RingLogger {
  private items: LogEntry[] = [];
  private listeners = new Set<(entries: LogEntry[]) => void>();

  on(fn: (entries: LogEntry[]) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  push(level: LogEntry["level"], layer: LayerId, message: string): LogEntry {
    const entry: LogEntry = { id: uid("log"), ts: Date.now(), level, layer, message };
    this.items = [...this.items.slice(-(MAX - 1)), entry];
    for (const fn of this.listeners) fn(this.items);
    return entry;
  }

  snapshot(): LogEntry[] {
    return this.items;
  }

  clear() {
    this.items = [];
    for (const fn of this.listeners) fn(this.items);
  }
}
