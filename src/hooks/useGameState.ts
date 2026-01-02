import { useState, useCallback } from 'react';
import { Board, BoardCell, Piece, PieceType, Player, Position, GameState, GameMode, Difficulty, Move } from '@/types/game';

const PIECE_TYPES: PieceType[] = ['rook', 'bishop', 'knight', 'pawn'];

const createInitialPieces = (player: Player): Piece[] => {
  return PIECE_TYPES.map((type) => ({
    type,
    player,
    id: `${player}-${type}`,
  }));
};

const createEmptyBoard = (): Board => {
  const board: Board = [];
  for (let row = 0; row < 4; row++) {
    const boardRow: BoardCell[] = [];
    for (let col = 0; col < 4; col++) {
      boardRow.push({
        piece: null,
        position: { row, col },
      });
    }
    board.push(boardRow);
  }
  return board;
};

const initialGameState = (mode: GameMode, difficulty: Difficulty): GameState => ({
  board: createEmptyBoard(),
  currentPlayer: 'white',
  phase: 'placement',
  whitePiecesPlaced: 0,
  blackPiecesPlaced: 0,
  whiteReserve: createInitialPieces('white'),
  blackReserve: createInitialPieces('black'),
  selectedPiece: null,
  validMoves: [],
  winner: null,
  winningLine: null,
  gameMode: mode,
  difficulty,
  moveHistory: [],
});

export const useGameState = (mode: GameMode = 'local', difficulty: Difficulty = 'medium') => {
  const [gameState, setGameState] = useState<GameState>(() => initialGameState(mode, difficulty));

  const getValidMoves = useCallback((piece: Piece, from: Position | null, board: Board, phase: 'placement' | 'movement'): Position[] => {
    const moves: Position[] = [];

    if (phase === 'placement' || from === null) {
      // During placement, any empty cell is valid
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!board[row][col].piece) {
            moves.push({ row, col });
          }
        }
      }
      return moves;
    }

    // Movement phase - use chess movement rules
    const { row, col } = from;

    switch (piece.type) {
      case 'rook':
        // Horizontal moves (along row)
        for (const dir of [-1, 1]) {
          let c = col + dir;
          while (c >= 0 && c < 4) {
            const target = board[row][c];
            if (!target.piece) {
              moves.push({ row, col: c });
            } else {
              if (target.piece.player !== piece.player) {
                moves.push({ row, col: c });
              }
              break; // Stop at any piece (can't move through)
            }
            c += dir;
          }
        }
        // Vertical moves (along column)
        for (const dir of [-1, 1]) {
          let r = row + dir;
          while (r >= 0 && r < 4) {
            const target = board[r][col];
            if (!target.piece) {
              moves.push({ row: r, col });
            } else {
              if (target.piece.player !== piece.player) {
                moves.push({ row: r, col });
              }
              break; // Stop at any piece (can't move through)
            }
            r += dir;
          }
        }
        break;

      case 'bishop':
        // Diagonal moves
        const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of diagonals) {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 4 && c >= 0 && c < 4) {
            const target = board[r][c];
            if (!target.piece) {
              moves.push({ row: r, col: c });
            } else {
              if (target.piece.player !== piece.player) {
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
        // L-shaped moves
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightMoves) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 4 && c >= 0 && c < 4) {
            const target = board[r][c];
            if (!target.piece || target.piece.player !== piece.player) {
              moves.push({ row: r, col: c });
            }
          }
        }
        break;

      case 'pawn':
        // Move one square in any direction (simplified for 4x4 board)
        const pawnMoves = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
        for (const [dr, dc] of pawnMoves) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < 4 && c >= 0 && c < 4) {
            const target = board[r][c];
            if (!target.piece || target.piece.player !== piece.player) {
              moves.push({ row: r, col: c });
            }
          }
        }
        break;
    }

    return moves;
  }, []);

  const checkWinner = useCallback((board: Board): { winner: Player | null; winningLine: Position[] | null } => {
    // Check rows
    for (let row = 0; row < 4; row++) {
      const first = board[row][0].piece;
      if (first && board[row].every(cell => cell.piece?.player === first.player)) {
        return {
          winner: first.player,
          winningLine: [0, 1, 2, 3].map(col => ({ row, col }))
        };
      }
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
      const first = board[0][col].piece;
      if (first && [0, 1, 2, 3].every(row => board[row][col].piece?.player === first.player)) {
        return {
          winner: first.player,
          winningLine: [0, 1, 2, 3].map(row => ({ row, col }))
        };
      }
    }

    // Check diagonals
    const topLeft = board[0][0].piece;
    if (topLeft && [0, 1, 2, 3].every(i => board[i][i].piece?.player === topLeft.player)) {
      return {
        winner: topLeft.player,
        winningLine: [0, 1, 2, 3].map(i => ({ row: i, col: i }))
      };
    }

    const topRight = board[0][3].piece;
    if (topRight && [0, 1, 2, 3].every(i => board[i][3 - i].piece?.player === topRight.player)) {
      return {
        winner: topRight.player,
        winningLine: [0, 1, 2, 3].map(i => ({ row: i, col: 3 - i }))
      };
    }

    return { winner: null, winningLine: null };
  }, []);

  const selectPiece = useCallback((piece: Piece, position: Position | null) => {
    setGameState(prev => {
      const validMoves = getValidMoves(piece, position, prev.board, prev.phase);
      return {
        ...prev,
        selectedPiece: { piece, position },
        validMoves,
      };
    });
  }, [getValidMoves]);

  const deselectPiece = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedPiece: null,
      validMoves: [],
    }));
  }, []);

  const makeMove = useCallback((to: Position): { success: boolean; captured?: Piece } => {
    let capturedPiece: Piece | undefined;
    let moveSuccess = false;

    setGameState(prev => {
      if (!prev.selectedPiece || prev.winner) return prev;

      const { piece, position: from } = prev.selectedPiece;
      const isValidMove = prev.validMoves.some(m => m.row === to.row && m.col === to.col);
      
      if (!isValidMove) return prev;

      const newBoard = prev.board.map(row => row.map(cell => ({ ...cell })));
      
      // Handle capture
      capturedPiece = newBoard[to.row][to.col].piece || undefined;
      
      // Remove piece from old position if moving
      if (from) {
        newBoard[from.row][from.col].piece = null;
      }
      
      // Place piece at new position
      newBoard[to.row][to.col].piece = piece;

      // Update reserves
      let newWhiteReserve = [...prev.whiteReserve];
      let newBlackReserve = [...prev.blackReserve];
      let newWhitePlaced = prev.whitePiecesPlaced;
      let newBlackPlaced = prev.blackPiecesPlaced;

      if (from === null) {
        // Placing from reserve
        if (piece.player === 'white') {
          newWhiteReserve = newWhiteReserve.filter(p => p.id !== piece.id);
          newWhitePlaced++;
        } else {
          newBlackReserve = newBlackReserve.filter(p => p.id !== piece.id);
          newBlackPlaced++;
        }
      }

      // Return captured piece to opponent's reserve
      if (capturedPiece) {
        if (capturedPiece.player === 'white') {
          newWhiteReserve.push(capturedPiece);
          newWhitePlaced--;
        } else {
          newBlackReserve.push(capturedPiece);
          newBlackPlaced--;
        }
      }

      // Determine new phase
      const totalPlaced = newWhitePlaced + newBlackPlaced;
      const newPhase = totalPlaced >= 6 ? 'movement' : 'placement';

      // Check for winner
      const { winner, winningLine } = checkWinner(newBoard);

      const move: Move = { piece, from, to, captured: capturedPiece };

      moveSuccess = true;

      return {
        ...prev,
        board: newBoard,
        currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
        phase: newPhase,
        whitePiecesPlaced: newWhitePlaced,
        blackPiecesPlaced: newBlackPlaced,
        whiteReserve: newWhiteReserve,
        blackReserve: newBlackReserve,
        selectedPiece: null,
        validMoves: [],
        winner,
        winningLine,
        moveHistory: [...prev.moveHistory, move],
      };
    });

    return { success: moveSuccess, captured: capturedPiece };
  }, [checkWinner]);

  const resetGame = useCallback((newMode?: GameMode, newDifficulty?: Difficulty) => {
    setGameState(initialGameState(
      newMode ?? gameState.gameMode,
      newDifficulty ?? gameState.difficulty
    ));
  }, [gameState.gameMode, gameState.difficulty]);

  return {
    gameState,
    selectPiece,
    deselectPiece,
    makeMove,
    resetGame,
    getValidMoves,
  };
};
