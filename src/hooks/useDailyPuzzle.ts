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

function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => ({ 
    ...cell, 
    piece: cell.piece ? { ...cell.piece } : null 
  })));
}

// Get valid moves for a piece (simplified version for puzzle generation)
function getValidMoves(piece: Piece, from: Position, board: Board): Position[] {
  const moves: Position[] = [];
  const { row, col } = from;

  switch (piece.type) {
    case 'rook':
      for (const dir of [-1, 1]) {
        let c = col + dir;
        while (c >= 0 && c < 4) {
          if (!board[row][c].piece) {
            moves.push({ row, col: c });
          } else {
            if (board[row][c].piece!.player !== piece.player) {
              moves.push({ row, col: c });
            }
            break;
          }
          c += dir;
        }
      }
      for (const dir of [-1, 1]) {
        let r = row + dir;
        while (r >= 0 && r < 4) {
          if (!board[r][col].piece) {
            moves.push({ row: r, col });
          } else {
            if (board[r][col].piece!.player !== piece.player) {
              moves.push({ row: r, col });
            }
            break;
          }
          r += dir;
        }
      }
      break;

    case 'bishop':
      const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of diagonals) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < 4 && c >= 0 && c < 4) {
          if (!board[r][c].piece) {
            moves.push({ row: r, col: c });
          } else {
            if (board[r][c].piece!.player !== piece.player) {
              moves.push({ row: r, col: c });
            }
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;

    case 'knight':
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < 4 && c >= 0 && c < 4) {
          if (!board[r][c].piece || board[r][c].piece!.player !== piece.player) {
            moves.push({ row: r, col: c });
          }
        }
      }
      break;

    case 'pawn':
      const direction = piece.player === 'white' ? -1 : 1;
      const forwardRow = row + direction;
      if (forwardRow >= 0 && forwardRow < 4) {
        if (!board[forwardRow][col].piece) {
          moves.push({ row: forwardRow, col });
        }
        for (const dc of [-1, 1]) {
          const captureCol = col + dc;
          if (captureCol >= 0 && captureCol < 4) {
            if (board[forwardRow][captureCol].piece?.player !== piece.player && 
                board[forwardRow][captureCol].piece) {
              moves.push({ row: forwardRow, col: captureCol });
            }
          }
        }
      }
      break;
  }

  return moves;
}

// Check if a position would create a win for a player
function checkWinAtPosition(board: Board, player: 'white' | 'black'): Position[] | null {
  // Check rows
  for (let row = 0; row < 4; row++) {
    if (board[row].every(cell => cell.piece?.player === player)) {
      return board[row].map(cell => cell.position);
    }
  }
  
  // Check columns
  for (let col = 0; col < 4; col++) {
    if ([0, 1, 2, 3].every(row => board[row][col].piece?.player === player)) {
      return [0, 1, 2, 3].map(row => ({ row, col }));
    }
  }
  
  // Check main diagonal
  if ([0, 1, 2, 3].every(i => board[i][i].piece?.player === player)) {
    return [0, 1, 2, 3].map(i => ({ row: i, col: i }));
  }
  
  // Check anti-diagonal
  if ([0, 1, 2, 3].every(i => board[i][3 - i].piece?.player === player)) {
    return [0, 1, 2, 3].map(i => ({ row: i, col: 3 - i }));
  }
  
  return null;
}

// Count pieces in a line for a player
function countInLine(board: Board, line: Position[], player: 'white' | 'black'): number {
  return line.filter(pos => board[pos.row][pos.col].piece?.player === player).length;
}

// Get empty positions in a line
function getEmptyInLine(board: Board, line: Position[]): Position[] {
  return line.filter(pos => !board[pos.row][pos.col].piece);
}

// Puzzle template types for more varied challenges
type PuzzleType = 'move-to-win' | 'capture-and-win' | 'block-and-win' | 'multi-step' | 'sacrifice-puzzle';

interface PuzzleTemplate {
  type: PuzzleType;
  movesToWin: number;
  difficulty: number; // 1-5
}

// Generate a challenging puzzle with multi-step solutions
export function generateDailyPuzzle(seed?: number): DailyPuzzle {
  const puzzleSeed = seed ?? getTodaysPuzzleSeed();
  const random = mulberry32(puzzleSeed);
  const puzzleNumber = getPuzzleNumber();
  const dateString = getESTDateString();
  
  // Vary difficulty based on day of week and puzzle number
  const difficultyLevel = (puzzleNumber % 7) + 1; // 1-7 difficulty cycle
  const movesToWin = Math.min(3, Math.max(2, Math.floor(difficultyLevel / 2) + 1));
  
  // Select puzzle type based on seed
  const puzzleTypeRoll = random();
  let puzzleType: PuzzleType;
  if (puzzleTypeRoll < 0.25) {
    puzzleType = 'move-to-win';
  } else if (puzzleTypeRoll < 0.5) {
    puzzleType = 'capture-and-win';
  } else if (puzzleTypeRoll < 0.75) {
    puzzleType = 'block-and-win';
  } else {
    puzzleType = 'multi-step';
  }
  
  let board = createEmptyBoard();
  let playerReserve: Piece[] = [];
  let hint = '';
  
  // Generate puzzle based on type
  switch (puzzleType) {
    case 'move-to-win':
      ({ board, playerReserve, hint } = generateMoveToWinPuzzle(random, difficultyLevel));
      break;
    case 'capture-and-win':
      ({ board, playerReserve, hint } = generateCaptureAndWinPuzzle(random, difficultyLevel));
      break;
    case 'block-and-win':
      ({ board, playerReserve, hint } = generateBlockAndWinPuzzle(random, difficultyLevel));
      break;
    case 'multi-step':
      ({ board, playerReserve, hint } = generateMultiStepPuzzle(random, difficultyLevel));
      break;
  }
  
  // Count pieces on board
  let whitePieces = 0;
  let blackPieces = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col].piece?.player === 'white') whitePieces++;
      if (board[row][col].piece?.player === 'black') blackPieces++;
    }
  }
  
  return {
    puzzleNumber,
    date: dateString,
    seed: puzzleSeed,
    board,
    playerReserve,
    cpuReserve: [],
    whitePiecesPlaced: whitePieces,
    blackPiecesPlaced: blackPieces,
    movesToWin,
    hint,
  };
}

// Puzzle where you need to move an existing piece to complete a line
function generateMoveToWinPuzzle(random: () => number, difficulty: number): { board: Board; playerReserve: Piece[]; hint: string } {
  const board = createEmptyBoard();
  
  // Choose a target line
  const lines = getAllLines();
  const shuffledLines = shuffleArray(lines, random);
  const targetLine = shuffledLines[0];
  
  // Place 3 white pieces - but one needs to MOVE to the winning position
  // Place 2 in the line, 1 adjacent that can move in
  const linePositions = shuffleArray([...targetLine], random);
  const winningSpot = linePositions[0];
  const filledSpots = linePositions.slice(1, 3);
  
  // Place 2 white pieces in the line
  filledSpots.forEach((pos, idx) => {
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[pos.row][pos.col].piece = createPiece(pieceType, 'white', `w${idx}`);
  });
  
  // Find a position outside the line where we can place a piece that can move to winning spot
  const movablePieceType = findPieceTypeForMove(board, winningSpot, targetLine, random);
  const startPos = findStartPositionForPiece(board, winningSpot, movablePieceType, targetLine, random);
  
  if (startPos) {
    board[startPos.row][startPos.col].piece = createPiece(movablePieceType, 'white', 'w-movable');
  } else {
    // Fallback: place a rook that can reach the winning spot
    const fallbackPos = findAnyEmptyNotInLine(board, targetLine, random);
    if (fallbackPos) {
      board[fallbackPos.row][fallbackPos.col].piece = createPiece('rook', 'white', 'w-movable');
    }
  }
  
  // Add blocking black pieces for complexity
  const numBlackPieces = Math.min(3, 1 + Math.floor(difficulty / 2));
  addBlackPieces(board, numBlackPieces, [winningSpot], random);
  
  // Player may need to place a piece to complete the 4th
  const playerReserve: Piece[] = [];
  if (difficulty >= 4) {
    // Add a reserve piece for harder puzzles
    const reserveType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    playerReserve.push(createPiece(reserveType, 'white', 'w-reserve'));
  }
  
  return {
    board,
    playerReserve,
    hint: 'Move one of your pieces to complete the line!'
  };
}

// Puzzle where you need to capture an enemy piece then complete the line
function generateCaptureAndWinPuzzle(random: () => number, difficulty: number): { board: Board; playerReserve: Piece[]; hint: string } {
  const board = createEmptyBoard();
  
  const lines = getAllLines();
  const shuffledLines = shuffleArray(lines, random);
  const targetLine = shuffledLines[0];
  
  const linePositions = shuffleArray([...targetLine], random);
  const blockedSpot = linePositions[0]; // Black piece blocking
  const winningSpots = linePositions.slice(1, 3); // 2 white pieces in line
  const emptySpot = linePositions[3]; // Empty spot in line
  
  // Place 2 white pieces in line
  winningSpots.forEach((pos, idx) => {
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[pos.row][pos.col].piece = createPiece(pieceType, 'white', `w${idx}`);
  });
  
  // Place black blocking piece
  board[blockedSpot.row][blockedSpot.col].piece = createPiece('pawn', 'black', 'b-blocker');
  
  // Place a white piece that can capture the blocker
  const capturingType = findCaptureType(board, blockedSpot, random);
  const captureStartPos = findCaptureStartPos(board, blockedSpot, capturingType, random);
  
  if (captureStartPos) {
    board[captureStartPos.row][captureStartPos.col].piece = createPiece(capturingType, 'white', 'w-capturer');
  }
  
  // Add more black pieces
  const numBlackPieces = Math.floor(difficulty / 2);
  addBlackPieces(board, numBlackPieces, [blockedSpot, emptySpot], random);
  
  // Player reserve for placing the 4th piece after capture
  const reserveType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
  const playerReserve = [createPiece(reserveType, 'white', 'w-reserve')];
  
  return {
    board,
    playerReserve,
    hint: 'Capture the blocking piece, then complete your line!'
  };
}

// Puzzle where opponent is about to win - you must block AND create your own winning threat
function generateBlockAndWinPuzzle(random: () => number, difficulty: number): { board: Board; playerReserve: Piece[]; hint: string } {
  const board = createEmptyBoard();
  
  const lines = getAllLines();
  const shuffledLines = shuffleArray(lines, random);
  
  // Find two lines that share a cell (intersection point)
  let whiteLine = shuffledLines[0];
  let blackLine = shuffledLines.find(line => 
    line.some(pos => whiteLine.some(wp => wp.row === pos.row && wp.col === pos.col)) &&
    line !== whiteLine
  ) || shuffledLines[1];
  
  // Intersection point
  const intersection = whiteLine.find(pos => 
    blackLine.some(bp => bp.row === pos.row && bp.col === pos.col)
  ) || whiteLine[0];
  
  // Set up black threat: 3 black pieces with intersection as the winning spot
  const blackPositions = blackLine.filter(pos => 
    !(pos.row === intersection.row && pos.col === intersection.col)
  );
  blackPositions.slice(0, 3).forEach((pos, idx) => {
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[pos.row][pos.col].piece = createPiece(pieceType, 'black', `b${idx}`);
  });
  
  // Set up white opportunity: 2 white pieces needing the intersection + one more
  const whitePositions = whiteLine.filter(pos => 
    !(pos.row === intersection.row && pos.col === intersection.col)
  );
  const shuffledWhite = shuffleArray(whitePositions, random);
  shuffledWhite.slice(0, 2).forEach((pos, idx) => {
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[pos.row][pos.col].piece = createPiece(pieceType, 'white', `w${idx}`);
  });
  
  // One white piece that can move to complete the line
  const emptyWhiteSpot = shuffledWhite[2];
  if (emptyWhiteSpot && !board[emptyWhiteSpot.row][emptyWhiteSpot.col].piece) {
    // Find a spot for a movable piece
    const movablePos = findAnyEmpty(board, random);
    if (movablePos) {
      board[movablePos.row][movablePos.col].piece = createPiece('rook', 'white', 'w-movable');
    }
  }
  
  // Give player a reserve piece to place at intersection (blocks black AND completes white line)
  const reserveType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
  const playerReserve = [createPiece(reserveType, 'white', 'w-reserve')];
  
  return {
    board,
    playerReserve,
    hint: 'Block their winning move while setting up your own!'
  };
}

// Complex multi-step puzzle requiring setup moves
function generateMultiStepPuzzle(random: () => number, difficulty: number): { board: Board; playerReserve: Piece[]; hint: string } {
  const board = createEmptyBoard();
  
  const lines = getAllLines();
  const shuffledLines = shuffleArray(lines, random);
  const targetLine = shuffledLines[0];
  
  // Place only 1-2 white pieces in the target line
  const linePositions = shuffleArray([...targetLine], random);
  const numInLine = difficulty >= 5 ? 1 : 2;
  
  linePositions.slice(0, numInLine).forEach((pos, idx) => {
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[pos.row][pos.col].piece = createPiece(pieceType, 'white', `w${idx}`);
  });
  
  // Place white pieces OUTSIDE the line that need to move in
  const emptyLineSpots = linePositions.slice(numInLine);
  const numMovers = Math.min(emptyLineSpots.length, 4 - numInLine - 1); // Leave room for reserve
  
  for (let i = 0; i < numMovers; i++) {
    const targetSpot = emptyLineSpots[i];
    const moverPos = findPositionToMoveFrom(board, targetSpot, random);
    if (moverPos) {
      const pieceType = findPieceTypeForMove(board, targetSpot, [], random);
      board[moverPos.row][moverPos.col].piece = createPiece(pieceType, 'white', `w-mover-${i}`);
    }
  }
  
  // Add black pieces to complicate
  const numBlackPieces = 2 + Math.floor(difficulty / 2);
  addBlackPieces(board, numBlackPieces, emptyLineSpots, random);
  
  // Give player pieces to place
  const numReserve = 4 - numInLine - numMovers;
  const playerReserve: Piece[] = [];
  for (let i = 0; i < Math.max(1, numReserve); i++) {
    const reserveType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    playerReserve.push(createPiece(reserveType, 'white', `w-reserve-${i}`));
  }
  
  return {
    board,
    playerReserve,
    hint: 'Plan your moves carefully - multiple pieces need to work together!'
  };
}

// Helper functions

function getAllLines(): Position[][] {
  const lines: Position[][] = [];
  
  // Rows
  for (let row = 0; row < 4; row++) {
    lines.push([0, 1, 2, 3].map(col => ({ row, col })));
  }
  
  // Columns
  for (let col = 0; col < 4; col++) {
    lines.push([0, 1, 2, 3].map(row => ({ row, col })));
  }
  
  // Diagonals
  lines.push([0, 1, 2, 3].map(i => ({ row: i, col: i })));
  lines.push([0, 1, 2, 3].map(i => ({ row: i, col: 3 - i })));
  
  return lines;
}

function shuffleArray<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function findPieceTypeForMove(board: Board, target: Position, excludePositions: Position[], random: () => number): PieceType {
  // Rook is most flexible for horizontal/vertical
  if (random() < 0.4) return 'rook';
  
  // Bishop for diagonal lines
  if (target.row === target.col || target.row + target.col === 3) {
    if (random() < 0.5) return 'bishop';
  }
  
  // Knight for tricky positions
  if (random() < 0.3) return 'knight';
  
  return 'rook';
}

function findStartPositionForPiece(board: Board, target: Position, pieceType: PieceType, excludeLine: Position[], random: () => number): Position | null {
  const candidates: Position[] = [];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col].piece) continue;
      if (row === target.row && col === target.col) continue;
      if (excludeLine.some(p => p.row === row && p.col === col)) continue;
      
      // Check if this piece type can reach the target
      const testPiece = createPiece(pieceType, 'white', 'test');
      const testBoard = cloneBoard(board);
      testBoard[row][col].piece = testPiece;
      
      const moves = getValidMoves(testPiece, { row, col }, testBoard);
      if (moves.some(m => m.row === target.row && m.col === target.col)) {
        candidates.push({ row, col });
      }
    }
  }
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}

function findAnyEmptyNotInLine(board: Board, line: Position[], random: () => number): Position | null {
  const candidates: Position[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col].piece && !line.some(p => p.row === row && p.col === col)) {
        candidates.push({ row, col });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}

function findAnyEmpty(board: Board, random: () => number): Position | null {
  const candidates: Position[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!board[row][col].piece) {
        candidates.push({ row, col });
      }
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}

function addBlackPieces(board: Board, count: number, excludePositions: Position[], random: () => number): void {
  let added = 0;
  const attempts = 20;
  
  for (let i = 0; i < attempts && added < count; i++) {
    const row = Math.floor(random() * 4);
    const col = Math.floor(random() * 4);
    
    if (board[row][col].piece) continue;
    if (excludePositions.some(p => p.row === row && p.col === col)) continue;
    
    const pieceType = PIECE_TYPES[Math.floor(random() * PIECE_TYPES.length)];
    board[row][col].piece = createPiece(pieceType, 'black', `b-extra-${added}`);
    added++;
  }
}

function findCaptureType(board: Board, target: Position, random: () => number): PieceType {
  // Rook can capture along row/col
  if (random() < 0.4) return 'rook';
  // Bishop for diagonals
  if (random() < 0.5) return 'bishop';
  // Knight for L-shape captures
  return 'knight';
}

function findCaptureStartPos(board: Board, target: Position, pieceType: PieceType, random: () => number): Position | null {
  const candidates: Position[] = [];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col].piece) continue;
      if (row === target.row && col === target.col) continue;
      
      const testPiece = createPiece(pieceType, 'white', 'test');
      const testBoard = cloneBoard(board);
      testBoard[row][col].piece = testPiece;
      
      const moves = getValidMoves(testPiece, { row, col }, testBoard);
      if (moves.some(m => m.row === target.row && m.col === target.col)) {
        candidates.push({ row, col });
      }
    }
  }
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}

function findPositionToMoveFrom(board: Board, target: Position, random: () => number): Position | null {
  // Find a position that a rook or bishop could move from
  const candidates: Position[] = [];
  
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col].piece) continue;
      if (row === target.row && col === target.col) continue;
      
      // Check if reachable by rook
      if (row === target.row || col === target.col) {
        candidates.push({ row, col });
      }
      // Check if reachable by bishop
      if (Math.abs(row - target.row) === Math.abs(col - target.col)) {
        candidates.push({ row, col });
      }
    }
  }
  
  if (candidates.length === 0) return null;
  return candidates[Math.floor(random() * candidates.length)];
}

export const useDailyPuzzle = () => {
  const puzzle = useMemo(() => generateDailyPuzzle(), []);
  return puzzle;
};
