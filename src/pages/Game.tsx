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
  const aiMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPlayerTurn = mode === 'local' || gameState.currentPlayer === 'white';

  // Record game when there's a winner
  useEffect(() => {
    if (gameState.winner && !gameRecorded) {
      recordGame(gameState.winner, 'white', mode, mode === 'ai' ? difficulty : undefined);
      setGameRecorded(true);
      playSound(gameState.winner === 'white' ? 'win' : 'lose');
    }
  }, [gameState.winner, gameRecorded, recordGame, mode, difficulty, playSound]);

  // AI Move
  useEffect(() => {
    if (mode === 'ai' && gameState.currentPlayer === 'black' && !gameState.winner && !isAIThinking) {
      setIsAIThinking(true);

      aiMoveTimeoutRef.current = setTimeout(() => {
        const aiMove = getBestMove(
          gameState.board,
          'black',
          gameState.blackReserve,
          gameState.phase,
          difficulty,
          getValidMoves
        );

        if (aiMove) {
          // First select the piece to show visual feedback
          selectPiece(aiMove.piece, aiMove.from);
        } else {
          setIsAIThinking(false);
        }
      }, 500 + Math.random() * 500);
    }

    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current);
      }
    };
  }, [gameState.currentPlayer, gameState.winner, mode, isAIThinking, gameState.board, gameState.blackReserve, gameState.phase, difficulty, getValidMoves, getBestMove, selectPiece]);

  // Execute AI move after piece is selected
  useEffect(() => {
    if (mode === 'ai' && isAIThinking && gameState.selectedPiece && gameState.currentPlayer === 'black') {
      const timeoutId = setTimeout(() => {
        const aiMove = getBestMove(
          gameState.board,
          'black',
          gameState.blackReserve,
          gameState.phase,
          difficulty,
          getValidMoves
        );
        
        if (aiMove) {
          const result = makeMove(aiMove.to);
          if (result.success) {
            playSound(result.captured ? 'capture' : aiMove.from ? 'move' : 'place');
          }
        }
        setIsAIThinking(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [gameState.selectedPiece, isAIThinking, mode, gameState.currentPlayer]);

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
