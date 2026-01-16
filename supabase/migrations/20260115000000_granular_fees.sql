-- Migration: Add Granular Platform Fees
-- 1. Update platform_settings table structure
ALTER TABLE public.platform_settings 
ADD COLUMN IF NOT EXISTS fee_monthly_percent NUMERIC DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS fee_quarterly_percent NUMERIC DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS fee_semiannual_percent NUMERIC DEFAULT 10.0,
ADD COLUMN IF NOT EXISTS fee_annual_percent NUMERIC DEFAULT 10.0;

-- Optional: Drop old column if you want to force migration (safer to keep for rollback, but we will ignore it)
-- ALTER TABLE public.platform_settings DROP COLUMN IF EXISTS platform_fee_percentage;

-- 2. Update process_subscription_payment function to use new fees
CREATE OR REPLACE FUNCTION public.process_subscription_payment(
    p_plan_id UUID,
    p_student_id UUID,
    p_payment_method TEXT
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
    -- 1. Carregar Configurações Globais (Granular Fees)
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

    -- 2. Buscar/Validar Plano
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Plano não encontrado');
    END IF;

    IF NOT v_plan.active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este plano não está mais ativo');
    END IF;

    -- 3. Determine Granular Fee based on Duration
    -- Assuming duration_months is reliable: 1=Monthly, 3=Quarterly, 6=Semiannual, 12=Annual
    -- Default to Monthly if unknown
    IF v_plan.duration_months = 12 THEN
        v_selected_fee_percent := v_fee_annual;
    ELSIF v_plan.duration_months = 6 THEN
        v_selected_fee_percent := v_fee_semiannual;
    ELSIF v_plan.duration_months = 3 THEN
        v_selected_fee_percent := v_fee_quarterly;
    ELSE
        v_selected_fee_percent := v_fee_monthly; -- Default for 1 month or others
    END IF;

    -- Converter porcentagem (Ex: 10) para razão (0.10)
    v_platform_fee_ratio := v_selected_fee_percent / 100.0;

    -- 4. Calcular Valores Financeiros
    v_platform_fee := v_plan.price * v_platform_fee_ratio;
    v_prof_net := v_plan.price - v_platform_fee;

    -- 5. Calcular Expiração
    v_expires_at := NOW() + (v_plan.duration_months || ' months')::INTERVAL;

    -- 6. Registrar Transação
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
        is_sandbox
    ) VALUES (
        p_student_id,
        v_plan.professional_id,
        jsonb_build_object(
            'id', v_plan.id,
            'name', v_plan.name,
            'duration_months', v_plan.duration_months,
            'price', v_plan.price,
            'applied_fee_percent', v_selected_fee_percent -- Logging applied fee for auditing
        ),
        v_plan.price,
        v_platform_fee,
        v_prof_net,
        'paid', 
        CASE WHEN v_is_sandbox THEN 'sand_' || md5(random()::text || clock_timestamp()::text) 
             ELSE 'prod_' || md5(random()::text || clock_timestamp()::text) END,
        p_payment_method,
        v_is_sandbox
    ) RETURNING id INTO v_transaction_id;

    -- 7. Atualizar Vínculo (UPSERT seguro)
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

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', 'Erro interno: ' || SQLERRM);
END;
$$;
