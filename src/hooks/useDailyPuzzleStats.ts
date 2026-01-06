import { useState, useEffect, useCallback } from 'react';
import { DailyPuzzleStats } from '@/types/dailyPuzzle';
import { getESTDate, getPuzzleNumber, getDateSeed } from '@/lib/seededRandom';

const STORAGE_KEY = 'daily-puzzle-stats';

const initialStats: DailyPuzzleStats = {
  lastCompletedDate: null,
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
  completedPuzzles: [],
};

export const useDailyPuzzleStats = () => {
  const [stats, setStats] = useState<DailyPuzzleStats>(initialStats);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setStats(parsed);
      } catch {
        setStats(initialStats);
      }
    }
  }, []);

  const saveStats = useCallback((newStats: DailyPuzzleStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  }, []);

  const isTodayCompleted = useCallback(() => {
    const todaysSeed = getDateSeed(getESTDate());
    const todayDateStr = todaysSeed.toString();
    return stats.lastCompletedDate === todayDateStr;
  }, [stats.lastCompletedDate]);

  const markCompleted = useCallback(() => {
    const estDate = getESTDate();
    const todaysSeed = getDateSeed(estDate);
    const todayDateStr = todaysSeed.toString();
    const puzzleNumber = getPuzzleNumber();

    // Check if already completed today
    if (stats.lastCompletedDate === todayDateStr) {
      return;
    }

    // Calculate streak
    let newStreak = 1;
    if (stats.lastCompletedDate) {
      // Check if yesterday was completed
      const yesterday = new Date(estDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdaySeed = getDateSeed(yesterday).toString();
      
      if (stats.lastCompletedDate === yesterdaySeed) {
        newStreak = stats.currentStreak + 1;
      }
    }

    const newStats: DailyPuzzleStats = {
      lastCompletedDate: todayDateStr,
      currentStreak: newStreak,
      bestStreak: Math.max(stats.bestStreak, newStreak),
      totalSolved: stats.totalSolved + 1,
      completedPuzzles: [...stats.completedPuzzles, puzzleNumber],
    };

    saveStats(newStats);
  }, [stats, saveStats]);

  // Check and update streak on load (reset if broken)
  useEffect(() => {
    if (!stats.lastCompletedDate) return;

    const estDate = getESTDate();
    const todaysSeed = getDateSeed(estDate);
    const todayDateStr = todaysSeed.toString();

    // If already completed today, streak is fine
    if (stats.lastCompletedDate === todayDateStr) return;

    // Check if yesterday was completed
    const yesterday = new Date(estDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdaySeed = getDateSeed(yesterday).toString();

    // If yesterday wasn't completed and today isn't either, streak is broken
    if (stats.lastCompletedDate !== yesterdaySeed && stats.currentStreak > 0) {
      saveStats({
        ...stats,
        currentStreak: 0,
      });
    }
  }, [stats, saveStats]);

  return {
    stats,
    isTodayCompleted,
    markCompleted,
  };
};
