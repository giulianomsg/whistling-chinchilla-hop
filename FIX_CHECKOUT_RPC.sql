-- FIX CHECKOUT FLOW
-- Problem: The 'checkout' function needs to read the decrypted keys, but the RPC for that was missing in the previous fix.

-- 1. Create the Decrypt RPC with correct Text/Base64 handling matching the V5 save logic.
CREATE OR REPLACE FUNCTION public.get_decrypted_payment_config(p_provider TEXT)
RETURNS TABLE (
    provider TEXT,
    publishable_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
-- Critical: Access 'extensions' schema for pgp_sym_decrypt
SET search_path = public, extensions
AS $$
DECLARE
    v_enc_key TEXT := 'capifit_financial_master_key_2026_secured';
BEGIN
    -- Security Check: Only allow Service Role (Edge Functions) or Admin
    -- Note: Edge Functions using Service Role Key bypass RLS but run as 'service_role'.
    IF (auth.role() != 'service_role') AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        cfg.provider,
        cfg.publishable_key,
        -- Decode Base64 -> Bytea -> Decrypt -> Text
        extensions.pgp_sym_decrypt(decode(cfg.secret_key, 'base64'), v_enc_key)::text as secret_key,
        extensions.pgp_sym_decrypt(decode(cfg.webhook_secret, 'base64'), v_enc_key)::text as webhook_secret
    FROM public.payment_gateway_configs cfg
    WHERE cfg.provider = p_provider;
END;
$$;

-- 2. Grant Permissions
-- 'service_role' is used by Edge Functions
GRANT EXECUTE ON FUNCTION public.get_decrypted_payment_config(text) TO service_role;
-- Admins might need it for debugging, though usually they only write.
GRANT EXECUTE ON FUNCTION public.get_decrypted_payment_config(text) TO authenticated;
