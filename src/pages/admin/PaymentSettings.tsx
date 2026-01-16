import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, CreditCard, Lock, AlertTriangle } from 'lucide-react';

interface PaymentSettingsProps {
    isEmbedded?: boolean;
}

export default function PaymentSettings({ isEmbedded = false }: PaymentSettingsProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [stripeSecrets, setStripeSecrets] = useState({
        publishable: '',
        secret: '',
        webhook: ''
    });
    const [fees, setFees] = useState({
        monthly: 10,
        quarterly: 10,
        semiannual: 10,
        annual: 10
    });

    // Fetch Global Settings to check Sandbox/Prod mode and Fees
    const { data: globalSettings, refetch: refetchSettings } = useQuery({
        queryKey: ['platform_settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*')
                .single();
            if (error) {
                console.error("Error fetching settings:", error);
                return null;
            }
            return data;
        }
    });

    // Populate fees
    useEffect(() => {
        if (globalSettings) {
            setFees({
                monthly: Number(globalSettings.fee_monthly_percent) || 10,
                quarterly: Number(globalSettings.fee_quarterly_percent) || 10,
                semiannual: Number(globalSettings.fee_semiannual_percent) || 10,
                annual: Number(globalSettings.fee_annual_percent) || 10
            });
        }
    }, [globalSettings]);

    // Fetch Existing Configs (Public info only due to RLS/Policy)
    const { data: stripeConfig } = useQuery({
        queryKey: ['payment_gateway_configs', 'stripe'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('payment_gateway_configs')
                .select('provider, is_active, publishable_key')
                .eq('provider', 'stripe')
                .maybeSingle();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        }
    });

    // Populate publishable key if exists
    useEffect(() => {
        if (stripeConfig?.publishable_key) {
            setStripeSecrets(prev => ({ ...prev, publishable: stripeConfig.publishable_key }));
        }
    }, [stripeConfig]);

    // Mutation to toggle Sandbox/Prod
    const toggleModeMutation = useMutation({
        mutationFn: async (isSandbox: boolean) => {
            const mode = isSandbox ? 'sandbox' : 'stripe';

            if (!globalSettings?.id) {
                const { error } = await supabase
                    .from('platform_settings')
                    .insert({ payment_mode: mode })
                    .single();
                if (error) throw error;
                return;
            }

            const { error } = await supabase
                .from('platform_settings')
                .update({ payment_mode: mode })
                .eq('id', globalSettings.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['platform_settings'] });
            toast({ title: "Modo de pagamento atualizado", description: "As alterações têm efeito imediato." });
        },
        onError: (err) => {
            toast({ title: "Erro ao alterar modo", description: err.message, variant: "destructive" });
        }
    });

    // Mutation to Save Fees
    const saveFeesMutation = useMutation({
        mutationFn: async () => {
            if (!globalSettings?.id) return;

            const { error } = await supabase
                .from('platform_settings')
                .update({
                    fee_monthly_percent: fees.monthly,
                    fee_quarterly_percent: fees.quarterly,
                    fee_semiannual_percent: fees.semiannual,
                    fee_annual_percent: fees.annual
                })
                .eq('id', globalSettings.id);

            if (error) throw error;
        },
        onSuccess: () => {
            refetchSettings();
            toast({ title: "Taxas atualizadas", description: "As novas porcentagens serão aplicadas às próximas vendas." });
        },
        onError: (err) => {
            toast({ title: "Erro ao salvar taxas", description: err.message, variant: "destructive" });
        }
    });

    // Mutation to Save Keys via secure RPC
    const saveKeysMutation = useMutation({
        mutationFn: async () => {
            if (!stripeSecrets.publishable) {
                throw new Error("Publishable Key é obrigatória.");
            }

            const { data, error } = await supabase.rpc('admin_save_payment_config', {
                p_provider: 'stripe',
                p_publishable_key: stripeSecrets.publishable,
                p_secret_key: stripeSecrets.secret,
                p_webhook_secret: stripeSecrets.webhook
            });

            if (error) throw error;
            // @ts-ignore
            if (data && data.success === false) {
                // @ts-ignore
                throw new Error(data.message || 'Erro desconhecido');
            }
        },
        onSuccess: () => {
            toast({ title: "Configurações salvas", description: "As chaves foram criptografadas e armazenadas." });
            setStripeSecrets(prev => ({ ...prev, secret: '', webhook: '' }));
            queryClient.invalidateQueries({ queryKey: ['payment_gateway_configs'] });
        },
        onError: (err) => {
            toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
        }
    });

    const isSandbox = globalSettings?.payment_mode === 'sandbox';

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-20">
            {!isEmbedded && (
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Infraestrutura Financeira
                    </h1>
                    <p className="text-muted-foreground">Gerencie gateways, chaves de API e modo de operação (Sandbox vs Produção).</p>
                </div>
            )}

            {/* Global Switch */}
            <Card className="border-l-4 border-l-primary shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Modo de Operação Global
                    </CardTitle>
                    <CardDescription>Defina se a plataforma processa pagamentos reais ou apenas simulações.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between p-6 bg-secondary/10 rounded-b-lg">
                    <div className="space-y-1">
                        <Label className="text-base font-semibold">
                            {isSandbox ? "Ambiente de Testes (Sandbox)" : "Ambiente de Produção (Live)"}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {isSandbox
                                ? "Nenhuma cobrança real será efetuada. Ideal para desenvolvimento e testes."
                                : "ATENÇÃO: Cobranças reais serão processadas via Stripe."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs uppercase font-bold ${isSandbox ? 'text-yellow-600' : 'text-gray-400'}`}>Sandbox</span>
                        <Switch
                            checked={!isSandbox}
                            onCheckedChange={(checked) => toggleModeMutation.mutate(!checked)}
                        />
                        <span className={`text-xs uppercase font-bold ${!isSandbox ? 'text-green-600' : 'text-gray-400'}`}>Produção</span>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Fees (New Section) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" /> Taxas da Plataforma
                    </CardTitle>
                    <CardDescription>
                        Defina a porcentagem retida sobre as vendas de cada tipo de plano.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label>Plano Mensal (%)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0" max="100" step="0.1"
                                    value={fees.monthly}
                                    onChange={e => setFees({ ...fees, monthly: Number(e.target.value) })}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Plano Trimestral (%)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0" max="100" step="0.1"
                                    value={fees.quarterly}
                                    onChange={e => setFees({ ...fees, quarterly: Number(e.target.value) })}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Plano Semestral (%)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0" max="100" step="0.1"
                                    value={fees.semiannual}
                                    onChange={e => setFees({ ...fees, semiannual: Number(e.target.value) })}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Plano Anual (%)</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    min="0" max="100" step="0.1"
                                    value={fees.annual}
                                    onChange={e => setFees({ ...fees, annual: Number(e.target.value) })}
                                    className="pr-8"
                                />
                                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            onClick={() => saveFeesMutation.mutate()}
                            disabled={saveFeesMutation.isPending}
                        >
                            {saveFeesMutation.isPending ? "Salvando..." : "Salvar Taxas"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sandbox Info */}
                <Card className={`transition-all duration-300 ${isSandbox ? 'border-yellow-400 shadow-md bg-yellow-50/50 dark:bg-yellow-900/10' : 'opacity-60 grayscale'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className={`h-5 w-5 ${isSandbox ? 'text-yellow-500' : ''}`} />
                            Gateway Simulado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            O gateway simulado aprova transações instantaneamente sem contatar provedores externos.
                        </p>
                        <div className="p-3 bg-secondary rounded text-xs font-mono">
                            Status: {isSandbox ? 'ATIVO' : 'INATIVO'}
                        </div>
                    </CardContent>
                </Card>

                {/* Stripe Config */}
                <Card className={`transition-all duration-300 ${!isSandbox ? 'border-green-500 shadow-md' : ''}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className={`h-5 w-5 ${!isSandbox ? 'text-primary' : ''}`} />
                            Stripe Payments
                        </CardTitle>
                        <CardDescription>Configuração obrigatória para processar no modo Produção.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Publishable Key (pk_...)</Label>
                            <Input
                                value={stripeSecrets.publishable}
                                onChange={e => setStripeSecrets({ ...stripeSecrets, publishable: e.target.value })}
                                placeholder="Ex: pk_live_..."
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Secret Key (sk_...)</Label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    value={stripeSecrets.secret}
                                    onChange={e => setStripeSecrets({ ...stripeSecrets, secret: e.target.value })}
                                    placeholder={stripeConfig?.publishable_key ? "(Mantido Seguro - Preencha para alterar)" : "Ex: sk_live_..."}
                                    className="pr-10 font-mono text-sm"
                                />
                                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Webhook Secret (whsec_...)</Label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    value={stripeSecrets.webhook}
                                    onChange={e => setStripeSecrets({ ...stripeSecrets, webhook: e.target.value })}
                                    placeholder={stripeConfig?.publishable_key ? "(Mantido Seguro - Preencha para alterar)" : "Ex: whsec_..."}
                                    className="pr-10 font-mono text-sm"
                                />
                                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Necessário para confirmar os pagamentos automaticamente.
                            </p>
                        </div>
                        <Button
                            onClick={() => saveKeysMutation.mutate()}
                            disabled={saveKeysMutation.isPending}
                            className="w-full mt-4"
                        >
                            {saveKeysMutation.isPending ? "Criptografando e Salvando..." : "Salvar Configurações (Criptografado)"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
