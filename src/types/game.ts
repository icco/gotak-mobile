export type PieceType = 'flat' | 'standing' | 'capstone';
export type PlayerColor = 'white' | 'black';

export interface Stone {
  player: number;
  type: string;
}

export interface Board {
  size: number;
  squares: { [key: string]: Stone[] };
}

export interface Move {
  moveCount?: number;
  moveDirection?: string;
  moveDropCounts?: number[];
  square: string;
  stone: string;
  text: string;
}

export interface Turn {
  comment?: string;
  first: Move;
  number: number;
  result?: string;
  second?: Move;
}

export interface Tag {
  key: string;
  value: string;
}

export interface GameState {
  id: number;
  slug: string;
  board: Board;
  turns: Turn[];
  meta: Tag[];
}

// Legacy types for backward compatibility with UI components
export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  position?: Position;
}

export interface Position {
  x: number;
  y: number;
  stackIndex: number;
}

export interface Square {
  pieces: Piece[];
  x: number;
  y: number;
}

export interface PlayerInfo {
  id: string;
  name: string;
  pieces: {
    flat: number;
    standing: number;
    capstone: number;
  };
}

export interface LegacyGameState {
  id: string;
  board: Board;
  currentPlayer: PlayerColor;
  players: {
    white: PlayerInfo;
    black: PlayerInfo;
  };
  gameStatus: 'waiting' | 'active' | 'finished';
  winner?: PlayerColor;
}

export interface LegacyMove {
  from?: Position;
  to: Position;
  piece: Piece;
  moveType: 'place' | 'move' | 'stack';
}