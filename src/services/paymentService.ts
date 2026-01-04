import { supabase } from "@/integrations/supabase/client";

interface PaymentRequest {
    studentId: string;
    professionalId: string;
    planId: string;
    planName: string;
    price: number;
    durationMonths: number;
}

interface PaymentResult {
    success: boolean;
    message?: string;
    transactionId?: string;
}

export const paymentService = {
    async processPayment(data: PaymentRequest): Promise<PaymentResult> {
        const paymentMode = import.meta.env.VITE_PAYMENT_MODE;
        const isSandbox = paymentMode === 'sandbox';

        if (isSandbox) {
            console.log("Processing Sandbox Payment...", data);

            // 5.2. Delay 2s
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5.3. Random success (90%)
            const isSuccess = Math.random() < 0.9;

            if (!isSuccess) {
                return { success: false, message: "Pagamento falhou (Simulação Sandbox)" };
            }

            // 5.4. Success - Insert into financial_transactions
            const platformFee = Number(data.price) * 0.10; // 10% fee assumed for now
            const professionalNet = Number(data.price) - platformFee;

            const { data: transaction, error: transError } = await supabase
                .from('financial_transactions')
                .insert({
                    student_id: data.studentId,
                    professional_id: data.professionalId,
                    plan_snapshot: {
                        name: data.planName,
                        price: data.price,
                        duration_months: data.durationMonths
                    },
                    amount_gross: data.price,
                    platform_fee: platformFee,
                    professional_net: professionalNet,
                    status: 'paid',
                    gateway_id: 'sandbox_' + Math.random().toString(36).substr(2, 9)
                })
                .select()
                .single();

            if (transError) {
                console.error("Transaction Error", transError);
                return { success: false, message: "Erro ao registrar transação" };
            }

            // Update expires_at in client_professionals
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + data.durationMonths);

            // We use upsert to ensure the link exists and is updated
            const { error: upsertError } = await supabase
                .from('client_professionals')
                .upsert({
                    client_id: data.studentId,
                    professional_id: data.professionalId,
                    current_plan_id: data.planId,
                    expires_at: expiresAt.toISOString(),
                    status: 'active',
                    auto_renew: false
                }, { onConflict: 'client_id,professional_id' }); // Assuming composite uniqueness or similar constraint exists/will be handled by Supabase upsert logic if PK is set.

            if (upsertError) {
                console.error("Link Error", upsertError);
                // Don't fail the whole payment if just the link update fails, but strictly we should ensure consistency.
                // For sandbox, we'll return error.
                return { success: false, message: "Erro ao atualizar status da assinatura" };
            }

            return { success: true, transactionId: transaction.id };
        }

        return { success: false, message: "Modo de produção não implementado" };
    }
};
