import { Piece } from '@/types/game';
import { cn } from '@/lib/utils';

interface ChessPieceProps {
  piece: Piece;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  animated?: boolean;
  className?: string;
}

const pieceSymbols: Record<Piece['type'], { white: string; black: string }> = {
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

const sizeClasses = {
  sm: 'text-3xl w-10 h-10',
  md: 'text-5xl w-14 h-14',
  lg: 'text-6xl w-16 h-16',
};

export const ChessPiece = ({
  piece,
  size = 'md',
  selected = false,
  onClick,
  animated = false,
  className,
}: ChessPieceProps) => {
  const symbol = pieceSymbols[piece.type][piece.player];
  const isWhite = piece.player === 'white';

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center cursor-pointer transition-all duration-200',
        'select-none piece-shadow',
        sizeClasses[size],
        isWhite ? 'text-piece-white' : 'text-piece-black',
        selected && 'scale-110 animate-pulse-gold',
        animated && 'animate-piece-place',
        onClick && 'hover:scale-110 active:scale-95',
        className
      )}
      style={{
        textShadow: isWhite 
          ? '1px 1px 2px hsl(var(--piece-white-stroke)), -1px -1px 2px hsl(var(--piece-white-stroke))'
          : '1px 1px 2px hsl(var(--piece-black-stroke)), -1px -1px 2px hsl(var(--piece-black-stroke))',
      }}
    >
      {symbol}
    </div>
  );
};
