import { Player } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameStatusProps {
  currentPlayer: Player;
  phase: 'placement' | 'movement';
  winner: Player | null;
  isAITurn: boolean;
}

export const GameStatus = ({
  currentPlayer,
  phase,
  winner,
  isAITurn,
}: GameStatusProps) => {
  if (winner) {
    return (
      <div className="text-center space-y-2">
        <h2 className="font-display text-3xl text-accent animate-pulse-gold-text">
          {winner === 'white' ? 'White' : 'Black'} Wins!
        </h2>
        <p className="text-muted-foreground">
          Four pieces aligned!
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-1">
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            'w-4 h-4 rounded-full border-2 transition-colors',
            currentPlayer === 'white'
              ? 'bg-piece-white border-piece-white-stroke'
              : 'bg-piece-black border-piece-black-stroke'
          )}
        />
        <h2 className="font-display text-xl">
          {currentPlayer === 'white' ? 'White' : 'Black'}'s Turn
          {isAITurn && ' (AI thinking...)'}
        </h2>
      </div>
      <p className="text-sm text-muted-foreground">
        {phase === 'placement' 
          ? 'Select a piece from your rack and place it on the board'
          : 'Move a piece to align four in a row'}
      </p>
    </div>
  );
};
