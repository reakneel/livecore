import type { Sentiment } from "./types";

const POSITIVE = [
  "好",
  "棒",
  "爱",
  "喜欢",
  "厉害",
  "绝了",
  "好听",
  "好看",
  "哈哈",
  "哈哈哈",
  "666",
  "牛",
  "感谢",
  "谢谢",
  "支持",
  "加油",
  "可爱",
  "漂亮",
  "稳",
  "太强",
  "yyds",
  "awsl",
  "妙",
  "舒服",
  "宝藏",
];

const NEGATIVE = [
  "差",
  "烂",
  "难听",
  "难看",
  "无聊",
  "垃圾",
  "滚",
  "傻",
  "恶心",
  "讨厌",
  "举报",
  "下播",
  "别唱",
  "闭嘴",
  "假",
  "骗",
  "坑",
  "无语",
  "尴尬",
  "崩",
];

export function analyzeSentiment(text: string): Sentiment {
  const t = text.toLowerCase();
  let score = 0;
  for (const w of POSITIVE) if (t.includes(w)) score += 1;
  for (const w of NEGATIVE) if (t.includes(w)) score -= 2;
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

export function sentimentLabel(s: Sentiment): string {
  if (s === "positive") return "正向";
  if (s === "negative") return "负向";
  return "中性";
}
