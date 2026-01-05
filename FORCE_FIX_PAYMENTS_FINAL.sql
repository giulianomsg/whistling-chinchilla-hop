-- FORCE FIX V5: FINAL RESOLUTION
-- Problem identified: pgcrypto is in 'extensions' schema, but function search_path was restricted to 'public'.

-- 1. Extension (Ensure it exists in 'extensions' or 'public')
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Table Structure
CREATE TABLE IF NOT EXISTS public.payment_gateway_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL UNIQUE CHECK (provider IN ('stripe')),
    is_active BOOLEAN NOT NULL DEFAULT false,
    publishable_key TEXT,
    secret_key TEXT, 
    webhook_secret TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security
ALTER TABLE public.payment_gateway_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins Full Access" ON public.payment_gateway_configs;

CREATE POLICY "Admins Full Access" ON public.payment_gateway_configs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Secure RPC Function (FIXED SEARCH_PATH)
CREATE OR REPLACE FUNCTION public.admin_save_payment_config(
    p_provider TEXT,
    p_publishable_key TEXT,
    p_secret_key TEXT,
    p_webhook_secret TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
-- CRITICAL FIX: Add 'extensions' to search_path so pgcrypto functions are found
SET search_path = public, extensions
AS $$
DECLARE
    v_enc_key TEXT := 'capifit_financial_master_key_2026_secured';
BEGIN
    -- 1. Admin Check
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Acesso negado.');
    END IF;

    -- 2. Upsert using extensions.pgp_sym_encrypt explicit call for safety
    INSERT INTO public.payment_gateway_configs (
        provider, 
        is_active, 
        publishable_key, 
        secret_key, 
        webhook_secret, 
        updated_at
    ) VALUES (
        p_provider,
        true,
        p_publishable_key,
        encode(extensions.pgp_sym_encrypt(p_secret_key, v_enc_key), 'base64'),
        encode(extensions.pgp_sym_encrypt(p_webhook_secret, v_enc_key), 'base64'),
        NOW()
    )
    ON CONFLICT (provider)
    DO UPDATE SET
        is_active = true,
        publishable_key = EXCLUDED.publishable_key,
        secret_key = EXCLUDED.secret_key,
        webhook_secret = EXCLUDED.webhook_secret,
        updated_at = NOW();

    RETURN jsonb_build_object('success', true, 'message', 'Configurações salvas e criptografadas com sucesso.');
END;
$$;

-- 5. Permissions
REVOKE EXECUTE ON FUNCTION public.admin_save_payment_config(text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_save_payment_config(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_save_payment_config(text, text, text, text) TO service_role;

-- 6. Helper for public key (FIXED SEARCH_PATH)
CREATE OR REPLACE FUNCTION public.get_public_payment_config(p_provider TEXT)
RETURNS TABLE (publishable_key TEXT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT publishable_key 
  FROM public.payment_gateway_configs 
  WHERE provider = p_provider AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_payment_config(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_payment_config(text) TO anon;
