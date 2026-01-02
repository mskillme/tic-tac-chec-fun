import { useNavigate } from 'react-router-dom';
import { useGameStats } from '@/hooks/useGameStats';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trophy, Target, Flame, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Statistics = () => {
  const navigate = useNavigate();
  const { stats, resetStats } = useGameStats();

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

  const difficultyStats = [
    { label: 'Easy', ...stats.byDifficulty.easy },
    { label: 'Medium', ...stats.byDifficulty.medium },
    { label: 'Hard', ...stats.byDifficulty.hard },
  ];

  return (
    <div className="min-h-screen p-4 wood-grain">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Stats
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Reset Statistics?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your game statistics. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetStats} className="bg-destructive">
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <h1 className="font-display text-3xl text-center">Statistics</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card/80 border-border">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="font-display text-3xl text-foreground">{stats.wins}</div>
              <div className="text-xs text-muted-foreground uppercase">Total Wins</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="font-display text-3xl text-foreground">{winRate}%</div>
              <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="font-display text-3xl text-foreground">{stats.winStreak}</div>
              <div className="text-xs text-muted-foreground uppercase">Current Streak</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 border-border">
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-display text-3xl text-foreground">{stats.bestStreak}</div>
              <div className="text-xs text-muted-foreground uppercase">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Summary */}
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">Game Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Games Played</span>
              <span className="font-display">{stats.gamesPlayed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wins</span>
              <span className="font-display text-green-500">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Losses</span>
              <span className="font-display text-red-500">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Draws</span>
              <span className="font-display">{stats.draws}</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Difficulty Breakdown */}
        <Card className="bg-card/80 border-border">
          <CardHeader>
            <CardTitle className="font-display text-lg">vs Computer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {difficultyStats.map((diff) => {
              const total = diff.wins + diff.losses;
              const rate = total > 0 ? Math.round((diff.wins / total) * 100) : 0;
              
              return (
                <div key={diff.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{diff.label}</span>
                    <span>
                      <span className="text-green-500">{diff.wins}W</span>
                      {' / '}
                      <span className="text-red-500">{diff.losses}L</span>
                      {total > 0 && (
                        <span className="text-muted-foreground ml-2">({rate}%)</span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
