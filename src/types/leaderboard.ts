export interface LeaderboardEntry {
  id: string;
  device_id: string;
  initials: string;
  total_wins: number;
  total_games: number;
  best_streak: number;
  last_played_at: string;
  created_at: string;
}

export interface PlayerRank {
  rank: number;
  entry: LeaderboardEntry | null;
}
