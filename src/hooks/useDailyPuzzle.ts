import { useMemo } from 'react';
import { Board, BoardCell, Piece, PieceType, Position } from '@/types/game';
import { DailyPuzzle } from '@/types/dailyPuzzle';
import { mulberry32, getTodaysPuzzleSeed, getESTDateString, getPuzzleNumber } from '@/lib/seededRandom';

const PIECE_TYPES: PieceType[] = ['rook', 'bishop', 'knight', 'pawn'];

function createEmptyBoard(): Board {
  const board: Board = [];
  for (let row = 0; row < 4; row++) {
    const rowCells: BoardCell[] = [];
    for (let col = 0; col < 4; col++) {
      rowCells.push({
        piece: null,
        position: { row, col },
      });
    }
    board.push(rowCells);
  }
  return board;
}

function createPiece(type: PieceType, player: 'white' | 'black', id: string): Piece {
  return { type, player, id };
}

// Check if placing a piece at position creates a win
function checkWinAtPosition(board: Board, player: 'white' | 'black', pos: Position): boolean {
  // Temporarily place a piece
  const testBoard = board.map(row => row.map(cell => ({ ...cell })));
  testBoard[pos.row][pos.col].piece = { type: 'pawn', player, id: 'test' };
  
  // Check row
  let rowCount = 0;
  for (let c = 0; c < 4; c++) {
    if (testBoard[pos.row][c].piece?.player === player) rowCount++;
  }
  if (rowCount === 4) return true;
  
  // Check column
  let colCount = 0;
  for (let r = 0; r < 4; r++) {
    if (testBoard[r][pos.col].piece?.player === player) colCount++;
  }
  if (colCount === 4) return true;
  
  // Check main diagonal
  if (pos.row === pos.col) {
    let diagCount = 0;
    for (let i = 0; i < 4; i++) {
      if (testBoard[i][i].piece?.player === player) diagCount++;
    }
    if (diagCount === 4) return true;
  }
  
  // Check anti-diagonal
  if (pos.row + pos.col === 3) {
    let antiDiagCount = 0;
    for (let i = 0; i < 4; i++) {
      if (testBoard[i][3 - i].piece?.player === player) antiDiagCount++;
    }
    if (antiDiagCount === 4) return true;
  }
  
  return false;
}

// Find all lines that have exactly 3 white pieces and 1 empty cell
function findWinningOpportunities(board: Board): Position[] {
  const opportunities: Position[] = [];
  
  // Check rows
  for (let row = 0; row < 4; row++) {
    let whiteCount = 0;
    let emptyPos: Position | null = null;
    for (let col = 0; col < 4; col++) {
      const piece = board[row][col].piece;
      if (piece?.player === 'white') whiteCount++;
      else if (!piece) emptyPos = { row, col };
    }
    if (whiteCount === 3 && emptyPos) {
      opportunities.push(emptyPos);
    }
  }
  
  // Check columns
  for (let col = 0; col < 4; col++) {
    let whiteCount = 0;
    let emptyPos: Position | null = null;
    for (let row = 0; row < 4; row++) {
      const piece = board[row][col].piece;
      if (piece?.player === 'white') whiteCount++;
      else if (!piece) emptyPos = { row, col };
    }
    if (whiteCount === 3 && emptyPos) {
      opportunities.push(emptyPos);
    }
  }
  
  // Check main diagonal
  let diagWhite = 0;
  let diagEmpty: Position | null = null;
  for (let i = 0; i < 4; i++) {
    const piece = board[i][i].piece;
    if (piece?.player === 'white') diagWhite++;
    else if (!piece) diagEmpty = { row: i, col: i };
  }
  if (diagWhite === 3 && diagEmpty) {
    opportunities.push(diagEmpty);
  }
  
  // Check anti-diagonal
  let antiDiagWhite = 0;
  let antiDiagEmpty: Position | null = null;
  for (let i = 0; i < 4; i++) {
    const piece = board[i][3 - i].piece;
    if (piece?.player === 'white') antiDiagWhite++;
    else if (!piece) antiDiagEmpty = { row: i, col: 3 - i };
  }
  if (antiDiagWhite === 3 && antiDiagEmpty) {
    opportunities.push(antiDiagEmpty);
  }
  
  return opportunities;
}

export function generateDailyPuzzle(seed?: number): DailyPuzzle {
  const puzzleSeed = seed ?? getTodaysPuzzleSeed();
  const random = mulberry32(puzzleSeed);
  const puzzleNumber = getPuzzleNumber();
  const dateString = getESTDateString();
  
  // Create the board
  let board = createEmptyBoard();
  
  // Strategy: Place 3 white pieces in a line with one empty spot for the win
  // Then add some black pieces to make it interesting
  
  // Choose a line type: 0-3 = row, 4-7 = col, 8 = main diag, 9 = anti diag
  const lineType = Math.floor(random() * 10);
  
  let winningPositions: Position[] = [];
  let winningSpot: Position;
  
  if (lineType < 4) {
    // Row
    const row = lineType;
    winningPositions = [0, 1, 2, 3].map(col => ({ row, col }));
  } else if (lineType < 8) {
    // Column  
    const col = lineType - 4;
    winningPositions = [0, 1, 2, 3].map(row => ({ row, col }));
  } else if (lineType === 8) {
    // Main diagonal
    winningPositions = [0, 1, 2, 3].map(i => ({ row: i, col: i }));
  } else {
    // Anti-diagonal
    winningPositions = [0, 1, 2, 3].map(i => ({ row: i, col: 3 - i }));
  }
  
  // Leave one spot empty for the winning move
  const emptyIndex = Math.floor(random() * 4);
  winningSpot = winningPositions[emptyIndex];
  
  // Place 3 white pieces
  const whitePieces: Piece[] = [];
  winningPositions.forEach((pos, idx) => {
    if (idx !== emptyIndex) {
      const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
      const piece = createPiece(pieceType, 'white', `w${idx}`);
      board[pos.row][pos.col].piece = piece;
      whitePieces.push(piece);
    }
  });
  
  // Place 2-3 black pieces (not on the winning spot)
  const numBlackPieces = 2 + Math.floor(random() * 2);
  const blackPieces: Piece[] = [];
  const emptyCells: Position[] = [];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col].piece && !(row === winningSpot.row && col === winningSpot.col)) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  // Shuffle empty cells
  for (let i = emptyCells.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
  }
  
  // Place black pieces
  for (let i = 0; i < numBlackPieces && i < emptyCells.length; i++) {
    const pos = emptyCells[i];
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    const piece = createPiece(pieceType, 'black', `b${i}`);
    board[pos.row][pos.col].piece = piece;
    blackPieces.push(piece);
  }
  
  // Create the winning piece for player's reserve
  const winningPieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
  const playerReserve: Piece[] = [
    createPiece(winningPieceType, 'white', 'w-reserve-0'),
  ];
  
  // CPU reserve (empty or minimal)
  const cpuReserve: Piece[] = [];
  
  return {
    puzzleNumber,
    date: dateString,
    seed: puzzleSeed,
    board,
    playerReserve,
    cpuReserve,
    whitePiecesPlaced: 3,
    blackPiecesPlaced: numBlackPieces,
    movesToWin: 1,
    hint: `Find the empty spot to complete your line!`,
  };
}

export const useDailyPuzzle = () => {
  const puzzle = useMemo(() => generateDailyPuzzle(), []);
  return puzzle;
};
