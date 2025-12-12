-- Create professional_reviews table
CREATE TABLE IF NOT EXISTS public.professional_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating_punctuality INTEGER CHECK (rating_punctuality BETWEEN 1 AND 5),
    rating_didactics INTEGER CHECK (rating_didactics BETWEEN 1 AND 5),
    rating_knowledge INTEGER CHECK (rating_knowledge BETWEEN 1 AND 5),
    rating_monitoring INTEGER CHECK (rating_monitoring BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(professional_id, client_id) -- Only one review per client-professional pair
);

-- RLS Policies
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can read reviews
CREATE POLICY "Reviews are public" ON public.professional_reviews
    FOR SELECT USING (true);

-- Clients can insert their own reviews
CREATE POLICY "Clients can review" ON public.professional_reviews
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own reviews
CREATE POLICY "Clients can update own review" ON public.professional_reviews
    FOR UPDATE USING (auth.uid() = client_id);

-- RPC Function to calculate reputation
CREATE OR REPLACE FUNCTION public.get_professional_reputation(prof_id UUID)
RETURNS TABLE (
    avg_punctuality NUMERIC,
    avg_didactics NUMERIC,
    avg_knowledge NUMERIC,
    avg_monitoring NUMERIC,
    total_reviews BIGINT,
    overall_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROUND(AVG(rating_punctuality), 1) as avg_punctuality,
        ROUND(AVG(rating_didactics), 1) as avg_didactics,
        ROUND(AVG(rating_knowledge), 1) as avg_knowledge,
        ROUND(AVG(rating_monitoring), 1) as avg_monitoring,
        COUNT(*) as total_reviews,
        ROUND((AVG(rating_punctuality) + AVG(rating_didactics) + AVG(rating_knowledge) + AVG(rating_monitoring)) / 4.0, 1) as overall_score
    FROM public.professional_reviews
    WHERE professional_id = prof_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
