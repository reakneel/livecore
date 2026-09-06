import { uid } from "@/lib/utils";
import type { LiveEvent, Sentiment } from "./types";
import { analyzeSentiment } from "./sentiment";

interface RawCmd {
  cmd?: string;
  msg_type?: string;
  data?: Record<string, unknown>;
  info?: unknown;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
}

function asArr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function num(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function cmdName(raw: string): string {
  const i = raw.indexOf(":");
  return i === -1 ? raw : raw.slice(0, i);
}

export function parseNotify(roomId: number, payload: unknown): LiveEvent | null {
  const rec = asRecord(payload);
  if (!rec) return null;
  const cmd = cmdName(str(rec.cmd));
  const data = asRecord(rec.data) ?? {};
  const ts = Date.now();

  switch (cmd) {
    case "DANMU_MSG": {
      const info = asArr(rec.info);
      const userArr = asArr(info[2]);
      const medalArr = asArr(info[3]);
      const text = str(info[1]);
      if (!text) return null;
      const sentiment: Sentiment = analyzeSentiment(text);
      return {
        id: uid("ev"),
        ts,
        kind: "danmaku",
        roomId,
        text,
        sentiment,
        rawCmd: cmd,
        user: {
          uid: num(userArr[0]),
          name: str(userArr[1], "匿名"),
          guard: num(info[7]),
          medal: str(medalArr[1]),
        },
      };
    }
    case "SEND_GIFT":
    case "POPULARITY_RED_POCKET_NEW": {
      const name = str(data.uname) || str(data.sender_uname, "观众");
      const giftName = str(data.giftName) || str(data.gift_name, "礼物");
      return {
        id: uid("ev"),
        ts,
        kind: "gift",
        roomId,
        rawCmd: cmd,
        user: { uid: num(data.uid), name },
        gift: {
          name: giftName,
          num: num(data.num, 1),
          price: num(data.price),
        },
        text: `${name} 投喂 ${giftName} x${num(data.num, 1)}`,
        sentiment: "positive",
      };
    }
    case "INTERACT_WORD": {
      const msgType = num(data.msg_type, 1);
      const name = str(data.uname, "观众");
      const kind = msgType === 2 ? "follow" : msgType === 3 ? "share" : "enter";
      const label = kind === "follow" ? "关注了主播" : kind === "share" ? "分享了直播间" : "进入直播间";
      return {
        id: uid("ev"),
        ts,
        kind,
        roomId,
        rawCmd: cmd,
        user: { uid: num(data.uid), name },
        text: `${name} ${label}`,
        sentiment: "neutral",
      };
    }
    case "SUPER_CHAT_MESSAGE":
    case "SUPER_CHAT_MESSAGE_JPN": {
      const user = asRecord(data.user_info) ?? {};
      const name = str(user.uname, "观众");
      const message = str(data.message);
      return {
        id: uid("ev"),
        ts,
        kind: "superchat",
        roomId,
        rawCmd: cmd,
        user: { uid: num(data.uid), name },
        text: message,
        gift: { name: "醒目留言", num: 1, price: num(data.price) },
        sentiment: analyzeSentiment(message),
      };
    }
    case "GUARD_BUY": {
      const name = str(data.username, "观众");
      const giftName = str(data.gift_name, "舰长");
      return {
        id: uid("ev"),
        ts,
        kind: "guard",
        roomId,
        rawCmd: cmd,
        user: { uid: num(data.uid), name },
        gift: { name: giftName, num: num(data.num, 1), price: num(data.price) },
        text: `${name} 开通了 ${giftName}`,
        sentiment: "positive",
      };
    }
    case "LIKE_INFO_V3_CLICK": {
      const name = str(data.uname, "观众");
      return {
        id: uid("ev"),
        ts,
        kind: "like",
        roomId,
        rawCmd: cmd,
        user: { uid: num(data.uid), name },
        text: `${name} 点了赞`,
        sentiment: "positive",
      };
    }
    case "LIVE":
      return {
        id: uid("ev"),
        ts,
        kind: "system",
        roomId,
        rawCmd: cmd,
        text: "直播已开始",
        sentiment: "positive",
      };
    case "PREPARING":
      return {
        id: uid("ev"),
        ts,
        kind: "system",
        roomId,
        rawCmd: cmd,
        text: "直播已结束",
        sentiment: "neutral",
      };
    case "WARNING":
    case "CUT_OFF":
      return {
        id: uid("ev"),
        ts,
        kind: "system",
        roomId,
        rawCmd: cmd,
        text: str(data.msg) || "系统通知",
        sentiment: "negative",
      };
    default:
      return null;
  }
}

export function popularityEvent(roomId: number, popularity: number): LiveEvent {
  return {
    id: uid("ev"),
    ts: Date.now(),
    kind: "popularity",
    roomId,
    popularity,
    text: `人气 ${popularity}`,
    rawCmd: "HEARTBEAT_REPLY",
  };
}
