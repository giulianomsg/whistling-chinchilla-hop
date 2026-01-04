import React, { useState } from 'react';
import { SubscriptionPlan } from '@/types/financial';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { paymentService } from '@/services/paymentService';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, CreditCard, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
    open: boolean;
    onClose: () => void;
    plan: SubscriptionPlan;
    professionalId: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onClose, plan, professionalId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const isSandbox = import.meta.env.VITE_PAYMENT_MODE === 'sandbox';

    const handleConfirmPayment = async () => {
        if (!user) {
            toast.error("Você precisa estar logado para assinar.");
            return;
        }

        setLoading(true);

        try {
            const result = await paymentService.processPayment({
                studentId: user.id,
                professionalId: professionalId,
                planId: plan.id,
                planName: plan.name,
                price: Number(plan.price),
                durationMonths: plan.duration_months
            });

            if (result.success) {
                toast.success("Assinatura realizada com sucesso!", {
                    description: `Você agora tem acesso ao plano ${plan.name}.`
                });
                onClose();
                // Redirect to dashboard or refresh logic
                navigate('/app/dashboard');
            } else {
                toast.error("Falha no pagamento", {
                    description: result.message || "Tente novamente mais tarde."
                });
            }
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Erro inesperado", {
                description: "Ocorreu um erro ao processar sua assinatura."
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <Dialog open={open} onOpenChange={(val) => !loading && !val && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Finalizar Assinatura</DialogTitle>
                    <DialogDescription>
                        Confirme os detalhes da sua assinatura abaixo.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Plan Summary */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3 border">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Plano</span>
                            <span className="font-semibold">{plan.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-muted-foreground">Duração</span>
                            <span className="font-semibold">{plan.duration_months} meses</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between items-center">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg text-primary">{formatCurrency(plan.price)}</span>
                        </div>
                    </div>

                    {/* Sandbox Warning */}
                    {isSandbox && (
                        <div className="bg-yellow-500/10 border-yellow-500/20 border p-3 rounded-md flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-600">
                                <span className="font-bold block">AMBIENTE DE TESTES</span>
                                Cobrança simulada. Nenhum valor real será debitado do seu cartão.
                            </div>
                        </div>
                    )}

                    <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Pagamento seguro e criptografado
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmPayment} disabled={loading} className="w-full sm:w-auto min-w-[140px]">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
                            </>
                        ) : (
                            <>
                                <CreditCard className="mr-2 h-4 w-4" /> Confirmar Pagamento
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
