import { useState, useCallback, useEffect } from 'react';
import { GameStats, Difficulty, Player, GameMode } from '@/types/game';

const STORAGE_KEY = 'tic-tac-chec-stats';

const defaultStats: GameStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  gamesPlayed: 0,
  winStreak: 0,
  bestStreak: 0,
  byDifficulty: {
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 },
  },
};

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const recordGame = useCallback((
    winner: Player | null,
    playerColor: Player,
    gameMode: GameMode,
    difficulty?: Difficulty
  ) => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.gamesPlayed++;

      if (winner === null) {
        newStats.draws++;
        newStats.winStreak = 0;
      } else if (winner === playerColor) {
        newStats.wins++;
        newStats.winStreak++;
        newStats.bestStreak = Math.max(newStats.bestStreak, newStats.winStreak);
        
        if (gameMode === 'ai' && difficulty) {
          newStats.byDifficulty[difficulty].wins++;
        }
      } else {
        newStats.losses++;
        newStats.winStreak = 0;
        
        if (gameMode === 'ai' && difficulty) {
          newStats.byDifficulty[difficulty].losses++;
        }
      }

      return newStats;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(defaultStats);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { stats, recordGame, resetStats };
};
