import { Turn, UIBoard } from '../types/game';
import { Direction } from './ptn';
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
