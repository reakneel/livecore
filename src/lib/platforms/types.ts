import type { DanmuEndpoint, LiveEvent } from "@/lib/livecore/types";

/**
 * Platform identifiers are intentionally open-ended. The registry currently
 * ships with Bilibili, while future adapters can add Douyin/Douyu/Huya/Twitch
 * without changing the normalized event model or console components.
 */
export type PlatformId = "bilibili" | (string & {});

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
