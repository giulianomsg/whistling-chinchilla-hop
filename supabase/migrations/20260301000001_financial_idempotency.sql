-- Migration: 20260301000001_financial_idempotency.sql
-- Description: Adds unique idempotency keys to financial transactions to prevent race conditions.

-- 1. Add column with UNIQUE constraint
ALTER TABLE public.financial_transactions
ADD COLUMN IF NOT EXISTS idempotency_key UUID UNIQUE;

-- 2. Update process_subscription_payment to receive the key
CREATE OR REPLACE FUNCTION public.process_subscription_payment(
    p_plan_id UUID,
    p_student_id UUID,
    p_payment_method TEXT,
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan RECORD;
    v_transaction_id UUID;
    v_platform_fee NUMERIC;
    v_prof_net NUMERIC;
    v_expires_at TIMESTAMPTZ;
    v_is_sandbox BOOLEAN;
    v_payment_mode TEXT;
    
    -- New Fee Variables
    v_fee_monthly NUMERIC;
    v_fee_quarterly NUMERIC;
    v_fee_semiannual NUMERIC;
    v_fee_annual NUMERIC;
    v_selected_fee_percent NUMERIC;
    v_platform_fee_ratio NUMERIC;
BEGIN
    -- 1. Check for Idempotency Race Condition inside transaction scope 
    -- (Actually, the UNIQUE constraint on INSERT will be the ultimate barrier)
    IF p_idempotency_key IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM public.financial_transactions WHERE idempotency_key = p_idempotency_key) THEN
            -- In case it exists before INSERT, we can return early without an exception
            RETURN jsonb_build_object('success', false, 'message', 'Transação já processada (chave idempotente existente)');
        END IF;
    END IF;

    -- 2. Carregar Configurações Globais (Granular Fees)
    SELECT 
        payment_mode, 
        COALESCE(fee_monthly_percent, 10.0),
        COALESCE(fee_quarterly_percent, 10.0),
        COALESCE(fee_semiannual_percent, 10.0),
        COALESCE(fee_annual_percent, 10.0)
    INTO 
        v_payment_mode, 
        v_fee_monthly, 
        v_fee_quarterly, 
        v_fee_semiannual, 
        v_fee_annual
    FROM public.platform_settings 
    LIMIT 1;

    -- Define Sandbox
    v_is_sandbox := (v_payment_mode = 'sandbox');

    -- 3. Buscar/Validar Plano
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Plano não encontrado');
    END IF;

    IF NOT v_plan.active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este plano não está mais ativo');
    END IF;

    -- 4. Determine Granular Fee based on Duration
    IF v_plan.duration_months = 12 THEN
        v_selected_fee_percent := v_fee_annual;
    ELSIF v_plan.duration_months = 6 THEN
        v_selected_fee_percent := v_fee_semiannual;
    ELSIF v_plan.duration_months = 3 THEN
        v_selected_fee_percent := v_fee_quarterly;
    ELSE
        v_selected_fee_percent := v_fee_monthly;
    END IF;

    -- Converter porcentagem para razão
    v_platform_fee_ratio := v_selected_fee_percent / 100.0;

    -- 5. Calcular Valores Financeiros
    v_platform_fee := v_plan.price * v_platform_fee_ratio;
    v_prof_net := v_plan.price - v_platform_fee;

    -- 6. Calcular Expiração
    v_expires_at := NOW() + (v_plan.duration_months || ' months')::INTERVAL;

    -- 7. Registrar Transação (Here the UNIQUE constraint safely blocks race condition inserts)
    INSERT INTO public.financial_transactions (
        student_id,
        professional_id,
        plan_snapshot,
        amount_gross,
        platform_fee,
        professional_net,
        status,
        gateway_id,
        payment_method,
        is_sandbox,
        idempotency_key
    ) VALUES (
        p_student_id,
        v_plan.professional_id,
        jsonb_build_object(
            'id', v_plan.id,
            'name', v_plan.name,
            'duration_months', v_plan.duration_months,
            'price', v_plan.price,
            'applied_fee_percent', v_selected_fee_percent
        ),
        v_plan.price,
        v_platform_fee,
        v_prof_net,
        'paid', 
        CASE WHEN v_is_sandbox THEN 'sand_' || md5(random()::text || clock_timestamp()::text) 
             ELSE 'prod_' || md5(random()::text || clock_timestamp()::text) END,
        p_payment_method,
        v_is_sandbox,
        p_idempotency_key
    ) RETURNING id INTO v_transaction_id;

    -- 8. Atualizar Vínculo (UPSERT seguro)
    INSERT INTO public.client_professionals (
        client_id,
        professional_id,
        current_plan_id,
        status,
        expires_at,
        auto_renew
    ) VALUES (
        p_student_id,
        v_plan.professional_id,
        p_plan_id,
        'active',
        v_expires_at,
        false
    )
    ON CONFLICT (client_id, professional_id) 
    DO UPDATE SET
        current_plan_id = EXCLUDED.current_plan_id,
        status = 'active',
        expires_at = v_expires_at,
        updated_at = NOW();
    
    -- Retorno
    RETURN jsonb_build_object(
        'success', true, 
        'transaction_id', v_transaction_id,
        'message', CASE WHEN v_is_sandbox THEN 'Pagamento processado (Sandbox)' ELSE 'Pagamento realizado com sucesso' END
    );

EXCEPTION 
    WHEN unique_violation THEN
        -- Safely catch the DB race condition failure
        RETURN jsonb_build_object('success', false, 'message', 'Pagamento já processado para esta tentativa.');
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$;
