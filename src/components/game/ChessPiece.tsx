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

// Filled symbols for both players (solid look)
const filledSymbols: Record<Piece['type'], string> = {
  rook: '♜',
  bishop: '♝',
  knight: '♞',
  pawn: '♙',
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
  const isWhite = piece.player === 'white';
  const symbol = filledSymbols[piece.type];

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center cursor-pointer transition-all duration-200',
        'select-none',
        sizeClasses[size],
        selected && 'scale-110 animate-pulse-gold-text',
        animated && 'animate-piece-place',
        onClick && 'hover:scale-110 active:scale-95',
        className
      )}
      style={isWhite ? {
        // White pieces: solid white fill with subtle dark outline
        color: 'hsl(40 30% 96%)',
        WebkitTextStroke: '1px hsl(25 35% 25%)',
        textShadow: '0 2px 4px hsl(0 0% 0% / 0.35)',
        paintOrder: 'stroke fill',
      } : {
        // Black pieces: solid black fill with light outline for visibility
        color: 'hsl(20 20% 12%)',
        WebkitTextStroke: '1px hsl(40 30% 85%)',
        textShadow: '0 0 8px hsl(40 30% 90% / 0.4), 0 2px 4px hsl(0 0% 0% / 0.4)',
        paintOrder: 'stroke fill',
      }}
    >
      {symbol}
    </div>
  );
};
