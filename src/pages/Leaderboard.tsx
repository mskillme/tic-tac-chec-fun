import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Trophy, Medal, Award } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { InitialsInput } from '@/components/InitialsInput';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    leaderboard, 
    playerRank, 
    loading, 
    initials, 
    hasInitials,
    saveInitials,
    fetchLeaderboard,
    deviceId
  } = useLeaderboard();
  const [showInitialsInput, setShowInitialsInput] = useState(false);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const handleSetInitials = (newInitials: string) => {
    saveInitials(newInitials);
    setShowInitialsInput(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-display text-primary">Global Leaderboard</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchLeaderboard}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Player's Current Rank */}
      {playerRank && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRankIcon(playerRank.rank)}
              <span className="font-bold text-lg">{playerRank.entry?.initials}</span>
              <span className="text-muted-foreground">(You)</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{playerRank.entry?.total_wins} wins</div>
              <div className="text-sm text-muted-foreground">Rank #{playerRank.rank}</div>
            </div>
          </div>
        </div>
      )}

      {/* Set Initials Button */}
      {!hasInitials && (
        <Button
          onClick={() => setShowInitialsInput(true)}
          className="mb-6"
        >
          <Trophy className="mr-2 h-4 w-4" />
          Join the Leaderboard
        </Button>
      )}

      {/* Leaderboard Table */}
      <div className="flex-1 overflow-hidden">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-3 text-center">Wins</div>
            <div className="col-span-3 text-center">Streak</div>
          </div>

          {/* Table Body */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && leaderboard.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Trophy className="h-12 w-12 mb-4 opacity-50" />
                <p>No entries yet!</p>
                <p className="text-sm">Be the first to join the leaderboard.</p>
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const isCurrentPlayer = entry.device_id === deviceId;
                const rank = index + 1;

                return (
                  <div
                    key={entry.id}
                    className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/50 last:border-0 transition-colors ${
                      isCurrentPlayer ? 'bg-primary/5' : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="col-span-2 flex justify-center items-center">
                      {getRankIcon(rank)}
                    </div>
                    <div className="col-span-4 font-bold flex items-center gap-2">
                      {entry.initials}
                      {isCurrentPlayer && (
                        <span className="text-xs text-primary">(You)</span>
                      )}
                    </div>
                    <div className="col-span-3 text-center font-medium">
                      {entry.total_wins}
                    </div>
                    <div className="col-span-3 text-center text-muted-foreground">
                      {entry.best_streak}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Change Initials */}
      {hasInitials && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInitialsInput(true)}
          className="mt-4 text-muted-foreground"
        >
          Change Initials ({initials})
        </Button>
      )}

      {/* Initials Input Dialog */}
      <InitialsInput
        open={showInitialsInput}
        onSubmit={handleSetInitials}
        onCancel={() => setShowInitialsInput(false)}
      />
    </div>
  );
};

export default Leaderboard;
