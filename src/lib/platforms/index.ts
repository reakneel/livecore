import type { RingLogger } from "@/lib/livecore/logger";
import type { ClientHandlers } from "@/lib/livecore/client";
import { BilibiliPlatformClient } from "./bilibili";
import type { LivePlatformClient, PlatformId } from "./types";

export type { LivePlatformClient, PlatformId } from "./types";

export type PlatformClientFactory = (
  handlers: ClientHandlers,
  log: RingLogger,
) => LivePlatformClient;

const factories: Record<PlatformId, PlatformClientFactory> = {
  bilibili: (handlers, log) => new BilibiliPlatformClient(handlers, log),
};

export function createPlatformClient(
  platform: PlatformId,
  handlers: ClientHandlers,
  log: RingLogger,
): LivePlatformClient {
  const factory = factories[platform];
  if (!factory) throw new Error(`Unsupported platform: ${platform}`);
  return factory(handlers, log);
}

export function listPlatforms(): PlatformId[] {
  return Object.keys(factories) as PlatformId[];
}
