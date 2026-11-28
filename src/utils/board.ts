import { Turn, UIBoard } from '../types/game';
import { Direction, coordsToSquare } from './ptn';
import { step } from './spread';

export function topOf(board: UIBoard, square: string) {
  const stones = board.squares[square];
  return stones?.length ? stones[stones.length - 1] : undefined;
}

/** Flats on top of a stack count toward a flat win; walls and caps do not. */
export function flatCount(board: UIBoard, player: number): number {
  let n = 0;
  for (const stones of Object.values(board.squares)) {
    const top = stones[stones.length - 1];
    if (top && top.player === player && top.type === 'F') n += 1;
  }
  return n;
}

export function turnNumber(turns: Turn[]): number {
  const last = turns[turns.length - 1];
  if (!last) return 1;
  return last.First && !last.Second ? last.Number : last.Number + 1;
}

/** Squares touched by the most recent ply. */
export function lastMoveSquares(turns: Turn[], size: number): string[] {
  const last = turns[turns.length - 1];
  const mv = last?.Second ?? last?.First;
  if (!mv?.Square) return [];
  const dir = mv.MoveDirection as Direction | undefined;
  if (!dir) return [mv.Square];
  const out = [mv.Square];
  let sq: string | null = mv.Square;
  for (let i = 0; i < (mv.MoveDropCounts?.length ?? 1) && sq; i++) {
    sq = step(sq, dir, size);
    if (sq) out.push(sq);
  }
  return out;
}

export function moveList(turns: Turn[]): { n: number; white?: string; black?: string }[] {
  return turns.map((t) => ({ n: t.Number, white: t.First?.Text, black: t.Second?.Text }));
}

const isRoadStone = (board: UIBoard, square: string, player: number) => {
  const top = topOf(board, square);
  return !!top && top.player === player && top.type !== 'S';
};

/** Adjacent pairs of road stones (flats and caps) of the same player, each listed once. */
export function roadLinks(board: UIBoard): { from: string; to: string; player: number }[] {
  const links = [];
  for (let y = 0; y < board.size; y++) {
    for (let x = 0; x < board.size; x++) {
      const sq = coordsToSquare(x, y);
      const top = topOf(board, sq);
      if (!top || top.type === 'S') continue;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (x + dx >= board.size || y + dy >= board.size) continue;
        const next = coordsToSquare(x + dx, y + dy);
        if (isRoadStone(board, next, top.player)) links.push({ from: sq, to: next, player: top.player });
      }
    }
  }
  return links;
}

/** Shortest edge-to-edge road for `player`, or [] when there is none. */
export function winningRoad(board: UIBoard, player: number): string[] {
  const n = board.size;
  const sides: [(x: number, y: number) => boolean, (x: number, y: number) => boolean][] = [
    [(x) => x === 0, (x) => x === n - 1],
    [(_, y) => y === 0, (_, y) => y === n - 1],
  ];
  for (const [isStart, isEnd] of sides) {
    const parent = new Map<string, string | null>();
    const queue: [number, number][] = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const sq = coordsToSquare(x, y);
        if (isStart(x, y) && isRoadStone(board, sq, player)) {
          parent.set(sq, null);
          queue.push([x, y]);
        }
      }
    }
    while (queue.length) {
      const [x, y] = queue.shift()!;
      const sq = coordsToSquare(x, y);
      if (isEnd(x, y)) {
        const path = [];
        for (let at: string | null = sq; at; at = parent.get(at) ?? null) path.unshift(at);
        return path;
      }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= n || ny >= n) continue;
        const next = coordsToSquare(nx, ny);
        if (parent.has(next) || !isRoadStone(board, next, player)) continue;
        parent.set(next, sq);
        queue.push([nx, ny]);
      }
    }
  }
  return [];
}
