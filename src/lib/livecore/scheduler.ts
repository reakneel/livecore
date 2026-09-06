import { jitter } from "@/lib/utils";
import type { EngineConfig } from "./types";
import { AMBIENT_LINES, CHECK_IN_LINES, pickLine } from "./rules";
import type { RoomContext } from "./context";

export type ScheduledKind = "checkin" | "ambient";

export interface ScheduledAction {
  kind: ScheduledKind;
  text: string;
  reason: string;
}

export class BehaviorScheduler {
  private startedAt = Date.now();
  private lastEmit = 0;
  private lastCheckIn = 0;
  private lastAmbient = 0;

  reset() {
    this.startedAt = Date.now();
    this.lastEmit = 0;
    this.lastCheckIn = 0;
    this.lastAmbient = 0;
  }

  markEmit() {
    this.lastEmit = Date.now();
  }

  coldRemaining(config: EngineConfig): number {
    const elapsed = (Date.now() - this.startedAt) / 1000;
    return Math.max(0, config.coldStartSec - elapsed);
  }

  gapOk(config: EngineConfig): boolean {
    if (this.lastEmit === 0) return this.coldRemaining(config) === 0;
    return Date.now() - this.lastEmit >= config.minGapSec * 1000;
  }

  nextDelay(config: EngineConfig): number {
    return jitter(config.jitterMs, config.jitterMs * 0.8);
  }

  tick(config: EngineConfig, ctx: RoomContext): ScheduledAction | null {
    if (this.coldRemaining(config) > 0) return null;
    if (!this.gapOk(config)) return null;

    const now = Date.now();
    const activity = ctx.activityPerMinute();
    const boost = config.activityBoost && activity >= 12;
    const quiet = activity < 4;

    const checkEvery = config.checkInMin * 60_000;
    if (now - this.lastCheckIn >= checkEvery) {
      this.lastCheckIn = now;
      return {
        kind: "checkin",
        text: pickLine(CHECK_IN_LINES),
        reason: "定时打卡",
      };
    }

    const ambientEvery = quiet ? 180_000 : boost ? 50_000 : 90_000;
    if (now - this.lastAmbient >= ambientEvery) {
      this.lastAmbient = now;
      return {
        kind: "ambient",
        text: pickLine(AMBIENT_LINES),
        reason: quiet ? "冷清时低频互动" : "随机氛围弹幕",
      };
    }

    return null;
  }
}
