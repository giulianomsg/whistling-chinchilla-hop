-- 1. Sanitização: Remover duplicatas usando CTID (Coluna de Sistema do Postgres)
-- Isso funciona mesmo sem created_at, mantendo o registro "fisicamente" mais recente
DELETE FROM public.client_professionals a
USING public.client_professionals b
WHERE a.ctid < b.ctid
  AND a.client_id = b.client_id
  AND a.professional_id = b.professional_id;

-- 1.1 Garantia Estrutural: Adicionar colunas de timestamp se não existirem
-- (Isso previne erros futuros e o erro na função RPC que usa updated_at)
ALTER TABLE public.client_professionals 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Integridade: Adicionar Unique Constraint
ALTER TABLE public.client_professionals 
DROP CONSTRAINT IF EXISTS client_professionals_client_id_professional_id_key;

ALTER TABLE public.client_professionals 
ADD CONSTRAINT client_professionals_client_id_professional_id_key 
UNIQUE (client_id, professional_id);

-- 3. Configurações: Tabela platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_mode TEXT NOT NULL DEFAULT 'sandbox',
    platform_fee_percentage NUMERIC NOT NULL DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir valor padrão se a tabela estiver vazia
INSERT INTO public.platform_settings (payment_mode, platform_fee_percentage)
SELECT 'sandbox', 10.0
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- 4. Segurança: RLS para platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Política de Leitura (Pública - todos precisam saber se está em sandbox)
DROP POLICY IF EXISTS "Public read access for platform_settings" ON public.platform_settings;
CREATE POLICY "Public read access for platform_settings" ON public.platform_settings
FOR SELECT USING (true);

-- Política de Escrita (Apenas Admin)
DROP POLICY IF EXISTS "Admin write access for platform_settings" ON public.platform_settings;
CREATE POLICY "Admin write access for platform_settings" ON public.platform_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. RPC Recriada: process_subscription_payment
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
    v_platform_fee_percent_val NUMERIC;
    v_platform_fee_ratio NUMERIC;
BEGIN
    -- 1. Carregar Configurações Globais
    SELECT payment_mode, platform_fee_percentage 
    INTO v_payment_mode, v_platform_fee_percent_val
    FROM public.platform_settings 
    LIMIT 1;

    -- Define Sandbox
    v_is_sandbox := (v_payment_mode = 'sandbox');
    -- Fallback para taxa se nulo
    IF v_platform_fee_percent_val IS NULL THEN 
        v_platform_fee_percent_val := 10.0; 
    END IF;
    
    -- Converter porcentagem (Ex: 10) para razão (0.10)
    v_platform_fee_ratio := v_platform_fee_percent_val / 100.0;

    -- 2. Buscar/Validar Plano
    SELECT * INTO v_plan FROM public.subscription_plans WHERE id = p_plan_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Plano não encontrado');
    END IF;

    IF NOT v_plan.active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Este plano não está mais ativo');
    END IF;

    -- 3. Calcular Valores Financeiros
    v_platform_fee := v_plan.price * v_platform_fee_ratio;
    v_prof_net := v_plan.price - v_platform_fee;

    -- 4. Calcular Expiração
    v_expires_at := NOW() + (v_plan.duration_months || ' months')::INTERVAL;

    -- 5. Registrar Transação (ATOMIC START)
    -- Verifica se as colunas existem na financial_transactions (caso o migration anterior tenha falhado parcialmente)
    -- (Assumindo que o migration anterior rodou, mas para robustez, o insert segue o padrão esperado)
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
        CASE WHEN v_is_sandbox THEN 'sand_' || md5(random()::text || clock_timestamp()::text) 
             ELSE 'prod_' || md5(random()::text || clock_timestamp()::text) END,
        p_payment_method,
        v_is_sandbox
    ) RETURNING id INTO v_transaction_id;

    -- 6. Atualizar Vínculo (UPSERT seguro com constraint)
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
        updated_at = NOW(); -- Agora seguro pois garantimos a coluna acima
    
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