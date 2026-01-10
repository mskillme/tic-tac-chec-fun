import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { LeaderboardEntry, PlayerRank } from '@/types/leaderboard';

const INITIALS_KEY = 'tic-tac-chec-initials';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(() => {
    return localStorage.getItem(INITIALS_KEY);
  });

  // Initialize anonymous auth and get device ID
  useEffect(() => {
    const initAuth = async () => {
      try {
        const id = await getDeviceId();
        setDeviceId(id);
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };
    initAuth();
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_wins', { ascending: false })
        .limit(100);

      if (error) throw error;

      setLeaderboard(data || []);

      // Find current player's rank
      if (deviceId) {
        const playerIndex = data?.findIndex(entry => entry.device_id === deviceId);
        if (playerIndex !== undefined && playerIndex >= 0) {
          setPlayerRank({
            rank: playerIndex + 1,
            entry: data![playerIndex],
          });
        } else {
          setPlayerRank(null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const saveInitials = useCallback((newInitials: string) => {
    const uppercased = newInitials.toUpperCase();
    localStorage.setItem(INITIALS_KEY, uppercased);
    setInitials(uppercased);
    return uppercased;
  }, []);

  const recordWin = useCallback(async (wins: number, games: number, bestStreak: number) => {
    if (!initials || !deviceId) return;

    try {
      // Try to upsert the entry
      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          device_id: deviceId,
          initials: initials,
          total_wins: wins,
          total_games: games,
          best_streak: bestStreak,
          last_played_at: new Date().toISOString(),
        }, {
          onConflict: 'device_id',
        });

      if (error) throw error;

      // Refresh leaderboard after recording
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error recording win:', error);
    }
  }, [deviceId, initials, fetchLeaderboard]);

  const syncStats = useCallback(async (wins: number, games: number, bestStreak: number) => {
    if (!initials) return;
    await recordWin(wins, games, bestStreak);
  }, [initials, recordWin]);

  useEffect(() => {
    if (deviceId) {
      fetchLeaderboard();
    }
  }, [deviceId, fetchLeaderboard]);

  return {
    leaderboard,
    playerRank,
    loading,
    initials,
    deviceId,
    saveInitials,
    recordWin,
    syncStats,
    fetchLeaderboard,
    hasInitials: !!initials,
  };
};
