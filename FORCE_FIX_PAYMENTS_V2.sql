-- FORCE FIX V2: Use JSONB to avoid signature mismatches
-- 1. Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Payment Gateway Configurations Table if it doesn't exist
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

-- 5. RPC Function V2 (JSONB)
DROP FUNCTION IF EXISTS public.upsert_payment_config_v2(jsonb);

CREATE OR REPLACE FUNCTION public.upsert_payment_config_v2(payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_enc_key TEXT := 'capifit_financial_master_key_2026_secured';
    v_provider TEXT;
    v_publishable_key TEXT;
    v_secret_key TEXT;
    v_webhook_secret TEXT;
BEGIN
    -- Extract values from JSONB
    v_provider := payload->>'provider';
    v_publishable_key := payload->>'publishable_key';
    v_secret_key := payload->>'secret_key';
    v_webhook_secret := payload->>'webhook_secret';

    -- Authorization Check
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
    END IF;

    -- Upsert
    INSERT INTO public.payment_gateway_configs (
        provider, 
        is_active, 
        publishable_key, 
        secret_key, 
        webhook_secret, 
        updated_at
    ) VALUES (
        v_provider,
        true,
        v_publishable_key,
        encode(pgp_sym_encrypt(v_secret_key, v_enc_key), 'base64'),
        encode(pgp_sym_encrypt(v_webhook_secret, v_enc_key), 'base64'),
        NOW()
    )
    ON CONFLICT (provider)
    DO UPDATE SET
        is_active = true,
        publishable_key = EXCLUDED.publishable_key,
        secret_key = EXCLUDED.secret_key,
        webhook_secret = EXCLUDED.webhook_secret,
        updated_at = NOW();

    RETURN jsonb_build_object('success', true, 'message', 'Configuração salva com segurança (v2).');
END;
$$;

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION public.upsert_payment_config_v2(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_payment_config_v2(jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.upsert_payment_config_v2(jsonb) TO anon;

-- Helper to check if it's working
SELECT 'Migration V2 Applied Successfully' as status;
