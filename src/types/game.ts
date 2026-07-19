export type PieceType = 'flat' | 'standing' | 'capstone';
export type PlayerColor = 'white' | 'black';
export type GameMode = 'human' | 'ai';

export interface Stone {
  Player: number;
  Type: string;
  // Lowercase aliases tolerated when mapping from older payloads
  player?: number;
  type?: string;
}

export interface Board {
  Size: number;
  Squares: { [key: string]: Stone[] };
  // Lowercase aliases for convenience after normalize
  size?: number;
  squares?: { [key: string]: Stone[] };
}

export interface Move {
  Square?: string;
  Stone?: string;
  Text?: string;
  MoveCount?: number;
  MoveDirection?: string;
  MoveDropCounts?: number[];
}

export interface Turn {
  Comment?: string;
  First?: Move;
  Number: number;
  Result?: string;
  Second?: Move;
}

export interface Tag {
  Key: string;
  Value: string;
}

export interface GameState {
  ID: number;
  Slug: string;
  Board: Board;
  Turns: Turn[];
  Meta: Tag[];
  current_player: number;
  status: string;
  winner: number;
  white_player_id?: number;
  black_player_id?: number;
  mode: GameMode;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Normalized board view used by UI components. */
export interface UIBoard {
  size: number;
  squares: { [key: string]: UIStone[] };
}

export interface UIStone {
  player: number;
  type: string;
}

export function normalizeStone(stone: Stone): UIStone {
  return {
    player: stone.Player ?? stone.player ?? 0,
    type: (stone.Type ?? stone.type ?? 'F').toUpperCase(),
  };
}

export function normalizeBoard(board: Board): UIBoard {
  const size = board.Size ?? board.size ?? 5;
  const raw = board.Squares ?? board.squares ?? {};
  const squares: { [key: string]: UIStone[] } = {};
  for (const [key, stones] of Object.entries(raw)) {
    squares[key] = (stones || []).map(normalizeStone);
  }
  return { size, squares };
}

export function maxFlatsForSize(size: number): number {
  switch (size) {
    case 3:
      return 10;
    case 4:
      return 15;
    case 5:
      return 21;
    case 6:
      return 30;
    case 7:
      return 40;
    case 8:
    case 9:
      return 50;
    default:
      return 21;
  }
}

export function maxCapsForSize(size: number): number {
  switch (size) {
    case 3:
    case 4:
      return 0;
    case 5:
    case 6:
    case 7:
      return 1;
    case 8:
    case 9:
      return 2;
    default:
      return 1;
  }
}

export function remainingPieces(
  board: UIBoard,
  player: number,
): { flat: number; standing: number; capstone: number } {
  let usedFlats = 0;
  let usedCaps = 0;
  for (const stones of Object.values(board.squares)) {
    for (const stone of stones) {
      if (stone.player !== player) continue;
      if (stone.type === 'C') {
        usedCaps += 1;
      } else {
        usedFlats += 1;
      }
    }
  }
  const flats = Math.max(0, maxFlatsForSize(board.size) - usedFlats);
  const caps = Math.max(0, maxCapsForSize(board.size) - usedCaps);
  return {
    flat: flats,
    standing: flats,
    capstone: caps,
  };
}
