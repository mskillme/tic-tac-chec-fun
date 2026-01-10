-- Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Public insert access" ON public.leaderboard;
DROP POLICY IF EXISTS "Public update access" ON public.leaderboard;

-- Create secure RLS policies that tie device_id to authenticated user
-- Users can only insert entries where device_id matches their auth.uid()
CREATE POLICY "Users can insert own entries" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (device_id = auth.uid()::text);

-- Users can only update their own entries
CREATE POLICY "Users can update own entries"
ON public.leaderboard 
FOR UPDATE
USING (device_id = auth.uid()::text);

-- Add trigger to prevent device_id changes on update
CREATE OR REPLACE FUNCTION public.prevent_device_id_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.device_id != OLD.device_id THEN
    RAISE EXCEPTION 'Cannot change device_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER prevent_device_id_change_trigger
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_device_id_change();

-- Add trigger to validate stats values
CREATE OR REPLACE FUNCTION public.validate_leaderboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure values are non-negative
  IF NEW.total_wins < 0 OR NEW.total_games < 0 OR NEW.best_streak < 0 THEN
    RAISE EXCEPTION 'Stats values cannot be negative';
  END IF;
  
  -- Ensure wins don't exceed total games
  IF NEW.total_wins > NEW.total_games THEN
    RAISE EXCEPTION 'Total wins cannot exceed total games';
  END IF;
  
  -- Ensure best streak doesn't exceed total wins
  IF NEW.best_streak > NEW.total_wins THEN
    RAISE EXCEPTION 'Best streak cannot exceed total wins';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_leaderboard_stats_trigger
  BEFORE INSERT OR UPDATE ON public.leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_leaderboard_stats();