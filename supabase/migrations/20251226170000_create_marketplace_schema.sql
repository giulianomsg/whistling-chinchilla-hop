-- Migration: Marketplace de Profissionais
-- Objetivo: Adicionar campos de perfil profissional e criar view para listagem otimizada

-- 1. Adicionar colunas ao perfil (se não existirem)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price_range TEXT, -- Ex: 'low', 'medium', 'high' ou faixas 'R$100-200'
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 2. Garantir que a tabela de reviews existe (caso a migration 0072 não tenha rodado ou para reforço)
-- (Omitido pois já vimos no arquivo 0072, mas vamos garantir índices)

CREATE INDEX IF NOT EXISTS idx_professional_reviews_professional_id ON public.professional_reviews(professional_id);

-- 3. View Otimizada para o Marketplace
-- Retorna os dados do perfil + média de avaliações + contagem
CREATE OR REPLACE VIEW public.marketplace_professionals_view AS
SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.specialties,
    p.price_range,
    p.years_experience,
    p.instagram_url,
    p.city,
    p.state,
    -- Cálculo da Média Geral (somando as 4 categorias e dividindo por 4, depois média das reviews)
    COALESCE(
        (
            SELECT AVG(
                (rating_punctuality + rating_didactics + rating_knowledge + rating_monitoring) / 4.0
            )
            FROM public.professional_reviews r 
            WHERE r.professional_id = p.id
        ), 
        0
    ) as overall_rating,
    -- Contagem de Reviews
    (
        SELECT COUNT(*) 
        FROM public.professional_reviews r 
        WHERE r.professional_id = p.id
    ) as review_count
FROM public.profiles p
WHERE p.role = 'professional';

-- 4. Função para buscar reviews com detalhes do autor (para a página de detalhes)
CREATE OR REPLACE FUNCTION public.get_professional_reviews_details(prof_id UUID)
RETURNS TABLE (
    id UUID,
    rating_punctuality INTEGER,
    rating_didactics INTEGER,
    rating_knowledge INTEGER,
    rating_monitoring INTEGER,
    comment TEXT,
    created_at TIMESTAMPTZ,
    client_name TEXT,
    client_avatar TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.rating_punctuality,
        r.rating_didactics,
        r.rating_knowledge,
        r.rating_monitoring,
        r.comment,
        r.created_at,
        p.full_name as client_name,
        p.avatar_url as client_avatar
    FROM public.professional_reviews r
    JOIN public.profiles p ON r.client_id = p.id
    WHERE r.professional_id = prof_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS para a View (Supabase views herdam RLS das tabelas base, mas explicitamente granting select helps)
GRANT SELECT ON public.marketplace_professionals_view TO authenticated;
GRANT SELECT ON public.marketplace_professionals_view TO anon;
