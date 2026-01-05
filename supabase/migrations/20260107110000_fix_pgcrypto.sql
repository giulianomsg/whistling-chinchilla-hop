-- Enable pgcrypto extension explicitly for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reload the function to ensure it is recognized correctly
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
