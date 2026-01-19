import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getDeviceId } from '@/lib/deviceId';
import { logger } from '@/lib/logger';
import { LeaderboardEntry, PlayerRank } from '@/types/leaderboard';

const INITIALS_KEY = 'tic-tac-chec-initials';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [initials, setInitials] = useState<string | null>(null);
  const initialized = useRef(false);

  // Initialize from localStorage (synchronously after mount)
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const storedInitials = localStorage.getItem(INITIALS_KEY);
      if (storedInitials) {
        setInitials(storedInitials);
      }
    }
  }, []);

  // Initialize anonymous auth and get device ID
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const id = await getDeviceId();
        if (isMounted) {
          setDeviceId(id);
        }
      } catch (error) {
        logger.error('Error initializing auth', error);
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // Use the public view which excludes device_id for security
      const { data, error } = await supabase
        .from('leaderboard_public')
        .select('*')
        .order('total_wins', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Map view data to LeaderboardEntry type (device_id will be undefined from view)
      const entries: LeaderboardEntry[] = (data || []).map(entry => ({
        ...entry,
        device_id: '', // Not exposed by view
      }));

      setLeaderboard(entries);

      // For player rank, we need to query the main table (RLS allows user to see own entry)
      if (deviceId) {
        const { data: ownEntry, error: ownError } = await supabase
          .from('leaderboard')
          .select('*')
          .eq('device_id', deviceId)
          .maybeSingle();

        if (!ownError && ownEntry) {
          // Find player's rank based on their total_wins
          const playerIndex = entries.findIndex(entry => entry.id === ownEntry.id);
          if (playerIndex >= 0) {
            setPlayerRank({
              rank: playerIndex + 1,
              entry: ownEntry,
            });
          } else {
            // Player might be outside top 100, calculate approximate rank
            const playersAbove = entries.filter(e => e.total_wins > ownEntry.total_wins).length;
            setPlayerRank({
              rank: playersAbove + 1,
              entry: ownEntry,
            });
          }
        } else {
          setPlayerRank(null);
        }
      }
    } catch (error) {
      logger.error('Error fetching leaderboard', error);
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

    // Sanitize and validate initials (defense-in-depth with database constraint)
    const sanitizedInitials = initials.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    if (sanitizedInitials.length !== 3) {
      logger.error('Invalid initials format');
      return;
    }

    // Validate numeric inputs (defense-in-depth with database trigger)
    if (wins < 0 || games < 0 || bestStreak < 0 || wins > games || bestStreak > wins) {
      logger.error('Invalid stats values');
      return;
    }

    try {
      // Try to upsert the entry
      const { error } = await supabase
        .from('leaderboard')
        .upsert({
          device_id: deviceId,
          initials: sanitizedInitials,
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
      logger.error('Error recording win', error);
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
