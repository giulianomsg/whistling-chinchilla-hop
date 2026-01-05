import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ClientBillingHistory() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['client_transactions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Try to fetch with professional details
            const { data, error } = await supabase
                .from('financial_transactions')
                .select(`*, professional:professional_id(first_name, last_name)`)
                .eq('student_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.warn("Could not fetch professional details, falling back", error);
                const { data: simpleData, error: simpleError } = await supabase
                    .from('financial_transactions')
                    .select('*')
                    .eq('student_id', user.id)
                    .order('created_at', { ascending: false });

                if (simpleError) throw simpleError;
                return simpleData.map(t => ({ ...t, professional: { first_name: 'Profissional', last_name: '' } }));
            }
            return data;
        }
    });

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading) return <div className="p-12 text-center flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6 animate-fade-in pb-20">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Histórico de Pagamentos</h1>
                <p className="text-muted-foreground">Consulte suas assinaturas e renovações.</p>
            </div>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5 text-primary" /> Faturas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Profissional</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.map((t: any) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {format(new Date(t.created_at), "dd/MM/yyyy")}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {t.professional
                                            ? `${t.professional.first_name} ${t.professional.last_name || ''}`
                                            : 'Profissional'}
                                    </TableCell>
                                    <TableCell>{t.plan_snapshot?.name || 'Assinatura'}</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(t.amount_gross)}</TableCell>
                                    <TableCell className="capitalize text-xs text-muted-foreground">{t.payment_method?.replace('_', ' ') || 'Cartão'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                                            Pago
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        Nenhum pagamento registrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
