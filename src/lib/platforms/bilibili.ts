import type { DanmuEndpoint } from "@/lib/livecore/types";
import { startBiliRoom, stopBiliRoom, subscribeBiliRoom } from "@/lib/livecore/server-api";
import type { LivePlatformClient, PlatformClientHandlers } from "./types";

/**
 * Bilibili frontend boundary.
 *
 * Browser code no longer implements Bilibili's packet protocol. The Python
 * livecore-bilibili SDK owns HTTP handshake, WebSocket, heartbeat, reconnect,
 * packet expansion and event parsing. This adapter only bridges the SDK-backed
 * API/WebSocket stream into the existing LiveCore UI event pipeline.
 */
export class BilibiliPlatformClient implements LivePlatformClient {
  readonly platform = "bilibili" as const;
  private unsubscribe: (() => void) | null = null;
  private roomId = 0;
  private stopped = true;

  constructor(private readonly handlers: PlatformClientHandlers) {}

  start(roomId: number, _endpoint: DanmuEndpoint) {
    this.stop();
    this.roomId = roomId;
    this.stopped = false;
    this.handlers.onState("connecting");
    void startBiliRoom(roomId).then((result) => {
      if (this.stopped || this.roomId !== roomId) return;
      if (!result.ok) {
        this.handlers.onState("error");
        return;
      }
      this.unsubscribe = subscribeBiliRoom(roomId, {
        onEvent: (event) => {
          if (!this.stopped && this.roomId === roomId) {
            this.handlers.onEvent(event);
            if (event.kind === "popularity") this.handlers.onHeartbeat(event.popularity ?? 0);
          }
        },
        onState: (state) => {
          if (!this.stopped && this.roomId === roomId) this.handlers.onState(state);
        },
      });
    });
  }

  stop() {
    const roomId = this.roomId;
    this.stopped = true;
    this.roomId = 0;
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (roomId > 0) void stopBiliRoom(roomId).catch(() => undefined);
    this.handlers.onState("offline");
  }
}
