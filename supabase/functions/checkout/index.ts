import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate User
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }
    const student_id = user.id;

    // 2. Parse Request
    const { planId, priceId, successUrl, cancelUrl } = await req.json();
    if (!planId) throw new Error('Missing planId');
    if (!successUrl || !cancelUrl) throw new Error('Missing return URLs');

    // 3. Get Stripe Secrets (Using Admin Client)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: configData, error: configError } = await supabaseAdmin
      .rpc('get_decrypted_payment_config', { p_provider: 'stripe' });

    if (configError) throw configError;
    if (!configData || configData.length === 0) {
      throw new Error('Stripe configuration missing in database');
    }
    const { secret_key } = configData[0];
    if (!secret_key) throw new Error('Stripe secret key not found');

    // 4. Init Stripe
    const stripe = new Stripe(secret_key, {
      apiVersion: '2023-10-16', // Use a pinned version
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 5. Get Plan Details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    if (planError || !plan) throw new Error('Plan not found');

    // 6. Create Checkout Session
    // Use priceId if provided, else construct ad-hoc price data from plan
    const lineItem = priceId 
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'brl',
            product_data: {
              name: plan.name,
              description: `Plano de ${plan.duration_months} meses`,
            },
            unit_amount: Math.round(plan.price * 100), // Stripes uses cents
            recurring: {
              interval: 'month',
              interval_count: plan.duration_months
            }
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        student_id: student_id,
        plan_id: planId
      }
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Checkout Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
