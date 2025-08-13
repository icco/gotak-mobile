export type PieceType = 'flat' | 'standing' | 'capstone';
export type PlayerColor = 'white' | 'black';

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

export interface Board {
  size: number;
  squares: Square[][];
}

export interface Square {
  pieces: Piece[];
  x: number;
  y: number;
}

export interface GameState {
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

export interface PlayerInfo {
  id: string;
  name: string;
  pieces: {
    flat: number;
    standing: number;
    capstone: number;
  };
}

export interface Move {
  from?: Position;
  to: Position;
  piece: Piece;
  moveType: 'place' | 'move' | 'stack';
}