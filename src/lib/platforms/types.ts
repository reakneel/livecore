import type { DanmuEndpoint, LiveEvent } from "@/lib/livecore/types";

export type PlatformId = "bilibili";

export type PlatformConnectionState =
  | "connecting"
  | "authenticating"
  | "live"
  | "reconnecting"
  | "offline"
  | "error";

export interface PlatformClientHandlers {
  onEvent: (event: LiveEvent) => void;
  onState: (state: PlatformConnectionState) => void;
  onHeartbeat: (popularity: number) => void;
}

export interface LivePlatformClient {
  readonly platform: PlatformId;
  start(roomId: number, endpoint: DanmuEndpoint): void;
  stop(): void;
}
