import { useCallback } from 'react';
import { Board, Piece, Position, Difficulty, Player } from '@/types/game';

interface AIMove {
  piece: Piece;
  from: Position | null;
  to: Position;
  score: number;
}

export const useGameAI = () => {
  const evaluatePosition = useCallback((board: Board, player: Player): number => {
    let score = 0;
    const opponent = player === 'white' ? 'black' : 'white';

    // Check lines for threats and opportunities
    const lines = [
      // Rows
      ...Array(4).fill(null).map((_, row) => 
        Array(4).fill(null).map((_, col) => ({ row, col }))
      ),
      // Columns
      ...Array(4).fill(null).map((_, col) => 
        Array(4).fill(null).map((_, row) => ({ row, col }))
      ),
      // Diagonals
      [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }],
      [{ row: 0, col: 3 }, { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 3, col: 0 }],
    ];

    for (const line of lines) {
      let playerCount = 0;
      let opponentCount = 0;
      let emptyCount = 0;

      for (const pos of line) {
        const piece = board[pos.row][pos.col].piece;
        if (!piece) {
          emptyCount++;
        } else if (piece.player === player) {
          playerCount++;
        } else {
          opponentCount++;
        }
      }

      // Scoring based on line control - prioritize WINNING over blocking
      if (opponentCount === 0) {
        if (playerCount === 4) score += 10000; // Win - highest priority!
        else if (playerCount === 3) score += 200; // One move from winning - very high priority
        else if (playerCount === 2) score += 20;
        else if (playerCount === 1) score += 3;
      }
      
      if (playerCount === 0) {
        if (opponentCount === 4) score -= 10000; // Loss
        else if (opponentCount === 3) score -= 150; // Block threat - important but less than our win
        else if (opponentCount === 2) score -= 15;
        else if (opponentCount === 1) score -= 2;
      }
    }

    // Center control bonus
    const centerSquares = [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 2, col: 2 }];
    for (const pos of centerSquares) {
      const piece = board[pos.row][pos.col].piece;
      if (piece?.player === player) score += 5;
      else if (piece?.player === opponent) score -= 5;
    }

    return score;
  }, []);

  const getAllMoves = useCallback((
    board: Board,
    player: Player,
    reserve: Piece[],
    phase: 'placement' | 'movement',
    getValidMoves: (piece: Piece, from: Position | null, board: Board, phase: 'placement' | 'movement') => Position[]
  ): AIMove[] => {
    const moves: AIMove[] = [];

    if (phase === 'placement' && reserve.length > 0) {
      // Placement moves from reserve
      for (const piece of reserve) {
        const validMoves = getValidMoves(piece, null, board, phase);
        for (const to of validMoves) {
          moves.push({ piece, from: null, to, score: 0 });
        }
      }
    }

    // Movement moves (also allowed during placement for pieces already on board)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const piece = board[row][col].piece;
        if (piece && piece.player === player) {
          const from = { row, col };
          const validMoves = getValidMoves(piece, from, board, 'movement');
          for (const to of validMoves) {
            moves.push({ piece, from, to, score: 0 });
          }
        }
      }
    }

    return moves;
  }, []);

  const simulateMove = useCallback((board: Board, move: AIMove): Board => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
    
    if (move.from) {
      newBoard[move.from.row][move.from.col].piece = null;
    }
    newBoard[move.to.row][move.to.col].piece = { ...move.piece };
    
    return newBoard;
  }, []);

  const isWinningMove = useCallback((board: Board, move: AIMove, player: Player): boolean => {
    const simulatedBoard = simulateMove(board, move);
    
    // Check all lines for 4 in a row
    const lines = [
      // Rows
      ...Array(4).fill(null).map((_, row) => 
        Array(4).fill(null).map((_, col) => ({ row, col }))
      ),
      // Columns
      ...Array(4).fill(null).map((_, col) => 
        Array(4).fill(null).map((_, row) => ({ row, col }))
      ),
      // Diagonals
      [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }, { row: 3, col: 3 }],
      [{ row: 0, col: 3 }, { row: 1, col: 2 }, { row: 2, col: 1 }, { row: 3, col: 0 }],
    ];

    for (const line of lines) {
      let count = 0;
      for (const pos of line) {
        const piece = simulatedBoard[pos.row][pos.col].piece;
        if (piece?.player === player) count++;
      }
      if (count === 4) return true;
    }
    return false;
  }, [simulateMove]);

  const getBestMove = useCallback((
    board: Board,
    player: Player,
    reserve: Piece[],
    phase: 'placement' | 'movement',
    difficulty: Difficulty,
    getValidMoves: (piece: Piece, from: Position | null, board: Board, phase: 'placement' | 'movement') => Position[]
  ): AIMove | null => {
    const moves = getAllMoves(board, player, reserve, phase, getValidMoves);
    
    if (moves.length === 0) return null;

    // ALWAYS check for winning moves first - take them immediately regardless of difficulty
    for (const move of moves) {
      if (isWinningMove(board, move, player)) {
        return move;
      }
    }

    // Score all moves
    for (const move of moves) {
      const simulatedBoard = simulateMove(board, move);
      move.score = evaluatePosition(simulatedBoard, player);
      
      // Add some randomness based on difficulty
      const randomFactor = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 20 : 5;
      move.score += (Math.random() - 0.5) * randomFactor;
    }

    // Sort by score
    moves.sort((a, b) => b.score - a.score);

    // Select move based on difficulty
    let selectedIndex = 0;
    
    if (difficulty === 'easy') {
      // Sometimes pick suboptimal moves
      if (Math.random() < 0.4) {
        selectedIndex = Math.min(Math.floor(Math.random() * 3), moves.length - 1);
      }
    } else if (difficulty === 'medium') {
      // Occasionally pick second-best
      if (Math.random() < 0.2 && moves.length > 1) {
        selectedIndex = 1;
      }
    }
    // Hard: always pick best move

    return moves[selectedIndex];
  }, [getAllMoves, simulateMove, evaluatePosition, isWinningMove]);

  return { getBestMove };
};
