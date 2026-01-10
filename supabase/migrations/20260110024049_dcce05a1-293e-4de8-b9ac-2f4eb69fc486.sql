-- Create a public view that excludes device_id for leaderboard display
CREATE VIEW public.leaderboard_public AS
SELECT id, initials, total_wins, total_games, best_streak, last_played_at, created_at
FROM public.leaderboard;

-- Grant SELECT access to the view for anonymous and authenticated users
GRANT SELECT ON public.leaderboard_public TO anon;
GRANT SELECT ON public.leaderboard_public TO authenticated;

-- Update RLS policies: remove public read access, allow users to read only their own entries
DROP POLICY IF EXISTS "Public read access" ON public.leaderboard;

-- Create new policy for users to read their own entries (needed for player rank lookup)
CREATE POLICY "Users can read own entries" 
ON public.leaderboard 
FOR SELECT 
USING (device_id = (auth.uid())::text);