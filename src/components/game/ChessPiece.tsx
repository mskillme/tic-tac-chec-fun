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

// Use outlined symbols for all pieces - differentiate by CSS color
const pieceSymbols: Record<Piece['type'], string> = {
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
  const symbol = pieceSymbols[piece.type];
  const isWhite = piece.player === 'white';

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-center cursor-pointer transition-all duration-200',
        'select-none piece-shadow',
        sizeClasses[size],
        isWhite ? 'text-piece-white' : 'text-piece-black',
        selected && 'scale-110 animate-pulse-gold-text',
        animated && 'animate-piece-place',
        onClick && 'hover:scale-110 active:scale-95',
        className
      )}
      style={{
        color: isWhite ? 'hsl(var(--piece-white))' : 'hsl(var(--piece-black))',
        WebkitTextStroke: isWhite 
          ? '1px hsl(var(--piece-white-stroke))'
          : '1.5px hsl(var(--piece-black-stroke))',
        textShadow: isWhite 
          ? '1px 1px 2px hsl(var(--piece-white-stroke) / 0.5)'
          : '1px 1px 2px hsl(var(--piece-black-stroke) / 0.5)',
      }}
    >
      {symbol}
    </div>
  );
};
