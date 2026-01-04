import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';
import { Board, Piece, Position } from '@/types/game';
import { ChessPiece } from '@/components/game/ChessPiece';
import { cn } from '@/lib/utils';

interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  board: Board;
  highlightPositions?: Position[];
  expectedAction?: {
    type: 'place' | 'move' | 'capture';
    from?: Position | null;
    to: Position;
    pieceType?: Piece['type'];
  };
  validMoves?: Position[];
  reservePiece?: Piece;
}

const createEmptyBoard = (): Board => {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => ({
      piece: null,
      position: { row, col },
    }))
  );
};

const createPiece = (type: Piece['type'], player: Piece['player'], id: string): Piece => ({
  type,
  player,
  id,
});

// Create tutorial scenarios
const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome!',
    instruction: 'In Tic Tac Chec, you place and move chess pieces to align 4 in a row. Click "Next" to start learning!',
    board: createEmptyBoard(),
  },
  {
    id: 'place-piece',
    title: 'Placing a Piece',
    instruction: 'First, you place pieces on the board. Click on the highlighted square to place your Rook.',
    board: createEmptyBoard(),
    expectedAction: { type: 'place', from: null, to: { row: 1, col: 1 }, pieceType: 'rook' },
    validMoves: [{ row: 1, col: 1 }],
    reservePiece: createPiece('rook', 'white', 'tutorial-rook'),
  },
  {
    id: 'rook-movement',
    title: 'Moving the Rook',
    instruction: 'Great! The Rook moves in straight lines. Click the Rook, then move it to the highlighted square.',
    board: (() => {
      const b = createEmptyBoard();
      b[1][1].piece = createPiece('rook', 'white', 'tutorial-rook');
      return b;
    })(),
    expectedAction: { type: 'move', from: { row: 1, col: 1 }, to: { row: 1, col: 3 } },
    validMoves: [{ row: 1, col: 3 }],
    highlightPositions: [{ row: 1, col: 1 }],
  },
  {
    id: 'bishop-intro',
    title: 'The Bishop',
    instruction: 'Bishops move diagonally. Click the Bishop, then move it diagonally to the highlighted square.',
    board: (() => {
      const b = createEmptyBoard();
      b[0][0].piece = createPiece('bishop', 'white', 'tutorial-bishop');
      return b;
    })(),
    expectedAction: { type: 'move', from: { row: 0, col: 0 }, to: { row: 2, col: 2 } },
    validMoves: [{ row: 2, col: 2 }],
    highlightPositions: [{ row: 0, col: 0 }],
  },
  {
    id: 'knight-intro',
    title: 'The Knight',
    instruction: 'Knights move in an L-shape (2 squares + 1 square). Move the Knight to the highlighted square.',
    board: (() => {
      const b = createEmptyBoard();
      b[0][0].piece = createPiece('knight', 'white', 'tutorial-knight');
      return b;
    })(),
    expectedAction: { type: 'move', from: { row: 0, col: 0 }, to: { row: 2, col: 1 } },
    validMoves: [{ row: 2, col: 1 }],
    highlightPositions: [{ row: 0, col: 0 }],
  },
  {
    id: 'capture',
    title: 'Capturing Pieces',
    instruction: 'Capture the enemy Pawn by moving your Rook onto it! Captured pieces return to the opponent\'s reserve.',
    board: (() => {
      const b = createEmptyBoard();
      b[1][0].piece = createPiece('rook', 'white', 'tutorial-rook');
      b[1][3].piece = createPiece('pawn', 'black', 'tutorial-enemy-pawn');
      return b;
    })(),
    expectedAction: { type: 'capture', from: { row: 1, col: 0 }, to: { row: 1, col: 3 } },
    validMoves: [{ row: 1, col: 3 }],
    highlightPositions: [{ row: 1, col: 0 }],
  },
  {
    id: 'win-condition',
    title: 'Winning the Game',
    instruction: 'Align 4 pieces in a row to win! Place your Rook to complete the line and win.',
    board: (() => {
      const b = createEmptyBoard();
      b[0][0].piece = createPiece('bishop', 'white', 'w1');
      b[1][0].piece = createPiece('knight', 'white', 'w2');
      b[2][0].piece = createPiece('pawn', 'white', 'w3');
      return b;
    })(),
    expectedAction: { type: 'place', from: null, to: { row: 3, col: 0 }, pieceType: 'rook' },
    validMoves: [{ row: 3, col: 0 }],
    reservePiece: createPiece('rook', 'white', 'tutorial-final-rook'),
    highlightPositions: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
  },
  {
    id: 'complete',
    title: 'Tutorial Complete!',
    instruction: 'You\'ve learned the basics! Remember: place pieces, move them strategically, capture enemies, and align 4 to win. Good luck!',
    board: (() => {
      const b = createEmptyBoard();
      b[0][0].piece = createPiece('bishop', 'white', 'w1');
      b[1][0].piece = createPiece('knight', 'white', 'w2');
      b[2][0].piece = createPiece('pawn', 'white', 'w3');
      b[3][0].piece = createPiece('rook', 'white', 'w4');
      return b;
    })(),
    highlightPositions: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }],
  },
];

const InteractiveTutorial = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [board, setBoard] = useState<Board>(tutorialSteps[0].board);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [stepCompleted, setStepCompleted] = useState(false);

  const currentStep = tutorialSteps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / tutorialSteps.length) * 100;
  const isLastStep = currentStepIndex === tutorialSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const resetStep = useCallback(() => {
    setBoard(JSON.parse(JSON.stringify(currentStep.board)));
    setSelectedPosition(null);
    setStepCompleted(false);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      const nextStep = tutorialSteps[currentStepIndex + 1];
      setCurrentStepIndex(currentStepIndex + 1);
      setBoard(JSON.parse(JSON.stringify(nextStep.board)));
      setSelectedPosition(null);
      setStepCompleted(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      const prevStep = tutorialSteps[currentStepIndex - 1];
      setCurrentStepIndex(currentStepIndex - 1);
      setBoard(JSON.parse(JSON.stringify(prevStep.board)));
      setSelectedPosition(null);
      setStepCompleted(false);
    }
  };

  const handleCellClick = (position: Position) => {
    if (stepCompleted || !currentStep.expectedAction) return;

    const { expectedAction, reservePiece } = currentStep;

    // Handle placement from reserve
    if (expectedAction.type === 'place' && reservePiece) {
      if (position.row === expectedAction.to.row && position.col === expectedAction.to.col) {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[position.row][position.col].piece = reservePiece;
        setBoard(newBoard);
        setStepCompleted(true);
      }
      return;
    }

    // Handle selecting a piece on the board
    if (selectedPosition === null) {
      if (expectedAction.from && 
          position.row === expectedAction.from.row && 
          position.col === expectedAction.from.col) {
        setSelectedPosition(position);
      }
      return;
    }

    // Handle moving to target
    if (position.row === expectedAction.to.row && position.col === expectedAction.to.col) {
      const newBoard = JSON.parse(JSON.stringify(board));
      const piece = newBoard[selectedPosition.row][selectedPosition.col].piece;
      newBoard[selectedPosition.row][selectedPosition.col].piece = null;
      newBoard[position.row][position.col].piece = piece;
      setBoard(newBoard);
      setSelectedPosition(null);
      setStepCompleted(true);
    } else {
      setSelectedPosition(null);
    }
  };

  const isValidMove = (pos: Position) =>
    currentStep.validMoves?.some(m => m.row === pos.row && m.col === pos.col) && !stepCompleted;

  const isHighlighted = (pos: Position) =>
    currentStep.highlightPositions?.some(h => h.row === pos.row && h.col === pos.col);

  const isSelected = (pos: Position) =>
    selectedPosition?.row === pos.row && selectedPosition?.col === pos.col;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 wood-grain">
      <div className="max-w-lg w-full space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tutorial')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl text-foreground">{currentStep.title}</h1>
            <p className="text-xs text-muted-foreground">Step {currentStepIndex + 1} of {tutorialSteps.length}</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-2" />

        {/* Instruction Card */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4">
            <p className="text-foreground">{currentStep.instruction}</p>
            {stepCompleted && (
              <div className="flex items-center gap-2 mt-3 text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Well done! Click Next to continue.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reserve Piece (if placing) */}
        {currentStep.reservePiece && !stepCompleted && (
          <Card className="bg-card/80 border-border">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Your piece:</span>
              <div className="p-2 bg-primary/20 rounded-lg">
                <ChessPiece piece={currentStep.reservePiece} size="md" />
              </div>
              <span className="text-sm text-muted-foreground">→ Click the highlighted square to place it</span>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        <div className="flex justify-center">
          <div className="board-shadow rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 gap-0 w-72 h-72 sm:w-80 sm:h-80">
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const pos = { row: rowIndex, col: colIndex };
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const showValidMove = isValidMove(pos);
                  const showHighlight = isHighlighted(pos);
                  const showSelected = isSelected(pos);
                  const hasCapture = showValidMove && cell.piece;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(pos)}
                      className={cn(
                        'relative flex items-center justify-center transition-all duration-200',
                        'w-full aspect-square cursor-pointer',
                        isLight ? 'bg-board-light' : 'bg-board-dark',
                        showSelected && 'ring-4 ring-game-selected ring-inset',
                        showHighlight && stepCompleted && 'bg-green-500/30',
                        !showSelected && 'hover:brightness-110'
                      )}
                    >
                      {/* Valid move indicator */}
                      {showValidMove && !cell.piece && (
                        <div className="absolute w-4 h-4 rounded-full bg-game-valid/60 animate-pulse" />
                      )}

                      {/* Capture indicator */}
                      {hasCapture && (
                        <div className="absolute inset-1 rounded-full border-4 border-game-capture/70 animate-pulse" />
                      )}

                      {/* Piece */}
                      {cell.piece && (
                        <ChessPiece
                          piece={cell.piece}
                          size="lg"
                          selected={showSelected}
                          animated={false}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          {currentStep.expectedAction && !stepCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={resetStep}
              className="text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          {isLastStep ? (
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Start Playing!
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep.expectedAction && !stepCompleted}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;
