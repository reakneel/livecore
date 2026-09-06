import type { DanmuEndpoint, RoomInfo } from "./types";

const REQUEST_TIMEOUT_MS = 10_000;

async function biliGet(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Bilibili HTTP ${res.status}`);
    return res.json();
  } finally { clearTimeout(timer); }
}

export async function fetchBiliRoom(roomId: number): Promise<{ ok: true; room: RoomInfo } | { ok: false; error: string }> {
  try {
    const json = (await biliGet(`https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${roomId}`)) as { code?: number; message?: string; data?: { room_id?: number; short_id?: number; title?: string; uid?: number; online?: number; live_status?: number; area_name?: string; uname?: string } };
    if (json.code !== 0 || !json.data?.room_id) return { ok: false, error: json.message || "房间不存在" };
    return { ok: true, room: { roomId: json.data.room_id, shortId: json.data.short_id, title: json.data.title || "未命名直播间", uname: json.data.uname || `UID ${json.data.uid ?? "?"}`, area: json.data.area_name || "直播", online: json.data.online ?? 0, liveStatus: json.data.live_status ?? 0 } };
  } catch (err) { return { ok: false, error: err instanceof Error ? err.message : "房间信息请求失败" }; }
}

export async function fetchDanmuEndpoint(roomId: number): Promise<{ ok: true; endpoint: DanmuEndpoint } | { ok: false; error: string }> {
  try {
    const json = (await biliGet(`https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=${roomId}&type=0`)) as { code?: number; message?: string; data?: { token?: string; host_list?: { host: string; wss_port: number }[] } };
    if (json.code !== 0) return { ok: false, error: json.message || `弹幕服务器请求失败（code=${json.code ?? "?"}）` };
    const token = json.data?.token?.trim();
    const host = json.data?.host_list?.find((item) => item.host?.trim());
    if (!token || !host) return { ok: false, error: "B 站未返回有效的弹幕连接信息" };
    return { ok: true, endpoint: { host: host.host, wssPort: host.wss_port || 443, token } };
  } catch (err) { return { ok: false, error: err instanceof Error ? err.message : "弹幕服务器请求失败" }; }
}

export async function generateAiReply(): Promise<{ ok: false; error: string }> {
  return { ok: false, error: "纯 Vite 浏览器模式暂未启用服务端 AI 代理" };
}
