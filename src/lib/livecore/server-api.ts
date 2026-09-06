import { createServerFn } from "@tanstack/react-start";
import type { DanmuEndpoint, RoomInfo } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function biliGet(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://live.bilibili.com/",
      Origin: "https://live.bilibili.com",
    },
  });
  if (!res.ok) throw new Error(`Bilibili HTTP ${res.status}`);
  return res.json();
}

export const fetchBiliRoom = createServerFn({ method: "POST" })
  .validator((input: { roomId: number }) => input)
  .handler(async ({ data }): Promise<{ ok: true; room: RoomInfo } | { ok: false; error: string }> => {
    try {
      const json = (await biliGet(
        `https://api.live.bilibili.com/room/v1/Room/get_info?room_id=${data.roomId}`,
      )) as {
        code?: number;
        message?: string;
        data?: {
          room_id?: number;
          short_id?: number;
          title?: string;
          uid?: number;
          online?: number;
          live_status?: number;
          area_name?: string;
          uname?: string;
        };
      };
      if (json.code !== 0 || !json.data?.room_id) {
        return { ok: false, error: json.message || "房间不存在" };
      }
      let uname = json.data.uname || "";
      if (!uname && json.data.uid) {
        try {
          const info = (await biliGet(
            `https://api.live.bilibili.com/live_user/v1/Master/info?uid=${json.data.uid}`,
          )) as { data?: { info?: { uname?: string } } };
          uname = info.data?.info?.uname || "";
        } catch {
          /* ignore */
        }
      }
      return {
        ok: true,
        room: {
          roomId: json.data.room_id,
          shortId: json.data.short_id,
          title: json.data.title || "未命名直播间",
          uname: uname || `UID ${json.data.uid ?? "?"}`,
          area: json.data.area_name || "直播",
          online: json.data.online ?? 0,
          liveStatus: json.data.live_status ?? 0,
        },
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "房间信息请求失败" };
    }
  });

export const fetchDanmuEndpoint = createServerFn({ method: "POST" })
  .validator((input: { roomId: number }) => input)
  .handler(
    async ({ data }): Promise<{ ok: true; endpoint: DanmuEndpoint } | { ok: false; error: string }> => {
      try {
        const json = (await biliGet(
          `https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=${data.roomId}&type=0`,
        )) as {
          code?: number;
          message?: string;
          data?: {
            token?: string;
            host_list?: { host: string; wss_port: number }[];
          };
        };
        const host = json.data?.host_list?.[0];
        if (json.code !== 0 || !host) {
          return {
            ok: true,
            endpoint: {
              host: "broadcastlv.chat.bilibili.com",
              wssPort: 443,
              token: json.data?.token ?? "",
            },
          };
        }
        return {
          ok: true,
          endpoint: {
            host: host.host,
            wssPort: host.wss_port || 443,
            token: json.data?.token ?? "",
          },
        };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "弹幕服务器请求失败" };
      }
    },
  );

export const generateAiReply = createServerFn({ method: "POST" })
  .validator(
    (input: {
      persona: string;
      transcript: string;
      target: string;
      sentiment: string;
      maxLen: number;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false, error: "当前环境未开放 AI 能力" };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 80,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: `${data.persona}\n只输出一条可直接发送的弹幕，不要引号、不要解释、不要表情符号堆砌。若原弹幕偏负向，回复改为安抚或中性。长度不超过 ${data.maxLen} 个汉字。`,
          },
          {
            role: "user",
            content: `最近弹幕：\n${data.transcript || "（暂无）"}\n\n当前要回应的内容（情绪 ${data.sentiment}）：\n${data.target}\n\n请给出一条回复。`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: `xAI API ${res.status}` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "模型没有返回内容" };
    return { ok: true, text };
  });
