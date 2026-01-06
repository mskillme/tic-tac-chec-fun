import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGameStats } from '@/hooks/useGameStats';
import { useDailyPuzzleStats } from '@/hooks/useDailyPuzzleStats';
import { BarChart3, Calendar, CheckCircle2, Crown, Flame, HelpCircle } from 'lucide-react';

const MainMenu = () => {
  const navigate = useNavigate();
  const { stats } = useGameStats();
  const { stats: puzzleStats, isTodayCompleted } = useDailyPuzzleStats();
  const todayCompleted = isTodayCompleted();

  const handlePlayNow = () => {
    navigate('/game?mode=ai&difficulty=hard');
  };

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

        {/* Play Button */}
        <Button
          onClick={handlePlayNow}
          className="w-full h-16 text-lg font-display bg-primary hover:bg-primary/90"
        >
          Play Now
        </Button>

        {/* Daily Puzzle Button */}
        <Button
          onClick={() => navigate('/daily')}
          variant="outline"
          className="w-full h-14 text-base font-display border-accent/50 hover:bg-accent/10 relative"
        >
          <Calendar className="mr-2 h-5 w-5 text-accent" />
          Daily Puzzle
          {todayCompleted ? (
            <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />
          ) : (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent text-accent-foreground rounded-full animate-pulse">
              NEW
            </span>
          )}
          {puzzleStats.currentStreak > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
              <Flame className="h-3 w-3" />
              {puzzleStats.currentStreak}
            </span>
          )}
        </Button>

        {/* Menu Links */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/tutorial/interactive')}
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
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            Align 4 pieces in a row to win!
          </p>
          <button
            onClick={() => navigate('/privacy')}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground underline"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
