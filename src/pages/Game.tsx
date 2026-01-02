import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGameState } from '@/hooks/useGameState';
import { useGameAI } from '@/hooks/useGameAI';
import { useGameStats } from '@/hooks/useGameStats';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { GameBoard } from '@/components/game/GameBoard';
import { PieceRack } from '@/components/game/PieceRack';
import { GameStatus } from '@/components/game/GameStatus';
import { GameControls } from '@/components/game/GameControls';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Position, GameMode, Difficulty } from '@/types/game';

const Game = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') as GameMode) || 'local';
  const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';

  const { gameState, selectPiece, deselectPiece, makeMove, resetGame, getValidMoves } = useGameState(mode, difficulty);
  const { getBestMove } = useGameAI();
  const { recordGame } = useGameStats();
  const { playSound, setEnabled, isEnabled } = useSoundEffects();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [turnTime, setTurnTime] = useState(0);
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiExecuteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartRef = useRef<number>(Date.now());
  const forceAIMoveRef = useRef<boolean>(false);
  const pendingAIMoveRef = useRef<ReturnType<typeof getBestMove>>(null);

  const isPlayerTurn = mode === 'local' || gameState.currentPlayer === 'white';

  // Reset turn timer when player changes
  useEffect(() => {
    turnStartRef.current = Date.now();
    setTurnTime(0);
    forceAIMoveRef.current = false;
  }, [gameState.currentPlayer]);

  // Turn timer - update every 100ms
  useEffect(() => {
    if (gameState.winner) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartRef.current) / 1000);
      setTurnTime(elapsed);

      // Force AI move after 10 seconds
      if (mode === 'ai' && gameState.currentPlayer === 'black' && elapsed >= 10 && !forceAIMoveRef.current) {
        forceAIMoveRef.current = true;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.winner, mode, gameState.currentPlayer]);

  // Record game when there's a winner
  useEffect(() => {
    if (gameState.winner && !gameRecorded) {
      recordGame(gameState.winner, 'white', mode, mode === 'ai' ? difficulty : undefined);
      setGameRecorded(true);
      playSound(gameState.winner === 'white' ? 'win' : 'lose');
    }
  }, [gameState.winner, gameRecorded, recordGame, mode, difficulty, playSound]);

  // AI Move - combined selection and execution
  useEffect(() => {
    if (mode !== 'ai' || gameState.currentPlayer !== 'black' || gameState.winner || isAIThinking) {
      return;
    }

    // Capture current state values to use in timeouts
    const currentBoard = gameState.board;
    const currentReserve = gameState.blackReserve;
    const currentPhase = gameState.phase;

    const shouldForce = forceAIMoveRef.current;
    const delay = shouldForce ? 0 : 500 + Math.random() * 500;
    
    setIsAIThinking(true);

    // Step 1: Calculate and select piece
    aiMoveTimeoutRef.current = setTimeout(() => {
      const aiMove = getBestMove(
        currentBoard,
        'black',
        currentReserve,
        currentPhase,
        difficulty,
        getValidMoves
      );

      if (aiMove) {
        // Store the move so we don't need to recalculate
        pendingAIMoveRef.current = aiMove;
        // Select the piece for visual feedback
        selectPiece(aiMove.piece, aiMove.from);
        
        // Step 2: Execute the stored move after a short delay
        aiExecuteTimeoutRef.current = setTimeout(() => {
          const storedMove = pendingAIMoveRef.current;
          if (storedMove) {
            const result = makeMove(storedMove.to);
            if (result.success) {
              playSound(result.captured ? 'capture' : storedMove.from ? 'move' : 'place');
            }
            pendingAIMoveRef.current = null;
          }
          setIsAIThinking(false);
        }, 300);
      } else {
        setIsAIThinking(false);
      }
    }, delay);

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
      }
      if (aiExecuteTimeoutRef.current) {
        clearTimeout(aiExecuteTimeoutRef.current);
      }
    };
  }, [gameState.currentPlayer, gameState.winner, gameState.board, gameState.blackReserve, gameState.phase, mode, isAIThinking, difficulty, getBestMove, getValidMoves, selectPiece, makeMove, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = useCallback((position: Position) => {
    if (!isPlayerTurn || gameState.winner || isAIThinking) return;

    const { selectedPiece, validMoves, board } = gameState;
    const cellPiece = board[position.row][position.col].piece;

    // If we have a selected piece and this is a valid move
    if (selectedPiece && validMoves.some(m => m.row === position.row && m.col === position.col)) {
      const result = makeMove(position);
      if (result.success) {
        playSound(result.captured ? 'capture' : selectedPiece.position ? 'move' : 'place');
      }
      return;
    }

    // If clicking on own piece on board, select it
    if (cellPiece && cellPiece.player === gameState.currentPlayer) {
      selectPiece(cellPiece, position);
      playSound('select');
      return;
    }

    // Otherwise deselect
    deselectPiece();
  }, [gameState, isPlayerTurn, isAIThinking, selectPiece, deselectPiece, makeMove, playSound]);

  const handleReserveSelect = useCallback((piece: typeof gameState.whiteReserve[0]) => {
    if (!isPlayerTurn || gameState.winner || isAIThinking) return;
    selectPiece(piece, null);
    playSound('select');
  }, [isPlayerTurn, gameState.winner, isAIThinking, selectPiece, playSound]);

  const handleReset = () => {
    resetGame();
    setGameRecorded(false);
    setIsAIThinking(false);
  };

  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    setEnabled(newState);
  };

  const selectedPosition = gameState.selectedPiece?.position ?? null;
  const selectedPieceId = gameState.selectedPiece?.piece.id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 wood-grain">
      <div className="max-w-lg w-full space-y-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center">
          <GameStatus
            currentPlayer={gameState.currentPlayer}
            phase={gameState.phase}
            winner={gameState.winner}
            isAITurn={isAIThinking}
          />
          <GameControls
            onReset={handleReset}
            onHome={() => navigate('/')}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />
        </div>

        {/* Turn Timer */}
        {!gameState.winner && (
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              turnTime >= 10 
                ? 'bg-destructive/20 border-destructive text-destructive' 
                : 'bg-card/80 border-border text-foreground'
            }`}>
              <Clock className="h-4 w-4" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(turnTime)}
              </span>
              <span className="text-sm text-muted-foreground">
                {isAIThinking ? 'Computer thinking...' : `${gameState.currentPlayer === 'white' ? (mode === 'ai' ? 'Your' : "White's") : (mode === 'ai' ? "Computer's" : "Black's")} turn`}
              </span>
            </div>
          </div>
        )}

        {/* Black Rack (top) */}
        <PieceRack
          pieces={gameState.blackReserve}
          player="black"
          isCurrentPlayer={gameState.currentPlayer === 'black' && !gameState.winner}
          selectedPieceId={gameState.currentPlayer === 'black' ? selectedPieceId : undefined}
          onPieceSelect={handleReserveSelect}
          label={mode === 'ai' ? 'Computer' : 'Black'}
        />

        {/* Game Board */}
        <div className="flex justify-center">
          <GameBoard
            board={gameState.board}
            validMoves={gameState.validMoves}
            selectedPosition={selectedPosition}
            winningLine={gameState.winningLine}
            onCellClick={handleCellClick}
          />
        </div>

        {/* White Rack (bottom) */}
        <PieceRack
          pieces={gameState.whiteReserve}
          player="white"
          isCurrentPlayer={gameState.currentPlayer === 'white' && !gameState.winner}
          selectedPieceId={gameState.currentPlayer === 'white' ? selectedPieceId : undefined}
          onPieceSelect={handleReserveSelect}
          label={mode === 'ai' ? 'You' : 'White'}
        />

        {/* Play Again Button */}
        {gameState.winner && (
          <div className="flex justify-center gap-4">
            <Button onClick={handleReset} className="font-display">
              Play Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="font-display">
              Main Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
