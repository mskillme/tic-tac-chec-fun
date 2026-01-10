-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_public;

-- Create the view with SECURITY INVOKER (uses caller's permissions)
CREATE VIEW public.leaderboard_public 
WITH (security_invoker = true)
AS
SELECT id, initials, total_wins, total_games, best_streak, last_played_at, created_at
FROM public.leaderboard;

-- Grant SELECT access to the view for anonymous and authenticated users
GRANT SELECT ON public.leaderboard_public TO anon;
GRANT SELECT ON public.leaderboard_public TO authenticated;