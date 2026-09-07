import { BilibiliPlatformClient } from "./bilibili";
import type { LivePlatformClient, PlatformClientHandlers, PlatformId } from "./types";

export type { LivePlatformClient, PlatformId } from "./types";

export type PlatformClientFactory = (handlers: PlatformClientHandlers) => LivePlatformClient;

const factories: Record<PlatformId, PlatformClientFactory> = {
  bilibili: (handlers) => new BilibiliPlatformClient(handlers),
};

export function createPlatformClient(platform: PlatformId, handlers: PlatformClientHandlers, _log?: unknown): LivePlatformClient {
  const factory = factories[platform];
  if (!factory) throw new Error(`Unsupported platform: ${platform}`);
  return factory(handlers);
}

export function listPlatforms(): PlatformId[] {
  return Object.keys(factories) as PlatformId[];
}
