
-- 1. Melhorar a tabela de transações para suportar metadados de teste
ALTER TABLE public.financial_transactions 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'credit_card',
ADD COLUMN IF NOT EXISTS is_sandbox BOOLEAN DEFAULT false;

-- 2. Função Atômica para Processar Assinatura (RPC)
CREATE OR REPLACE FUNCTION public.process_subscription_payment(
    p_plan_id UUID,
    p_student_id UUID,
    p_payment_method TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Roda com privilégios de admin para garantir inserts
AS $$
DECLARE
    v_plan RECORD;
    v_transaction_id UUID;
    v_platform_fee NUMERIC;
    v_prof_net NUMERIC;
    v_expires_at TIMESTAMPTZ;
    v_is_sandbox BOOLEAN;
    v_platform_fee_percent NUMERIC := 0.10; 
BEGIN
    -- Configuração de Sandbox (Hardcoded para testes por enquanto)
    v_is_sandbox := true; 

    -- Buscar dados do plano
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Plano não encontrado');
    END IF;

    IF NOT v_plan.active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este plano não está mais ativo');
    END IF;

    -- Calcular Valores
    v_platform_fee := v_plan.price * v_platform_fee_percent;
    v_prof_net := v_plan.price - v_platform_fee;

    -- Calcular expiração (Hoje + Duração do plano)
    v_expires_at := NOW() + (v_plan.duration_months || ' months')::INTERVAL;

    -- INÍCIO DA TRANSAÇÃO ATÔMICA

    -- 1. Registrar Transação Financeira
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
            'price', v_plan.price
        ),
        v_plan.price,
        v_platform_fee,
        v_prof_net,
        'paid', 
        'sand_' || md5(random()::text || clock_timestamp()::text),
        p_payment_method,
        v_is_sandbox
    ) RETURNING id INTO v_transaction_id;

    -- 2. Atualizar/Criar Vínculo (Conceder Acesso)
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
    
    RETURN jsonb_build_object(
        'success', true, 
        'transaction_id', v_transaction_id,
        'message', 'Pagamento processado com sucesso (Sandbox)'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
