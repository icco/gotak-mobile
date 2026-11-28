import { UIBoard, UIStone } from '../types/game';
import { Direction, coordsToSquare, directionBetween, squareToCoords } from './ptn';

/** An in-progress stack move. Stones drop from the bottom of the hand first. */
export interface Spread {
  origin: string;
  hand: UIStone[];
  dir: Direction | null;
  drops: number[];
}

const STEP: Record<Direction, [number, number]> = {
  '>': [1, 0],
  '<': [-1, 0],
  '+': [0, 1],
  '-': [0, -1],
};

export function step(square: string, dir: Direction, size: number): string | null {
  const c = squareToCoords(square);
  if (!c) return null;
  const x = c.x + STEP[dir][0];
  const y = c.y + STEP[dir][1];
  if (x < 0 || y < 0 || x >= size || y >= size) return null;
  return coordsToSquare(x, y);
}

export function dropped(s: Spread): number {
  return s.drops.reduce((a, b) => a + b, 0);
}

export function remaining(s: Spread): number {
  return s.hand.length - dropped(s);
}

/** Square the last stone was dropped on, or null before the first drop. */
export function currentSquare(s: Spread, size: number): string | null {
  if (!s.dir) return null;
  let sq: string | null = s.origin;
  for (let i = 0; i < s.drops.length && sq; i++) sq = step(sq, s.dir, size);
  return sq;
}

export function startSpread(board: UIBoard, square: string, player: number): Spread | null {
  const stones = board.squares[square] ?? [];
  const top = stones[stones.length - 1];
  if (!top || top.player !== player) return null;
  const carry = Math.min(stones.length, board.size);
  return { origin: square, hand: stones.slice(stones.length - carry), dir: null, drops: [] };
}

/** Whether the next stone in hand may land on `square`, following gotak's rules. */
function canDropOn(board: UIBoard, s: Spread, square: string, player: number): boolean {
  const stones = board.squares[square] ?? [];
  const top = stones[stones.length - 1];
  if (!top || top.type === 'F') return true;
  if (top.type === 'C') return false;
  const stone = s.hand[dropped(s)];
  return remaining(s) === 1 && stone?.type === 'C' && top.player !== player;
}

export function legalTargets(board: UIBoard, s: Spread, player: number): string[] {
  if (remaining(s) === 0) return [];
  if (!s.dir) {
    return (['>', '<', '+', '-'] as Direction[])
      .map((d) => step(s.origin, d, board.size))
      .filter((sq): sq is string => !!sq && canDropOn(board, s, sq, player));
  }
  const cur = currentSquare(s, board.size);
  const next = cur ? step(cur, s.dir, board.size) : null;
  const out = cur ? [cur] : [];
  if (next && canDropOn(board, s, next, player)) out.push(next);
  return out;
}

/** Apply a tap during a spread. Returns the new spread, or null when the move is cancelled. */
export function tapSpread(board: UIBoard, s: Spread, square: string, player: number): Spread | null {
  if (square === s.origin && s.drops.length === 0) {
    if (s.hand.length === 1) return null;
    return { ...s, hand: s.hand.slice(1) };
  }
  if (!legalTargets(board, s, player).includes(square)) return s;
  if (!s.dir) {
    return { ...s, dir: directionBetween(s.origin, square), drops: [1] };
  }
  if (square === currentSquare(s, board.size)) {
    const drops = [...s.drops];
    drops[drops.length - 1] += 1;
    return { ...s, drops };
  }
  return { ...s, drops: [...s.drops, 1] };
}

export function undoSpread(s: Spread): Spread | null {
  if (s.drops.length === 0) return null;
  const drops = [...s.drops];
  drops[drops.length - 1] -= 1;
  if (drops[drops.length - 1] === 0) drops.pop();
  return { ...s, drops, dir: drops.length ? s.dir : null };
}

export function spreadPtn(s: Spread): string | null {
  if (!s.dir || remaining(s) !== 0) return null;
  const n = s.hand.length;
  const counts = s.drops.length === 1 ? '' : s.drops.join('');
  return `${n === 1 ? '' : n}${s.origin}${s.dir}${counts}`;
}

/** Board as it would look mid-spread, for display only; the server stays authoritative. */
export function previewBoard(board: UIBoard, s: Spread): UIBoard {
  const squares = { ...board.squares };
  const origin = squares[s.origin] ?? [];
  squares[s.origin] = origin.slice(0, origin.length - s.hand.length);
  let sq: string | null = s.origin;
  let i = 0;
  for (const count of s.drops) {
    sq = sq && s.dir ? step(sq, s.dir, board.size) : null;
    if (!sq) break;
    const target = (squares[sq] ?? []).map((st, idx, arr) =>
      idx === arr.length - 1 && st.type === 'S' ? { ...st, type: 'F' } : st,
    );
    squares[sq] = [...target, ...s.hand.slice(i, i + count)];
    i += count;
  }
  return { ...board, squares };
}
