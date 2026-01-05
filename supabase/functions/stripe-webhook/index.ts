import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno";

serve(async (req) => {
    try {
        const signature = req.headers.get('Stripe-Signature');
        if (!signature) {
            return new Response('No Stripe signature found', { status: 400 });
        }

        const body = await req.text();

        // 1. Get Config (Secrets)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: configData, error: configError } = await supabaseAdmin
            .rpc('get_decrypted_payment_config', { p_provider: 'stripe' });

        if (configError || !configData || configData.length === 0) {
            console.error('Stripe config missing');
            return new Response('Stripe config missing', { status: 500 });
        }

        const { secret_key, webhook_secret } = configData[0];

        const stripe = new Stripe(secret_key, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // 2. Verify Signature
        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhook_secret);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        // 3. Process Event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Metadata is key
            const { student_id, plan_id } = session.metadata || {};

            if (student_id && plan_id) {
                console.log(`Processing payment for Student: ${student_id}, Plan: ${plan_id}`);

                const { data, error } = await supabaseAdmin.rpc('process_subscription_payment', {
                    p_plan_id: plan_id,
                    p_student_id: student_id,
                    p_payment_method: 'stripe'
                });

                if (error) {
                    console.error('RPC process_subscription_payment failed:', error);
                    return new Response('Internal Server Error processing payment', { status: 500 });
                }
                console.log('Payment processed successfully:', data);
            } else {
                console.warn('Session missing metadata (student_id or plan_id)');
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Unexpected error in webhook:', error);
        return new Response('Server Error', { status: 500 });
    }
});
