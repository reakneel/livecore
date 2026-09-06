import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function formatOnline(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 万`;
  if (n >= 1000) return n.toLocaleString("zh-CN");
  return String(n);
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function jitter(baseMs: number, spreadMs: number): number {
  const u = Math.random() + Math.random() - 1;
  return Math.max(0, Math.round(baseMs + u * spreadMs));
}
