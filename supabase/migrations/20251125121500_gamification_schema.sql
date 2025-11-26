-- Add gamification columns to workout_sessions
ALTER TABLE public.workout_sessions 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS external_id text,
ADD COLUMN IF NOT EXISTS trust_score numeric(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS normalized_effort numeric(10,2),
ADD COLUMN IF NOT EXISTS calories_burned integer,
ADD COLUMN IF NOT EXISTS distance_meters numeric(10,2),
ADD COLUMN IF NOT EXISTS heart_rate_avg integer,
ADD COLUMN IF NOT EXISTS elevation_gain numeric(10,2),
ADD COLUMN IF NOT EXISTS final_xp integer DEFAULT 0;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    code text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    icon_url text,
    xp_reward integer DEFAULT 0,
    criteria jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (Public read, Admin write)
CREATE POLICY "Everyone can view achievements" ON public.achievements
    FOR SELECT USING (true);

-- Policies for user_achievements (Users view their own, System inserts)
CREATE POLICY "Users can view own achievements" ON public.user_achievements
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.achievements TO authenticated, anon;
GRANT SELECT ON public.user_achievements TO authenticated;
