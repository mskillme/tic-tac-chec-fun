export type PieceType = 'rook' | 'bishop' | 'knight' | 'pawn';
export type Player = 'white' | 'black';
export type GameMode = 'local' | 'ai';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Piece {
  type: PieceType;
  player: Player;
  id: string;
}

export interface Position {
  row: number;
  col: number;
}

export interface BoardCell {
  piece: Piece | null;
  position: Position;
}

export type Board = BoardCell[][];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  phase: 'placement' | 'movement';
  whitePiecesPlaced: number;
  blackPiecesPlaced: number;
  whiteReserve: Piece[];
  blackReserve: Piece[];
  selectedPiece: { piece: Piece; position: Position | null } | null;
  validMoves: Position[];
  winner: Player | null;
  winningLine: Position[] | null;
  gameMode: GameMode;
  difficulty: Difficulty;
  moveHistory: Move[];
}

export interface Move {
  piece: Piece;
  from: Position | null;
  to: Position;
  captured?: Piece;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  winStreak: number;
  bestStreak: number;
  byDifficulty: {
    easy: { wins: number; losses: number };
    medium: { wins: number; losses: number };
    hard: { wins: number; losses: number };
  };
}
