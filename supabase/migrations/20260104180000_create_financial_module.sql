-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID NOT NULL REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    duration_months INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create financial_transactions table
-- First create type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'paid', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id),
    professional_id UUID REFERENCES public.profiles(id),
    plan_snapshot JSONB NOT NULL,
    amount_gross NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    professional_net NUMERIC NOT NULL,
    status transaction_status DEFAULT 'pending',
    gateway_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Update client_professionals table
-- First, drop the existing check constraint to allow new status values
ALTER TABLE public.client_professionals DROP CONSTRAINT IF EXISTS client_professionals_status_check;

SELECT 'active' WHERE NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status'); -- Dummy check
-- We will use TEXT column with Check Constraint instead of Enum to be safer with existing data
ALTER TABLE public.client_professionals
ADD CONSTRAINT client_professionals_status_check 
CHECK (status IN ('active', 'inactive', 'paused', 'expired', 'cancelled', 'payment_failed'));

ALTER TABLE public.client_professionals
ADD COLUMN IF NOT EXISTS current_plan_id UUID REFERENCES public.subscription_plans(id),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
-- status column already exists, so we don't ADD it again. The constraint above handles validation.

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payment_mode TEXT DEFAULT 'sandbox',
    platform_fee_percentage NUMERIC DEFAULT 10.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Subscription Plans
DROP POLICY IF EXISTS "Professionals can manage own plans" ON public.subscription_plans;
CREATE POLICY "Professionals can manage own plans" ON public.subscription_plans
    FOR ALL
    USING (auth.uid() = professional_id);

DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;
CREATE POLICY "Anyone can view active plans" ON public.subscription_plans
    FOR SELECT
    USING (active = true);

-- Financial Transactions
DROP POLICY IF EXISTS "Users view own transactions" ON public.financial_transactions;
CREATE POLICY "Users view own transactions" ON public.financial_transactions
    FOR SELECT
    USING (auth.uid() = student_id OR auth.uid() = professional_id);

-- Platform Settings
DROP POLICY IF EXISTS "Anyone can view platform settings" ON public.platform_settings;
CREATE POLICY "Anyone can view platform settings" ON public.platform_settings
    FOR SELECT
    USING (true);
