import { ReplayStep } from '../types/game';

export const SPEEDS = [0.5, 1, 2, 4];
const BASE_MS = 1000;
const MIN_MS = 250;
const MAX_MS = 5000;

/**
 * How long to wait before showing step `next`. With `real` set, the wait follows
 * the gap between the two moves' played_at, scaled by speed and clamped so a
 * long think doesn't stall playback; without timestamps it falls back to the base pace.
 */
export function stepDelay(steps: ReplayStep[], next: number, speed: number, real: boolean): number {
  const base = BASE_MS / speed;
  if (!real) return base;
  const a = Date.parse(steps[next - 1]?.played_at ?? '');
  const b = Date.parse(steps[next]?.played_at ?? '');
  if (Number.isNaN(a) || Number.isNaN(b)) return base;
  return Math.min(MAX_MS, Math.max(MIN_MS, (b - a) / speed));
}
