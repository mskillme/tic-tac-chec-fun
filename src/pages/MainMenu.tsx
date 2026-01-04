import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Difficulty } from '@/types/game';
import { useGameStats } from '@/hooks/useGameStats';
import { BarChart3, Crown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MainMenu = () => {
  const navigate = useNavigate();
  const { stats } = useGameStats();
  const [showDifficulty, setShowDifficulty] = useState(false);


  const handleAIGame = (difficulty: Difficulty) => {
    navigate(`/game?mode=ai&difficulty=${difficulty}`);
  };

  const difficulties: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Easy', description: 'Perfect for learning' },
    { value: 'medium', label: 'Medium', description: 'Balanced challenge' },
    { value: 'hard', label: 'Hard', description: 'Strategic opponent' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 wood-grain">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Crown className="w-16 h-16 text-accent animate-pulse-gold" />
            </div>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground tracking-wide">
            Tic Tac Chec
          </h1>
          <p className="text-muted-foreground text-lg">
            Chess meets Tic-Tac-Toe
          </p>
        </div>

        {/* Quick Stats */}
        <Card className="bg-card/80 border-border">
          <CardContent className="p-4 flex justify-around text-center">
            <div>
              <div className="font-display text-2xl text-accent">{stats.wins}</div>
              <div className="text-xs text-muted-foreground uppercase">Wins</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-2xl text-foreground">{stats.gamesPlayed}</div>
              <div className="text-xs text-muted-foreground uppercase">Played</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="font-display text-2xl text-accent">{stats.bestStreak}</div>
              <div className="text-xs text-muted-foreground uppercase">Best Streak</div>
            </div>
          </CardContent>
        </Card>

        {/* Game Modes */}
        <div className="space-y-3">
          {!showDifficulty ? (
            <>
              <Button
                onClick={() => setShowDifficulty(true)}
                className="w-full h-16 text-lg font-display bg-primary hover:bg-primary/90"
              >
                Play Now
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowDifficulty(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back
              </Button>
              
              {difficulties.map((diff) => (
                <Button
                  key={diff.value}
                  onClick={() => handleAIGame(diff.value)}
                  variant="outline"
                  className={cn(
                    'w-full h-16 flex-col items-start px-6',
                    'border-border bg-card/50 hover:bg-card hover:border-accent'
                  )}
                >
                  <span className="font-display text-lg">{diff.label}</span>
                  <span className="text-xs text-muted-foreground">{diff.description}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Links */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/tutorial')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="mr-2 h-5 w-5" />
            How to Play
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate('/stats')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            View Statistics
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Align 4 pieces in a row to win!
        </p>
      </div>
    </div>
  );
};

export default MainMenu;
