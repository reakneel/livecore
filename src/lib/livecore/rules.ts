import type { LiveEvent } from "./types";

interface Rule {
  id: string;
  test: (ev: LiveEvent) => boolean;
  replies: string[];
  reason: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const RULES: Rule[] = [
  {
    id: "thanks-gift",
    test: (ev) => ev.kind === "gift" || ev.kind === "guard" || ev.kind === "superchat",
    replies: ["感谢老板", "这波太顶了", "谢谢投喂", "主播也太幸福了"],
    reason: "礼物/上舰事件",
  },
  {
    id: "six",
    test: (ev) => Boolean(ev.text && /666+|牛|太强|绝了/.test(ev.text)),
    replies: ["666", "这波稳", "确实强", "好活"],
    reason: "气氛弹幕",
  },
  {
    id: "song",
    test: (ev) => Boolean(ev.text && /好听|再来一首|点歌|唱/.test(ev.text)),
    replies: ["这段真好听", "耳膜被治愈了", "再来一首也行"],
    reason: "歌曲相关",
  },
  {
    id: "cheer",
    test: (ev) => Boolean(ev.text && /加油|支持|喜欢|爱了/.test(ev.text)),
    replies: ["支持一下", "今晚状态很好", "跟着打卡"],
    reason: "应援",
  },
  {
    id: "enter",
    test: (ev) => ev.kind === "enter",
    replies: [],
    reason: "进场不主动搭话",
  },
];

export function matchRule(ev: LiveEvent): { text: string; reason: string; ruleId: string } | null {
  if (ev.kind === "enter" || ev.kind === "like" || ev.kind === "popularity" || ev.kind === "system") {
    return null;
  }
  if (ev.sentiment === "negative") {
    return { text: pick(["主播辛苦了", "慢慢来就好", "今晚听个响"]), reason: "负向情绪降级", ruleId: "soothe" };
  }
  for (const rule of RULES) {
    if (!rule.test(ev) || rule.replies.length === 0) continue;
    return { text: pick(rule.replies), reason: rule.reason, ruleId: rule.id };
  }
  if (ev.kind === "danmaku" && ev.text && ev.text.length <= 12 && Math.random() < 0.18) {
    return { text: pick(["哈哈", "确实", "这倒是", "收到"]), reason: "短弹幕附和", ruleId: "echo" };
  }
  return null;
}

export const CHECK_IN_LINES = ["来了来了", "打卡听一会儿", "今晚也在", "路过支持一下"];
export const AMBIENT_LINES = ["哈哈", "这氛围可以", "好听", "稳"];

export function pickLine(lines: string[]): string {
  return pick(lines);
}
