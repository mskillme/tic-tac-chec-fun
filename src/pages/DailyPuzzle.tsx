import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDailyPuzzle } from '@/hooks/useDailyPuzzle';
import { useDailyPuzzleStats } from '@/hooks/useDailyPuzzleStats';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { GameBoard } from '@/components/game/GameBoard';
import { PieceRack } from '@/components/game/PieceRack';
import { Board, Piece, Position } from '@/types/game';
import { ArrowLeft, Calendar, CheckCircle2, Flame, Lightbulb, RotateCcw } from 'lucide-react';

const DailyPuzzle = () => {
  const navigate = useNavigate();
  const puzzle = useDailyPuzzle();
  const { stats, isTodayCompleted, markCompleted } = useDailyPuzzleStats();
  const { playSound } = useSoundEffects();
  const { vibrate } = useHaptics();

  const [board, setBoard] = useState<Board>(puzzle.board);
  const [playerReserve, setPlayerReserve] = useState<Piece[]>(puzzle.playerReserve);
  const [selectedPiece, setSelectedPiece] = useState<{ piece: Piece; position: Position | null } | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [solved, setSolved] = useState(isTodayCompleted());
  const [showHint, setShowHint] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  // Check for win condition
  const checkWinner = useCallback((currentBoard: Board): Position[] | null => {
    // Check rows
    for (let row = 0; row < 4; row++) {
      const pieces = currentBoard[row].map(cell => cell.piece);
      if (pieces.every(p => p?.player === 'white')) {
        return currentBoard[row].map(cell => cell.position);
      }
    }

    // Check columns
    for (let col = 0; col < 4; col++) {
      const pieces = [0, 1, 2, 3].map(row => currentBoard[row][col].piece);
      if (pieces.every(p => p?.player === 'white')) {
        return [0, 1, 2, 3].map(row => currentBoard[row][col].position);
      }
    }

    // Check main diagonal
    const mainDiag = [0, 1, 2, 3].map(i => currentBoard[i][i].piece);
    if (mainDiag.every(p => p?.player === 'white')) {
      return [0, 1, 2, 3].map(i => currentBoard[i][i].position);
    }

    // Check anti-diagonal
    const antiDiag = [0, 1, 2, 3].map(i => currentBoard[i][3 - i].piece);
    if (antiDiag.every(p => p?.player === 'white')) {
      return [0, 1, 2, 3].map(i => currentBoard[i][3 - i].position);
    }

    return null;
  }, []);

  const [winningLine, setWinningLine] = useState<Position[] | null>(null);

  // Get valid moves for piece - supports both placement and movement
  const getValidMoves = useCallback((piece: Piece, from: Position | null, currentBoard: Board): Position[] => {
    const moves: Position[] = [];
    
    // Placing from reserve - all empty cells are valid
    if (!from) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!currentBoard[row][col].piece) {
            moves.push({ row, col });
          }
        }
      }
      return moves;
    }
    
    // Moving a piece on the board - use chess movement rules
    const { row, col } = from;

    switch (piece.type) {
      case 'rook':
        for (const dir of [-1, 1]) {
          let c = col + dir;
          while (c >= 0 && c < 4) {
            if (!currentBoard[row][c].piece) {
              moves.push({ row, col: c });
            } else {
              if (currentBoard[row][c].piece!.player !== piece.player) {
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
            if (!currentBoard[r][col].piece) {
              moves.push({ row: r, col });
            } else {
              if (currentBoard[r][col].piece!.player !== piece.player) {
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
            if (!currentBoard[r][c].piece) {
              moves.push({ row: r, col: c });
            } else {
              if (currentBoard[r][c].piece!.player !== piece.player) {
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
            if (!currentBoard[r][c].piece || currentBoard[r][c].piece!.player !== piece.player) {
              moves.push({ row: r, col: c });
            }
          }
        }
        break;

      case 'pawn':
        const direction = piece.player === 'white' ? -1 : 1;
        const forwardRow = row + direction;
        if (forwardRow >= 0 && forwardRow < 4) {
          if (!currentBoard[forwardRow][col].piece) {
            moves.push({ row: forwardRow, col });
          }
          for (const dc of [-1, 1]) {
            const captureCol = col + dc;
            if (captureCol >= 0 && captureCol < 4) {
              if (currentBoard[forwardRow][captureCol].piece?.player !== piece.player &&
                  currentBoard[forwardRow][captureCol].piece) {
                moves.push({ row: forwardRow, col: captureCol });
              }
            }
          }
        }
        break;
    }
    
    return moves;
  }, []);

  const handleSelectPieceFromRack = useCallback((piece: Piece) => {
    if (solved) return;
    
    playSound('select');
    vibrate('select');
    setSelectedPiece({ piece, position: null });
    setValidMoves(getValidMoves(piece, null, board));
  }, [board, getValidMoves, playSound, vibrate, solved]);

  // Handle selecting a piece on the board for movement
  const handleBoardPieceSelect = useCallback((position: Position) => {
    if (solved) return;
    
    const piece = board[position.row][position.col].piece;
    if (!piece || piece.player !== 'white') return;
    
    playSound('select');
    vibrate('select');
    setSelectedPiece({ piece, position });
    setValidMoves(getValidMoves(piece, position, board));
  }, [board, getValidMoves, playSound, vibrate, solved]);

  const handleCellClick = useCallback((position: Position) => {
    if (solved) return;
    
    const clickedCell = board[position.row][position.col];
    
    // If clicking on a white piece (not already selected), select it for movement
    if (clickedCell.piece?.player === 'white' && 
        (!selectedPiece || selectedPiece.position?.row !== position.row || selectedPiece.position?.col !== position.col)) {
      handleBoardPieceSelect(position);
      return;
    }
    
    if (selectedPiece && validMoves.some(m => m.row === position.row && m.col === position.col)) {
      const newBoard = board.map(row => row.map(cell => ({ ...cell, piece: cell.piece ? { ...cell.piece } : null })));
      
      // Handle capture - captured piece goes back to opponent (just remove for puzzle)
      const capturedPiece = newBoard[position.row][position.col].piece;
      
      // Remove piece from old position if moving on board
      if (selectedPiece.position) {
        newBoard[selectedPiece.position.row][selectedPiece.position.col].piece = null;
      } else {
        // Remove from reserve if placing
        setPlayerReserve(prev => prev.filter(p => p.id !== selectedPiece.piece.id));
      }
      
      // Place piece at new position
      newBoard[position.row][position.col].piece = selectedPiece.piece;
      
      setBoard(newBoard);
      setSelectedPiece(null);
      setValidMoves([]);
      setMoveCount(prev => prev + 1);
      
      playSound(capturedPiece ? 'capture' : 'place');
      vibrate('place');
      
      // Check for win
      const winLine = checkWinner(newBoard);
      if (winLine) {
        setWinningLine(winLine);
        setSolved(true);
        markCompleted();
        playSound('win');
        vibrate('win');
      }
    } else {
      // Deselect
      setSelectedPiece(null);
      setValidMoves([]);
    }
  }, [board, selectedPiece, validMoves, checkWinner, markCompleted, playSound, vibrate, solved, handleBoardPieceSelect]);

  const handleReset = useCallback(() => {
    setBoard(puzzle.board);
    setPlayerReserve(puzzle.playerReserve);
    setSelectedPiece(null);
    setValidMoves([]);
    setWinningLine(null);
    setMoveCount(0);
    // Don't reset solved state - once completed, stay completed
  }, [puzzle]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 wood-grain">
      <div className="max-w-md w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1 text-accent">
              <Flame className="h-4 w-4" />
              <span className="font-display text-sm">{stats.currentStreak} day streak</span>
            </div>
          )}
        </div>

        {/* Puzzle Info */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-accent">
              <Calendar className="h-5 w-5" />
              <span className="font-display text-xl">Daily Puzzle #{puzzle.puzzleNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground">{puzzle.date}</p>
            {solved && (
              <div className="flex items-center justify-center gap-2 text-green-500 mt-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-display">Solved!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <p className="text-center text-muted-foreground text-sm">
          {playerReserve.length > 0 
            ? 'Place or move your pieces to complete a line of 4!'
            : 'Move your pieces strategically to complete a line of 4!'}
        </p>

        {/* Player Reserve */}
        {playerReserve.length > 0 && !solved && (
          <div className="flex justify-center">
            <PieceRack
              pieces={playerReserve}
              player="white"
              isCurrentPlayer={true}
              onPieceSelect={handleSelectPieceFromRack}
              selectedPieceId={selectedPiece?.piece.id}
              label="Your Piece"
            />
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            board={board}
            validMoves={validMoves}
            selectedPosition={selectedPiece?.position}
            winningLine={winningLine}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2">
          {!solved && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-muted-foreground"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Hint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </>
          )}
        </div>

        {/* Hint */}
        {showHint && !solved && puzzle.hint && (
          <Card className="bg-accent/10 border-accent/30">
            <CardContent className="p-3 text-center">
              <p className="text-sm text-accent">{puzzle.hint}</p>
            </CardContent>
          </Card>
        )}

        {/* Victory Actions */}
        {solved && (
          <div className="space-y-2">
            <Button
              onClick={() => navigate('/game?mode=ai&difficulty=hard')}
              className="w-full"
            >
              Play Full Game
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Menu
            </Button>
          </div>
        )}

        {/* Stats */}
        <Card className="bg-card/60 border-border">
          <CardContent className="p-3 flex justify-around text-center text-sm">
            <div>
              <div className="font-display text-lg text-foreground">{stats.totalSolved}</div>
              <div className="text-xs text-muted-foreground">Solved</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-lg text-accent">{stats.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-lg text-accent">{stats.bestStreak}</div>
              <div className="text-xs text-muted-foreground">Best</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyPuzzle;
