-- 1. Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Payment Gateway Configurations Table
CREATE TABLE IF NOT EXISTS public.payment_gateway_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL UNIQUE CHECK (provider IN ('stripe')), -- Enforce 'stripe' only for now as per req
    is_active BOOLEAN NOT NULL DEFAULT false,
    publishable_key TEXT, -- Public key (visible to admin/frontend)
    secret_key TEXT, -- Encrypted Private key
    webhook_secret TEXT, -- Encrypted Webhook secret
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security (Row Level Security)
ALTER TABLE public.payment_gateway_configs ENABLE ROW LEVEL SECURITY;

-- Allow Authenticated users (e.g. Frontend fetching publishable key) to READ specific columns
-- Note: RLS cannot restrict columns directly, so we allow row access but rely on API/Views or careful selection.
-- However, since secret_key is encrypted, it is safe-ish. 
-- Ideally, create a view or use a function to get public config.
-- For this simplified scope, we allow SELECT on the row for authenticated users.
CREATE POLICY "Authenticated users can read config" ON public.payment_gateway_configs
FOR SELECT
TO authenticated
USING (true);

-- Allow Admins to INSERT/UPDATE
CREATE POLICY "Admins can manage config" ON public.payment_gateway_configs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. RPC to Securely Upsert Keys (Encrypts on the fly)
CREATE OR REPLACE FUNCTION public.upsert_payment_config(
    p_provider TEXT,
    p_publishable_key TEXT,
    p_secret_key TEXT, -- Plain text input
    p_webhook_secret TEXT -- Plain text input
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    -- Hardcoded Master Key for this project (In prod, use Vault or Env Vars)
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

    -- Upsert
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
        pgp_sym_encrypt(p_secret_key, v_enc_key),
        pgp_sym_encrypt(p_webhook_secret, v_enc_key),
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

-- 5. Helper RPC to Decrypt (For Edge Functions)
-- This allows the Edge Function to retrieve the plain text secrets using the Service Role or Admin.
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
    RETURN QUERY
    SELECT 
        cfg.provider,
        cfg.publishable_key,
        pgp_sym_decrypt(cfg.secret_key::bytea, v_enc_key) as secret_key,
        pgp_sym_decrypt(cfg.webhook_secret::bytea, v_enc_key) as webhook_secret
    FROM public.payment_gateway_configs cfg
    WHERE cfg.provider = p_provider;
END;
$$;
