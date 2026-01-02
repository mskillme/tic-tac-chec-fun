import { Button } from '@/components/ui/button';
import { RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface GameControlsProps {
  onReset: () => void;
  onHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GameControls = ({
  onReset,
  onHome,
  soundEnabled,
  onToggleSound,
}: GameControlsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onToggleSound}
        className="border-border bg-card/50 hover:bg-card"
      >
        {soundEnabled ? (
          <Volume2 className="h-5 w-5" />
        ) : (
          <VolumeX className="h-5 w-5" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onReset}
        className="border-border bg-card/50 hover:bg-card"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onHome}
        className="border-border bg-card/50 hover:bg-card"
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};
