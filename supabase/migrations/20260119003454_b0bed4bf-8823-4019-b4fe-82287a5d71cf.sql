-- Recreate leaderboard_public view WITHOUT security_invoker so it's publicly readable
DROP VIEW IF EXISTS public.leaderboard_public;

CREATE VIEW public.leaderboard_public AS
  SELECT id, initials, total_wins, total_games, best_streak, last_played_at, created_at
  FROM public.leaderboard;

-- Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.leaderboard_public TO authenticated, anon;