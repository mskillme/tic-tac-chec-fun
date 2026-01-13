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

// Filled symbols for white pieces (solid look)
const filledSymbols: Record<Piece['type'], string> = {
  rook: '♜',
  bishop: '♝',
  knight: '♞',
  pawn: '♟',
};

// Outlined symbols for black pieces (outline look)
const outlinedSymbols: Record<Piece['type'], string> = {
  rook: '♖',
  bishop: '♗',
  knight: '♘',
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
  // White uses filled symbols (solid), Black uses outlined symbols (stroke only)
  const symbol = isWhite ? filledSymbols[piece.type] : outlinedSymbols[piece.type];

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
        // Black pieces: transparent fill with prominent light stroke (outline only)
        color: 'transparent',
        WebkitTextStroke: '2.5px hsl(40 35% 92%)',
        textShadow: '0 0 6px hsl(40 30% 85% / 0.5), 0 2px 3px hsl(0 0% 0% / 0.3)',
        paintOrder: 'stroke fill',
      }}
    >
      {symbol}
    </div>
  );
};
