import React, { useEffect, useState } from 'react';
import { SubscriptionPlan } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const DEFAULT_PLANS: Partial<SubscriptionPlan>[] = [
    { name: 'Mensal', duration_months: 1, active: false, price: 0 },
    { name: 'Trimestral', duration_months: 3, active: false, price: 0 },
    { name: 'Semestral', duration_months: 6, active: false, price: 0 },
    { name: 'Anual', duration_months: 12, active: false, price: 0 },
];

export const PlanManager: React.FC = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            fetchPlans();
        }
    }, [user]);

    const fetchPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .eq('professional_id', user!.id)
                .order('duration_months', { ascending: true });

            if (error) throw error;

            if (data && data.length > 0) {
                setPlans(data as SubscriptionPlan[]);
            } else {
                // Initialize with layout defaults (temporary IDs until saved)
                const initialPlans = DEFAULT_PLANS.map(p => ({
                    ...p,
                    id: crypto.randomUUID(), // Temp ID
                    professional_id: user!.id,
                })) as SubscriptionPlan[];
                setPlans(initialPlans);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            toast.error("Erro ao carregar planos.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = (index: number, updates: Partial<SubscriptionPlan>) => {
        const newPlans = [...plans];
        newPlans[index] = { ...newPlans[index], ...updates };
        setPlans(newPlans);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Validate prices for active plans
            const activePlans = plans.filter(p => p.active);
            const invalidPlan = activePlans.find(p => p.price <= 0);

            if (invalidPlan) {
                toast.error(`O plano ${invalidPlan.name} está ativo mas sem preço definido.`);
                setSaving(false);
                return;
            }

            // Upsert all plans
            const { error } = await supabase
                .from('subscription_plans')
                .upsert(plans.map(p => ({
                    id: p.id, // If it's a temp ID from randomUUID but not in DB, upsert might fail if uuid form is correct but ID doesn't exist? 
                    // Supabase updates based on PK. If PK doesn't exist, it inserts. 
                    // We need to ensure we don't send fake UUIDs if we want DB to generate them, OR we generate valid UUIDs client side.
                    // Here we generated valid v4 UUIDs so it should be fine.
                    professional_id: user!.id,
                    name: p.name,
                    price: p.price,
                    duration_months: p.duration_months,
                    active: p.active,
                    updated_at: new Date().toISOString()
                })));

            if (error) throw error;

            toast.success("Planos atualizados com sucesso!");
            await fetchPlans(); // Refresh to ensure sync
        } catch (error) {
            console.error("Error saving plans:", error);
            toast.error("Erro ao salvar planos.");
        } finally {
            setSaving(false);
        }
    };

    // Fees for visual calculation
    const getFeePercentage = (months: number) => {
        if (months === 1) return 0.15;
        if (months === 3) return 0.13;
        if (months === 6) return 0.12;
        if (months === 12) return 0.10;
        return 0.15;
    };

    const calculateNet = (price: number, months: number) => {
        const fee = getFeePercentage(months);
        return price * (1 - fee);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan, index) => {
                    const feePercent = getFeePercentage(plan.duration_months) * 100;
                    const netValue = calculateNet(plan.price || 0, plan.duration_months);

                    return (
                        <Card key={plan.name} className={`transition-opacity ${!plan.active ? 'opacity-75' : ''}`}>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                                <Switch
                                    checked={plan.active}
                                    onCheckedChange={(checked) => handleUpdatePlan(index, { active: checked })}
                                />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`price-${plan.name}`}>Preço (R$)</Label>
                                    <Input
                                        id={`price-${plan.name}`}
                                        type="number"
                                        placeholder="0.00"
                                        value={plan.price || ''}
                                        onChange={(e) => handleUpdatePlan(index, { price: parseFloat(e.target.value) || 0 })}
                                        className="text-lg"
                                        min="0"
                                        step="0.01"
                                    />
                                    {plan.price > 0 && (
                                        <div className="text-xs space-y-1 pt-1">
                                            <p className="text-muted-foreground flex justify-between">
                                                <span>Taxa ({feePercent}%):</span>
                                                <span>- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price * (feePercent / 100))}</span>
                                            </p>
                                            <p className="text-green-600 dark:text-green-400 font-medium flex justify-between">
                                                <span>Você recebe:</span>
                                                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netValue)}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>
        </div>
    );
};
