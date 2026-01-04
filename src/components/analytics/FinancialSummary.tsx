import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const FinancialSummary = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [totalNet, setTotalNet] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchFinance = async () => {
            const { data } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setTransactions(data);
                const total = data.reduce((acc, curr) => acc + Number(curr.professional_net), 0);
                setTotalNet(total);
            }
        };

        fetchFinance();
    }, [user]);

    const formatMoney = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Receita Líquida Total</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{formatMoney(totalNet)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Vendas Realizadas</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{transactions.length}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Histórico de Transações</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg bg-card/50">
                                <div>
                                    <p className="font-medium">{t.plan_snapshot?.name || 'Plano'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(t.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-600">+{formatMoney(t.professional_net)}</p>
                                    <p className="text-xs text-muted-foreground">Bruto: {formatMoney(t.amount_gross)}</p>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma venda ainda.</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
