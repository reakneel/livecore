import { useSyncExternalStore } from "react";
import { LiveEngine, type EngineSnapshot } from "./engine";
import { DEFAULT_CONFIG } from "./types";

let engine: LiveEngine | null = null;

function loadConfig() {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem("livecore-config");
    if (!raw) return DEFAULT_CONFIG;
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<typeof DEFAULT_CONFIG>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function getEngine(): LiveEngine {
  if (!engine) {
    engine = new LiveEngine();
    engine.setConfig(loadConfig());
  }
  return engine;
}

export function persistConfig() {
  if (typeof window === "undefined") return;
  localStorage.setItem("livecore-config", JSON.stringify(getEngine().snapshot().config));
}

const EMPTY: EngineSnapshot = {
  mode: "demo",
  connection: "idle",
  room: null,
  events: [],
  suggestions: [],
  logs: [],
  stats: {
    danmaku: 0,
    gifts: 0,
    enters: 0,
    popularity: 0,
    reconnects: 0,
    heartbeats: 0,
    suggestions: 0,
    accepted: 0,
  },
  layers: { infra: "idle", net: "idle", msg: "idle", ai: "idle", behavior: "idle" },
  config: DEFAULT_CONFIG,
  coldRemaining: DEFAULT_CONFIG.coldStartSec,
  error: null,
};

export function useLiveCore(): EngineSnapshot {
  return useSyncExternalStore(
    (onStoreChange) => getEngine().subscribe(onStoreChange),
    () => getEngine().snapshot(),
    () => EMPTY,
  );
}
