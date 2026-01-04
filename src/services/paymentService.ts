import { supabase } from "@/integrations/supabase/client";

interface ProcessPaymentParams {
    planId: string;
    studentId: string;
    paymentMethod?: string;
}

interface PaymentResult {
    success: boolean;
    message?: string;
    transactionId?: string;
}

export const paymentService = {
    async processPayment({ planId, studentId, paymentMethod = 'credit_card' }: ProcessPaymentParams): Promise<PaymentResult> {
        try {
            console.log("Iniciando processamento seguro via RPC...");

            // UX delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const { data, error } = await supabase.rpc('process_subscription_payment', {
                p_plan_id: planId,
                p_student_id: studentId,
                p_payment_method: paymentMethod
            });

            if (error) {
                console.error("RPC Error:", error);
                return { success: false, message: "Erro de comunicação com o servidor." };
            }

            const result = data as any;

            if (!result.success) {
                return { success: false, message: result.message };
            }

            return {
                success: true,
                transactionId: result.transaction_id,
                message: result.message
            };

        } catch (err) {
            console.error("Unexpected payment error:", err);
            return { success: false, message: "Erro inesperado ao processar pagamento." };
        }
    }
};
