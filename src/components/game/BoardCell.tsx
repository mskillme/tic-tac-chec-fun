import { BoardCell as BoardCellType, Position } from '@/types/game';
import { ChessPiece } from './ChessPiece';
import { cn } from '@/lib/utils';

interface BoardCellProps {
  cell: BoardCellType;
  isValidMove: boolean;
  isSelected: boolean;
  isWinningCell: boolean;
  onClick: () => void;
}

export const BoardCell = ({
  cell,
  isValidMove,
  isSelected,
  isWinningCell,
  onClick,
}: BoardCellProps) => {
  const { row, col } = cell.position;
  const isLight = (row + col) % 2 === 0;
  const hasCapture = isValidMove && cell.piece;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center transition-all duration-200',
        'w-full aspect-square cursor-pointer',
        isLight ? 'bg-board-light' : 'bg-board-dark',
        isSelected && 'ring-4 ring-game-selected ring-inset',
        isWinningCell && 'bg-accent/40',
        !isSelected && !isWinningCell && 'hover:brightness-110'
      )}
    >
      {/* Valid move indicator */}
      {isValidMove && !cell.piece && (
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
          selected={isSelected}
          animated={false}
        />
      )}
    </div>
  );
};
