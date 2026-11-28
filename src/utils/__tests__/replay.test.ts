import { ReplayStep } from '../../types/game';
import { stepDelay } from '../replay';

const step = (played_at?: string): ReplayStep => ({ turn: 1, player: 1, move: 'a1', board: {}, played_at });

describe('stepDelay', () => {
  const steps = [step('2026-01-01T00:00:00Z'), step('2026-01-01T00:00:03Z'), step('2026-01-01T00:10:00Z'), step()];

  it('uses a fixed pace scaled by speed', () => {
    expect(stepDelay(steps, 1, 1, false)).toBe(1000);
    expect(stepDelay(steps, 1, 2, false)).toBe(500);
  });

  it('follows real gaps, clamped', () => {
    expect(stepDelay(steps, 1, 1, true)).toBe(3000);
    expect(stepDelay(steps, 1, 4, true)).toBe(750);
    expect(stepDelay(steps, 2, 1, true)).toBe(5000);
  });

  it('falls back to the fixed pace without timestamps', () => {
    expect(stepDelay(steps, 3, 1, true)).toBe(1000);
    expect(stepDelay(steps, 0, 1, true)).toBe(1000);
  });
});
