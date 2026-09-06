import { BiliLiveClient, type ClientHandlers } from "@/lib/livecore/client";
import type { DanmuEndpoint } from "@/lib/livecore/types";
import type { LivePlatformClient } from "./types";

/**
 * Bilibili platform adapter.
 *
 * The current browser implementation reuses the protocol client already
 * imported from livecore-bilibili. Keeping this boundary here lets the UI
 * remain platform-neutral when the Python SDK is later exposed through an
 * HTTP/WebSocket service.
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
