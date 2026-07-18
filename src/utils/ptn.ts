import { PieceType } from '../types/game';

/** Build a placement PTN string: a1 / Sa1 / Ca1 */
export function buildPlacementPtn(square: string, pieceType: PieceType): string {
  switch (pieceType) {
    case 'standing':
      return `S${square}`;
    case 'capstone':
      return `C${square}`;
    case 'flat':
    default:
      return square;
  }
}

export type Direction = '>' | '<' | '+' | '-';

export function coordsToSquare(x: number, y: number): string {
  return `${String.fromCharCode(97 + x)}${y + 1}`;
}

export function squareToCoords(square: string): { x: number; y: number } | null {
  const match = /^([a-z])(\d+)$/.exec(square.toLowerCase());
  if (!match) return null;
  return {
    x: match[1].charCodeAt(0) - 97,
    y: parseInt(match[2], 10) - 1,
  };
}

export function directionBetween(
  from: string,
  to: string,
): Direction | null {
  const a = squareToCoords(from);
  const b = squareToCoords(to);
  if (!a || !b) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 1 && dy === 0) return '>';
  if (dx === -1 && dy === 0) return '<';
  if (dx === 0 && dy === 1) return '+';
  if (dx === 0 && dy === -1) return '-';
  return null;
}

/** Build a stack slide that drops all picked stones on the next square. */
export function buildStackSlidePtn(
  fromSquare: string,
  direction: Direction,
  count: number,
): string {
  if (count <= 1) {
    return `${fromSquare}${direction}`;
  }
  return `${count}${fromSquare}${direction}${count}`;
}

export function isAdjacent(from: string, to: string): boolean {
  return directionBetween(from, to) !== null;
}
