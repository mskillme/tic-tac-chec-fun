import { Board, Piece, Position } from './game';

export interface DailyPuzzle {
  puzzleNumber: number;
  date: string;
  seed: number;
  board: Board;
  playerReserve: Piece[];
  cpuReserve: Piece[];
  whitePiecesPlaced: number;
  blackPiecesPlaced: number;
  movesToWin: number; // 1-3 moves to solve
  hint?: string;
}

export interface DailyPuzzleStats {
  lastCompletedDate: string | null;
  currentStreak: number;
  bestStreak: number;
  totalSolved: number;
  completedPuzzles: number[]; // Array of puzzle numbers completed
}
