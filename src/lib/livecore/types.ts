export type EventKind =
  | "danmaku"
  | "gift"
  | "enter"
  | "follow"
  | "share"
  | "guard"
  | "superchat"
  | "like"
  | "system"
  | "popularity";

export type Sentiment = "positive" | "neutral" | "negative";

export type LayerId = "infra" | "net" | "msg" | "ai" | "behavior";

export type LayerHealth = "idle" | "ok" | "warn" | "error";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "authenticating"
  | "live"
  | "reconnecting"
  | "offline"
  | "error";

export type SourceMode = "demo" | "bilibili";

export type SuggestionSource = "rule" | "ai" | "schedule" | "random";

export type SuggestionStatus = "queued" | "accepted" | "dismissed" | "expired";

export interface LiveUser {
  uid: number;
  name: string;
  guard?: number;
  medal?: string;
}

export interface GiftInfo {
  name: string;
  num: number;
  price: number;
}

/** Stable, platform-neutral presentation contract for monitoring UIs. */
export interface MonitorAmount {
  value: number;
  currency: "gold_coin" | "CNY" | string;
}

export interface MonitorEvent {
  kind: EventKind;
  kind_label: string;
  user: LiveUser | null;
  gift: { name: string; num: number; unit_price: number } | null;
  amount: MonitorAmount | null;
  text: string;
  meta_summary: string;
  raw_cmd: string;
  popularity: number;
}

/**
 * Transport envelope shared by every platform adapter.
 * The event payload stays normalized so the console never needs platform
 * protocol knowledge. New platforms only need to produce this contract.
 */
export interface PlatformEventEnvelope {
  platform: string;
  event: LiveEvent;
}

export interface LiveEvent {
  id: string;
  ts: number;
  kind: EventKind;
  roomId: number;
  user?: LiveUser;
  text?: string;
  gift?: GiftInfo;
  sentiment?: Sentiment;
  rawCmd?: string;
  popularity?: number;
  meta?: Record<string, unknown>;
  monitor?: MonitorEvent;
}

export interface RoomInfo {
  roomId: number;
  shortId?: number;
  title: string;
  uname: string;
  face?: string;
  area: string;
  online: number;
  liveStatus: number;
}

export interface DanmuEndpoint {
  host: string;
  wssPort: number;
  token: string;
}

export interface Suggestion {
  id: string;
  ts: number;
  text: string;
  reason: string;
  source: SuggestionSource;
  inReplyTo?: string;
  status: SuggestionStatus;
}

export interface LogEntry {
  id: string;
  ts: number;
  level: "debug" | "info" | "warn" | "error";
  layer: LayerId;
  message: string;
}

export interface EngineConfig {
  personaId: string;
  personaPrompt: string;
  replyMaxLen: number;
  coldStartSec: number;
  checkInMin: number;
  minGapSec: number;
  activityBoost: boolean;
  autoSuggest: boolean;
  aiAssist: boolean;
  jitterMs: number;
}

export interface Persona {
  id: string;
  name: string;
  blurb: string;
  prompt: string;
}

export interface EngineStats {
  danmaku: number;
  gifts: number;
  enters: number;
  popularity: number;
  reconnects: number;
  heartbeats: number;
  suggestions: number;
  accepted: number;
}

export const PERSONAS: Persona[] = [
  {
    id: "warm",
    name: "热心观众",
    blurb: "鼓励主播，说话活泼但不刷屏",
    prompt:
      "你是 B 站直播间里的热心观众。说话短、口语化、真诚。喜欢鼓励主播，偶尔接梗，不阿谀、不引战、不发链接。回复不超过 24 个汉字。",
  },
  {
    id: "tech",
    name: "冷静技术宅",
    blurb: "简短中肯，少情绪词",
    prompt:
      "你是直播间里话不多的技术观众。回复极简、中性、偶尔点评操作或声音。不整活、不刷梗。回复不超过 18 个汉字。",
  },
  {
    id: "rhythm",
    name: "节奏组",
    blurb: "跟着气氛喊，但有节制",
    prompt:
      "你是直播间节奏组的一员。只在气氛高时接一句短呼号或附和，避免重复。不攻击任何人。回复不超过 12 个汉字。",
  },
];

export const DEFAULT_CONFIG: EngineConfig = {
  personaId: "warm",
  personaPrompt: PERSONAS[0]!.prompt,
  replyMaxLen: 24,
  coldStartSec: 12,
  checkInMin: 5,
  minGapSec: 12,
  activityBoost: true,
  autoSuggest: true,
  aiAssist: false,
  jitterMs: 1200,
};

export const DEMO_ROOM: RoomInfo = {
  roomId: 0,
  title: "音律回廊 · 深夜歌回",
  uname: "晚风音",
  area: "虚拟主播",
  online: 12840,
  liveStatus: 1,
};
