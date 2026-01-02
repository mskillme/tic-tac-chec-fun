import { Piece, Player } from '@/types/game';
import { ChessPiece } from './ChessPiece';
import { cn } from '@/lib/utils';

interface PieceRackProps {
  pieces: Piece[];
  player: Player;
  isCurrentPlayer: boolean;
  selectedPieceId?: string;
  onPieceSelect: (piece: Piece) => void;
  label: string;
}

export const PieceRack = ({
  pieces,
  player,
  isCurrentPlayer,
  selectedPieceId,
  onPieceSelect,
  label,
}: PieceRackProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300',
        'wood-grain border-2',
        isCurrentPlayer 
          ? 'border-accent glow-gold' 
          : 'border-border opacity-60'
      )}
    >
      <span className={cn(
        'font-display text-sm uppercase tracking-wider',
        isCurrentPlayer ? 'text-accent' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      
      <div className="flex gap-1 min-h-[56px]">
        {pieces.length > 0 ? (
          pieces.map((piece) => (
            <ChessPiece
              key={piece.id}
              piece={piece}
              size="md"
              selected={selectedPieceId === piece.id}
              onClick={() => isCurrentPlayer && onPieceSelect(piece)}
              className={cn(
                !isCurrentPlayer && 'pointer-events-none'
              )}
            />
          ))
        ) : (
          <span className="text-xs text-muted-foreground italic">
            All pieces placed
          </span>
        )}
      </div>
    </div>
  );
};
