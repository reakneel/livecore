import type { ClientHandlers } from "@/lib/livecore/client";
import { BilibiliPlatformClient } from "./bilibili";
import type { LivePlatformClient, PlatformId } from "./types";

export type { LivePlatformClient, PlatformId } from "./types";

export type PlatformClientFactory = (handlers: ClientHandlers) => LivePlatformClient;

const factories: Record<PlatformId, PlatformClientFactory> = {
  bilibili: (handlers) => new BilibiliPlatformClient(handlers),
};

export function createPlatformClient(platform: PlatformId, handlers: ClientHandlers, _log?: unknown): LivePlatformClient {
  const factory = factories[platform];
  if (!factory) throw new Error(`Unsupported platform: ${platform}`);
  return factory(handlers);
}

export function listPlatforms(): PlatformId[] {
  return Object.keys(factories) as PlatformId[];
}
