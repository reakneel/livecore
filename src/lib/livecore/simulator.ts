import { uid } from "@/lib/utils";
import type { LiveEvent } from "./types";
import { analyzeSentiment } from "./sentiment";

const NAMES = [
  "薄荷汽水",
  "夜航船",
  "像素猫",
  "南风起",
  "芝士波波",
  "林间灯",
  "半夏",
  "雾岛",
  "阿澄",
  "可露丽",
  "青柠冰",
  "木木夕",
  "白噪音",
  "星屑",
  "软糖研究所",
  "迟来的信",
];

const DANMAKU = [
  "这段转音好稳",
  "好听好听",
  "晚风音晚上好",
  "666",
  "主播今天状态绝了",
  "再来一首《晴天》可以吗",
  "耳机里全是治愈",
  "哈哈哈哈这句",
  "支持一波",
  "弹幕怎么突然安静",
  "这麦好干净",
  "来了来了",
  "今晚不睡觉了",
  "awsl",
  "唱到我了",
  "谢谢你的歌",
  "这编曲好舒服",
  "有点困但还是想听",
  "前排",
  "节奏起来了",
  "这句我单曲循环",
  "主播喝口水",
  "人呢人呢",
  "好听哭了",
];

const GIFTS = [
  { name: "辣条", price: 100 },
  { name: "人气票", price: 100 },
  { name: "小花花", price: 100 },
  { name: "这个好诶", price: 1000 },
  { name: "B 坷垃", price: 1000 },
];

function name(): string {
  return NAMES[Math.floor(Math.random() * NAMES.length)]!;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function nextDemoDelay(online: number): number {
  const base = online > 8000 ? 900 : 1600;
  return base + Math.random() * 2200;
}

export function simulateEvent(roomId: number, popularity: number): LiveEvent {
  const roll = Math.random();
  const user = { uid: Math.floor(Math.random() * 90_000_000), name: name() };
  const ts = Date.now();

  if (roll < 0.62) {
    const text = pick(DANMAKU);
    return {
      id: uid("ev"),
      ts,
      kind: "danmaku",
      roomId,
      user,
      text,
      sentiment: analyzeSentiment(text),
      rawCmd: "DANMU_MSG",
    };
  }
  if (roll < 0.78) {
    return {
      id: uid("ev"),
      ts,
      kind: "enter",
      roomId,
      user,
      text: `${user.name} 进入直播间`,
      sentiment: "neutral",
      rawCmd: "INTERACT_WORD",
    };
  }
  if (roll < 0.9) {
    const gift = pick(GIFTS);
    const num = Math.random() < 0.7 ? 1 : 1 + Math.floor(Math.random() * 10);
    return {
      id: uid("ev"),
      ts,
      kind: "gift",
      roomId,
      user,
      gift: { ...gift, num },
      text: `${user.name} 投喂 ${gift.name} x${num}`,
      sentiment: "positive",
      rawCmd: "SEND_GIFT",
    };
  }
  if (roll < 0.96) {
    return {
      id: uid("ev"),
      ts,
      kind: "like",
      roomId,
      user,
      text: `${user.name} 点了赞`,
      sentiment: "positive",
      rawCmd: "LIKE_INFO_V3_CLICK",
    };
  }
  if (roll < 0.985) {
    const text = "今晚的和声好温柔，把白噪音关了专门听。";
    return {
      id: uid("ev"),
      ts,
      kind: "superchat",
      roomId,
      user,
      text,
      gift: { name: "醒目留言", num: 1, price: 30 },
      sentiment: analyzeSentiment(text),
      rawCmd: "SUPER_CHAT_MESSAGE",
    };
  }
  return {
    id: uid("ev"),
    ts,
    kind: "popularity",
    roomId,
    popularity: popularity + Math.floor((Math.random() - 0.45) * 80),
    text: "人气心跳",
    rawCmd: "HEARTBEAT_REPLY",
  };
}
