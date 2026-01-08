import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDailyPuzzleStats } from '@/hooks/useDailyPuzzleStats';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useHaptics } from '@/hooks/useHaptics';
import { useGameState } from '@/hooks/useGameState';
import { useGameAI } from '@/hooks/useGameAI';
import { GameBoard } from '@/components/game/GameBoard';
import { PieceRack } from '@/components/game/PieceRack';
import { Piece, Position } from '@/types/game';
import { ArrowLeft, Calendar, CheckCircle2, Flame, RotateCcw, Clock, XCircle } from 'lucide-react';

const TOTAL_TIME = 30; // 30 seconds

const DailyPuzzle = () => {
  const navigate = useNavigate();
  const { stats, isTodayCompleted, markCompleted } = useDailyPuzzleStats();
  const { playSound } = useSoundEffects();
  const { vibrate } = useHaptics();
  const { getBestMove } = useGameAI();
  
  const { gameState, selectPiece, deselectPiece, makeMove, resetGame, getValidMoves } = useGameState('ai', 'hard');
  
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(isTodayCompleted());
  const [hasLost, setHasLost] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const aiThinkingRef = useRef(false);

  // Get today's puzzle number
  const getPuzzleNumber = () => {
    const startDate = new Date('2024-01-01');
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const puzzleNumber = getPuzzleNumber();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Timer logic - only runs when it's white's turn (player)
  useEffect(() => {
    if (gameOver || hasWon || hasLost) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (gameState.currentPlayer === 'white' && !gameState.winner) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameOver(true);
            setHasLost(true);
            playSound('capture');
            vibrate('win');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.currentPlayer, gameState.winner, gameOver, hasWon, hasLost, playSound, vibrate]);

  // Check for win/loss
  useEffect(() => {
    if (gameState.winner === 'white') {
      setHasWon(true);
      setGameOver(true);
      markCompleted();
      playSound('win');
      vibrate('win');
    } else if (gameState.winner === 'black') {
      setHasLost(true);
      setGameOver(true);
      playSound('capture');
      vibrate('win');
    }
  }, [gameState.winner, markCompleted, playSound, vibrate]);

  // AI move logic
  useEffect(() => {
    if (gameState.currentPlayer === 'black' && !gameState.winner && !gameOver && !aiThinkingRef.current) {
      aiThinkingRef.current = true;
      
      const aiTimeout = setTimeout(() => {
        const aiMove = getBestMove(
          gameState.board,
          'black',
          gameState.blackReserve,
          gameState.phase,
          'hard',
          getValidMoves
        );

        if (aiMove) {
          selectPiece(aiMove.piece, aiMove.from);
          
          setTimeout(() => {
            makeMove(aiMove.to);
            playSound(aiMove.from ? 'place' : 'place');
            vibrate('place');
            aiThinkingRef.current = false;
          }, 300);
        } else {
          aiThinkingRef.current = false;
        }
      }, 500);

      return () => clearTimeout(aiTimeout);
    }
  }, [gameState.currentPlayer, gameState.winner, gameState.board, gameState.blackReserve, gameState.phase, gameOver, getBestMove, getValidMoves, selectPiece, makeMove, playSound, vibrate]);

  const handlePieceSelect = useCallback((piece: Piece) => {
    if (gameState.currentPlayer !== 'white' || gameOver) return;
    playSound('select');
    vibrate('select');
    selectPiece(piece, null);
  }, [gameState.currentPlayer, gameOver, selectPiece, playSound, vibrate]);

  const handleCellClick = useCallback((position: Position) => {
    if (gameState.currentPlayer !== 'white' || gameOver) return;

    const clickedCell = gameState.board[position.row][position.col];

    // If clicking on own piece, select it
    if (clickedCell.piece?.player === 'white') {
      playSound('select');
      vibrate('select');
      selectPiece(clickedCell.piece, position);
      return;
    }

    // If a piece is selected and clicking on valid move
    if (gameState.selectedPiece) {
      const isValidMove = gameState.validMoves.some(
        m => m.row === position.row && m.col === position.col
      );

      if (isValidMove) {
        const result = makeMove(position);
        playSound(result.captured ? 'capture' : 'place');
        vibrate('place');
      } else {
        deselectPiece();
      }
    }
  }, [gameState, gameOver, selectPiece, deselectPiece, makeMove, playSound, vibrate]);

  const handleReset = useCallback(() => {
    resetGame('ai', 'hard');
    setTimeRemaining(TOTAL_TIME);
    setGameOver(false);
    setHasWon(false);
    setHasLost(false);
    aiThinkingRef.current = false;
  }, [resetGame]);

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 5) return 'text-red-500';
    if (timeRemaining <= 10) return 'text-yellow-500';
    return 'text-accent';
  };

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

        {/* Challenge Info */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-accent">
              <Calendar className="h-5 w-5" />
              <span className="font-display text-xl">Daily Challenge #{puzzleNumber}</span>
            </div>
            <p className="text-sm text-muted-foreground">{today}</p>
            
            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 mt-3 ${getTimerColor()}`}>
              <Clock className="h-6 w-6" />
              <span className="font-display text-3xl font-bold">{formatTime(timeRemaining)}</span>
            </div>
            
            {hasWon && (
              <div className="flex items-center justify-center gap-2 text-green-500 mt-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-display">Victory!</span>
              </div>
            )}
            
            {hasLost && (
              <div className="flex items-center justify-center gap-2 text-red-500 mt-2">
                <XCircle className="h-5 w-5" />
                <span className="font-display">{timeRemaining <= 0 ? 'Time\'s Up!' : 'Defeated!'}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        {!gameOver && (
          <p className="text-center text-muted-foreground text-sm">
            {gameState.currentPlayer === 'white' 
              ? 'Your turn! Win before time runs out!' 
              : 'Opponent is thinking...'}
          </p>
        )}

        {/* Player Reserve */}
        {gameState.whiteReserve.length > 0 && !gameOver && (
          <div className="flex justify-center">
            <PieceRack
              pieces={gameState.whiteReserve}
              player="white"
              isCurrentPlayer={gameState.currentPlayer === 'white'}
              onPieceSelect={handlePieceSelect}
              selectedPieceId={gameState.selectedPiece?.piece.id}
              label="Your Pieces"
            />
          </div>
        )}

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            board={gameState.board}
            validMoves={gameState.validMoves}
            selectedPosition={gameState.selectedPiece?.position}
            winningLine={gameState.winningLine}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Opponent Reserve */}
        {gameState.blackReserve.length > 0 && !gameOver && (
          <div className="flex justify-center opacity-60">
            <PieceRack
              pieces={gameState.blackReserve}
              player="black"
              isCurrentPlayer={false}
              onPieceSelect={() => {}}
              label="Opponent"
            />
          </div>
        )}

        {/* Reset Button */}
        {!gameOver && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </div>
        )}

        {/* Game Over Actions */}
        {gameOver && (
          <div className="space-y-2">
            <Button
              onClick={handleReset}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/game?mode=ai&difficulty=hard')}
              className="w-full"
            >
              Play Untimed Game
            </Button>
            <Button
              variant="ghost"
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
              <div className="text-xs text-muted-foreground">Wins</div>
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
