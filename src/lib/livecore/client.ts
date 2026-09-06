import {
  encodeAuth,
  encodeHeartbeat,
  expandPackets,
  OP,
  parseJsonBody,
  readPopularity,
} from "./protocol";
import { parseNotify, popularityEvent } from "./parser";
import type { DanmuEndpoint, LiveEvent } from "./types";
import type { RingLogger } from "./logger";

export interface ClientHandlers {
  onEvent: (ev: LiveEvent) => void;
  onState: (state: "connecting" | "authenticating" | "live" | "reconnecting" | "offline" | "error") => void;
  onHeartbeat: (popularity: number) => void;
}

const HEARTBEAT_MS = 25_000;

export class BiliLiveClient {
  private ws: WebSocket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private stopped = true;
  private roomId = 0;
  private endpoint: DanmuEndpoint | null = null;

  constructor(
    private handlers: ClientHandlers,
    private log: RingLogger,
  ) {}

  start(roomId: number, endpoint: DanmuEndpoint) {
    this.stop();
    this.stopped = false;
    this.roomId = roomId;
    this.endpoint = endpoint;
    this.attempt = 0;
    this.open();
  }

  stop() {
    this.stopped = true;
    this.clearTimers();
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        /* ignore */
      }
    }
    this.ws = null;
    this.handlers.onState("offline");
  }

  private open() {
    if (this.stopped || !this.endpoint) return;
    const { host, wssPort, token } = this.endpoint;
    const url = `wss://${host}${wssPort === 443 ? "" : `:${wssPort}`}/sub`;
    this.handlers.onState(this.attempt === 0 ? "connecting" : "reconnecting");
    this.log.push("info", "net", `连接 ${url}  房间 ${this.roomId}`);

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (err) {
      this.log.push("error", "net", `WebSocket 创建失败：${String(err)}`);
      this.scheduleReconnect();
      return;
    }
    ws.binaryType = "arraybuffer";
    this.ws = ws;

    ws.onopen = () => {
      this.handlers.onState("authenticating");
      this.log.push("info", "net", "套接字已打开，发送认证帧");
      ws.send(encodeAuth(this.roomId, token));
    };

    ws.onmessage = (ev) => {
      void this.handleFrame(ev.data);
    };

    ws.onerror = () => {
      this.log.push("warn", "net", "套接字错误");
    };

    ws.onclose = (ev) => {
      this.clearHeartbeat();
      this.log.push("warn", "net", `连接关闭 code=${ev.code}`);
      if (!this.stopped) this.scheduleReconnect();
    };
  }

  private async handleFrame(data: ArrayBuffer) {
    const packets = await expandPackets(data);
    for (const pkt of packets) {
      if (pkt.op === OP.AUTH_REPLY) {
        this.attempt = 0;
        this.handlers.onState("live");
        this.log.push("info", "net", "认证成功，开始心跳");
        this.startHeartbeat();
      } else if (pkt.op === OP.HEARTBEAT_REPLY) {
        const pop = readPopularity(pkt.body);
        this.handlers.onHeartbeat(pop);
        this.handlers.onEvent(popularityEvent(this.roomId, pop));
      } else if (pkt.op === OP.NOTIFY) {
        const payload = parseJsonBody(pkt.body);
        const event = parseNotify(this.roomId, payload);
        if (event) this.handlers.onEvent(event);
      }
    }
  }

  private startHeartbeat() {
    this.clearHeartbeat();
    this.ws?.send(encodeHeartbeat());
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(encodeHeartbeat());
        this.log.push("debug", "net", "Ping");
      }
    }, HEARTBEAT_MS);
  }

  private scheduleReconnect() {
    if (this.stopped) return;
    this.attempt += 1;
    const exp = Math.min(30_000, 800 * 2 ** Math.min(this.attempt, 6));
    const wait = Math.round(exp * (0.7 + Math.random() * 0.6));
    this.handlers.onState("reconnecting");
    this.log.push("warn", "net", `第 ${this.attempt} 次重连，${wait}ms 后重试`);
    this.reconnectTimer = setTimeout(() => this.open(), wait);
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearTimers() {
    this.clearHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
