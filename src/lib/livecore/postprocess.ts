const BLOCKED = ["加微信", "加qq", "http://", "https://", "www.", "免费领", "刷礼物", "死", "滚"];

const STICKERS = ["", "", "～", "。"];

export function postprocessReply(text: string, maxLen: number): string | null {
  let t = text.replace(/\s+/g, " ").trim();
  t = t.replace(/^["「『]|["」』]$/g, "");
  t = t.replace(/[#@]/g, "");
  if (!t) return null;
  const lower = t.toLowerCase();
  if (BLOCKED.some((w) => lower.includes(w))) return null;
  if (t.length > maxLen) t = t.slice(0, maxLen);
  if (Math.random() < 0.22) t += STICKERS[Math.floor(Math.random() * STICKERS.length)];
  return t;
}
