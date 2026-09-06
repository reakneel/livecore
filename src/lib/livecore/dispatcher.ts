import type { EventKind, LiveEvent } from "./types";

type Handler = (ev: LiveEvent) => void;

export class EventDispatcher {
  private handlers = new Map<EventKind | "*", Set<Handler>>();

  on(kind: EventKind | "*", fn: Handler): () => void {
    const set = this.handlers.get(kind) ?? new Set();
    set.add(fn);
    this.handlers.set(kind, set);
    return () => set.delete(fn);
  }

  emit(ev: LiveEvent) {
    this.handlers.get(ev.kind)?.forEach((fn) => fn(ev));
    this.handlers.get("*")?.forEach((fn) => fn(ev));
  }
}
