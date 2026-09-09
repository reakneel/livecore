import type { DanmuEndpoint, LiveEvent, PlatformEventEnvelope, RoomInfo } from "./types";

export interface RoomHealth {
  room_id: number;
  platform?: string;
  state: "connecting" | "authenticating" | "live" | "reconnecting" | "offline" | "error";
  reconnects: number;
  last_live_at: number;
  last_error: string;
  live_for_sec: number;
}

export type RoomStreamHandlers = {
  onEvent: (event: LiveEvent, platform: string) => void;
  onState: (state: RoomHealth["state"]) => void;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || `LiveCore API ${response.status}`);
  return payload;
}

export async function fetchBiliRoom(roomId: number): Promise<{ ok: true; room: RoomInfo } | { ok: false; error: string }> {
  const result = await startBiliRoom(roomId);
  if (!result.ok) return result;
  return { ok: true, room: roomFromHealth(result.health) };
}

export async function startBiliRoom(roomId: number, requireToken = false): Promise<{ ok: true; health: RoomHealth } | { ok: false; error: string }> {
  try {
    const health = await api<RoomHealth>(`/api/rooms/${roomId}/start`, {
      method: "POST",
      body: JSON.stringify({ require_token: requireToken }),
    });
    return { ok: true, health };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Bilibili 房间启动失败" };
  }
}

export async function fetchDanmuEndpoint(roomId: number): Promise<{ ok: true; endpoint: DanmuEndpoint } | { ok: false; error: string }> {
  try {
    await api<RoomHealth>(`/api/rooms/${roomId}/health`);
    return { ok: true, endpoint: { host: "sdk-adapter", wssPort: 0, token: "" } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "LiveCore 房间不存在" };
  }
}

export async function stopBiliRoom(roomId: number): Promise<void> {
  await api(`/api/rooms/${roomId}`, { method: "DELETE" });
}

export function subscribeBiliRoom(roomId: number, handlers: RoomStreamHandlers): () => void {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${window.location.host}/api/rooms/${roomId}/events`);
  socket.onmessage = (message) => {
    try {
      const payload = JSON.parse(message.data) as
        | { type: "state"; platform?: string; state: RoomHealth["state"] }
        | { type: "event"; platform?: string; event: LiveEvent };
      if (payload.type === "state") handlers.onState(payload.state);
      if (payload.type === "event") {
        // Normalize the transport envelope here so platform clients receive
        // only a stable event plus platform identity, never wire protocol data.
        const envelope: PlatformEventEnvelope = {
          platform: payload.platform ?? "unknown",
          event: payload.event,
        };
        handlers.onEvent(envelope.event, envelope.platform);
      }
    } catch {
      // Ignore malformed adapter messages; the SDK owns protocol parsing.
    }
  };
  return () => socket.close();
}

function roomFromHealth(health: RoomHealth): RoomInfo {
  return {
    roomId: health.room_id,
    title: `B 站直播间 ${health.room_id}`,
    uname: "LiveCore",
    area: "Bilibili",
    online: 0,
    liveStatus: health.state === "live" || health.state === "authenticating" || health.state === "connecting" || health.state === "reconnecting" ? 1 : 0,
  };
}

export async function generateAiReply(): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  return { ok: false, error: "AI 代理尚未接入；LiveCore 前端不会暴露模型 API Key" };
}
