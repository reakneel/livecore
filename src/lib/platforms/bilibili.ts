import { BiliLiveClient, type ClientHandlers } from "@/lib/livecore/client";
import type { DanmuEndpoint } from "@/lib/livecore/types";
import type { LivePlatformClient } from "./types";

/**
 * Initial Bilibili adapter for the browser runtime.
 *
 * The protocol implementation currently lives in this LiveCore source tree.
 * The adapter is deliberately kept as the integration boundary so the
 * implementation can later be backed by livecore-bilibili over HTTP/WebSocket
 * without changing the frontend event pipeline.
 */
export class BilibiliPlatformClient implements LivePlatformClient {
  readonly platform = "bilibili" as const;
  private readonly client: BiliLiveClient;

  constructor(handlers: ClientHandlers, log: ConstructorParameters<typeof BiliLiveClient>[1]) {
    this.client = new BiliLiveClient(handlers, log);
  }

  start(roomId: number, endpoint: DanmuEndpoint) {
    this.client.start(roomId, endpoint);
  }

  stop() {
    this.client.stop();
  }
}
