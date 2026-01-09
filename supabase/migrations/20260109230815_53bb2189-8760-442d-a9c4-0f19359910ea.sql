-- Create leaderboard table for global rankings
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT UNIQUE NOT NULL,
  initials TEXT NOT NULL CHECK (char_length(initials) = 3 AND initials ~ '^[A-Z]{3}$'),
  total_wins INTEGER DEFAULT 0 NOT NULL,
  total_games INTEGER DEFAULT 0 NOT NULL,
  best_streak INTEGER DEFAULT 0 NOT NULL,
  last_played_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster ranking queries
CREATE INDEX idx_leaderboard_total_wins ON public.leaderboard(total_wins DESC);
CREATE INDEX idx_leaderboard_device_id ON public.leaderboard(device_id);

-- Enable Row Level Security
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Anyone can view the leaderboard (public read)
CREATE POLICY "Public read access" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Anyone can insert their own entry (identified by device_id)
CREATE POLICY "Public insert access" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Anyone can update entries (device_id validation happens in edge function)
CREATE POLICY "Public update access" 
ON public.leaderboard 
FOR UPDATE 
USING (true);