import { UIBoard, UIStone } from '../types/game';
import { coordsToSquare } from './ptn';

/** About 400 per flat; forced wins come back as +/-100000. */
export const FLAT = 400;
export const FORCED_WIN = 100_000;
export const GRAPH_CLAMP = 3000;

export const clampScore = (score: number) => Math.max(-GRAPH_CLAMP, Math.min(GRAPH_CLAMP, score));

export function formatScore(score: number): string {
  if (score >= FORCED_WIN / 2) return 'White wins';
  if (score <= -FORCED_WIN / 2) return 'Black wins';
  const flats = score / FLAT;
  return `${flats > 0 ? '+' : ''}${flats.toFixed(1)}`;
}

/** Board from a TPS string such as "x5/x5/x5/2,2,x3/1,1,1,1,x 1 5". Rows run from the top rank down. */
export function parseTps(tps: string): UIBoard {
  const rows = tps.trim().split(/\s+/)[0].split('/');
  const size = rows.length;
  const squares: Record<string, UIStone[]> = {};
  rows.forEach((row, r) => {
    const y = size - 1 - r;
    let x = 0;
    for (const cell of row.split(',')) {
      const empty = /^x(\d*)$/.exec(cell);
      if (empty) {
        x += empty[1] ? parseInt(empty[1], 10) : 1;
        continue;
      }
      const stack = /^([12]+)([SC]?)$/.exec(cell);
      if (!stack) throw new Error(`bad TPS square "${cell}"`);
      const stones = [...stack[1]].map((p) => ({ player: Number(p), type: 'F' }));
      if (stack[2]) stones[stones.length - 1].type = stack[2];
      squares[coordsToSquare(x, y)] = stones;
      x += 1;
    }
    if (x !== size) throw new Error(`TPS row ${r + 1} has ${x} squares, expected ${size}`);
  });
  return { size, squares };
}
