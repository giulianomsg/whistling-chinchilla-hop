import { supabase } from "@/integrations/supabase/client";

interface ProcessPaymentParams {
    planId: string;
    studentId?: string; // Optional if we fetch user inside, but helpful to pass
    successUrl?: string;
    cancelUrl?: string;
}

interface PaymentResult {
    success: boolean;
    action?: 'redirect' | 'completed';
    url?: string;
    message?: string;
    transactionId?: string;
}

export const paymentService = {
    async processPayment({ planId, successUrl, cancelUrl }: ProcessPaymentParams): Promise<PaymentResult> {
        try {
            console.log("Iniciando fluxo de pagamento...");

            // 1. Check Global Mode
            const { data: settings, error: settingsError } = await supabase
                .from('platform_settings')
                .select('payment_mode')
                .maybeSingle(); // Use maybeSingle to avoid 406 if empty

            if (settingsError) throw settingsError;

            const mode = settings?.payment_mode || 'sandbox';
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error("Usuário não autenticado.");

            if (mode === 'sandbox') {
                console.log("Modo Sandbox detectado via banco de dados.");
                // UX Delay for realism
                await new Promise(resolve => setTimeout(resolve, 1000));

                const { data, error } = await supabase.rpc('process_subscription_payment', {
                    p_plan_id: planId,
                    p_student_id: user.id,
                    p_payment_method: 'sandbox_simulated'
                });

                if (error) throw error;

                const result = data as any;
                if (!result.success) {
                    return { success: false, message: result.message };
                }

                return {
                    success: true,
                    action: 'completed',
                    transactionId: result.transaction_id,
                    message: "Pagamento simulado com sucesso!"
                };

            } else {
                console.log("Modo Produção (Stripe) detectado.");

                if (!successUrl || !cancelUrl) {
                    throw new Error("URLs de retorno não fornecidas para o checkout.");
                }

                const { data, error } = await supabase.functions.invoke('checkout', {
                    body: {
                        planId,
                        successUrl,
                        cancelUrl
                    }
                });

                if (error) {
                    console.error("Function Error:", error);
                    throw new Error("Erro ao conectar com servidor de pagamentos.");
                }

                if (data.error) {
                    throw new Error(data.error);
                }

                return {
                    success: true,
                    action: 'redirect',
                    url: data.url
                };
            }

        } catch (err: any) {
            console.error("Unexpected payment error:", err);
            return { success: false, message: err.message || "Erro inesperado ao processar pagamento." };
        }
    }
};
