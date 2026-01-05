-- 1. Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Payment Gateway Configurations Table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_gateway_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL UNIQUE CHECK (provider IN ('stripe')),
    is_active BOOLEAN NOT NULL DEFAULT false,
    publishable_key TEXT,
    secret_key TEXT, -- Must be TEXT to store Base64 string
    webhook_secret TEXT, -- Must be TEXT to store Base64 string
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.payment_gateway_configs ENABLE ROW LEVEL SECURITY;

-- 4. Policies
DROP POLICY IF EXISTS "Authenticated users can read config" ON public.payment_gateway_configs;
DROP POLICY IF EXISTS "Admins can manage config" ON public.payment_gateway_configs;

CREATE POLICY "Authenticated users can read config" ON public.payment_gateway_configs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage config" ON public.payment_gateway_configs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. RPC Function to Upsert Keys securely
-- Drop first to handle any signature changes or stuck states
DROP FUNCTION IF EXISTS public.upsert_payment_config(text, text, text, text);

CREATE OR REPLACE FUNCTION public.upsert_payment_config(
    p_provider TEXT,
    p_publishable_key TEXT,
    p_secret_key TEXT,
    p_webhook_secret TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_enc_key TEXT := 'capifit_financial_master_key_2026_secured';
    v_active BOOLEAN := true;
BEGIN
    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- Upsert with Base64 Encoding for Text compatibility
    INSERT INTO public.payment_gateway_configs (
        provider, 
        is_active, 
        publishable_key, 
        secret_key, 
        webhook_secret, 
        updated_at
    ) VALUES (
        p_provider,
        v_active,
        p_publishable_key,
        -- FIX: Encode bytea result from encrypt to base64 text
        encode(pgp_sym_encrypt(p_secret_key, v_enc_key), 'base64'),
        encode(pgp_sym_encrypt(p_webhook_secret, v_enc_key), 'base64'),
        NOW()
    )
    ON CONFLICT (provider)
    DO UPDATE SET
        is_active = v_active,
        publishable_key = EXCLUDED.publishable_key,
        secret_key = EXCLUDED.secret_key,
        webhook_secret = EXCLUDED.webhook_secret,
        updated_at = NOW();

    RETURN jsonb_build_object('success', true, 'message', 'Configuração salva com segurança.');
END;
$$;

-- Grant Execute permissions to ensure visibility
GRANT EXECUTE ON FUNCTION public.upsert_payment_config(text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_payment_config(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_payment_config(text, text, text, text) TO postgres;
GRANT EXECUTE ON FUNCTION public.upsert_payment_config(text, text, text, text) TO anon;

-- 6. Helper RPC to Decrypt (Updated for Base64)
CREATE OR REPLACE FUNCTION public.get_decrypted_payment_config(p_provider TEXT)
RETURNS TABLE (
    provider TEXT,
    publishable_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_enc_key TEXT := 'capifit_financial_master_key_2026_secured';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        cfg.provider,
        cfg.publishable_key,
        -- FIX: Decode base64 text to bytea before decrypting
        pgp_sym_decrypt(decode(cfg.secret_key, 'base64'), v_enc_key) as secret_key,
        pgp_sym_decrypt(decode(cfg.webhook_secret, 'base64'), v_enc_key) as webhook_secret
    FROM public.payment_gateway_configs cfg
    WHERE cfg.provider = p_provider;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_decrypted_payment_config(text) TO authenticated;
