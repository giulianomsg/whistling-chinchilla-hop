import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, Wallet, Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProfessionalFinance() {
    const navigate = useNavigate();
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['professional_transactions'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('financial_transactions')
                .select(`
            *,
            student:student_id(first_name, last_name, email)
         `) // Note: 'profiles' table usually implies 1:1 with auth. We need to check relation name.
                // 'financial_transactions' usually has foreign key 'student_id' -> 'profiles.id'.
                // If relation name is not defined, we use table name. "profiles:student_id(...)".
                // Let's guess 'profiles' is the referenced table.
                .select(`
            *,
            student_profile:profiles!financial_transactions_student_id_fkey(first_name, last_name, email)
         `)
                // Wait, safer to just use student_id or raw ID if joins are complex without introspection.
                // But UI needs names.
                // Assuming 'financial_transactions.student_id' references 'profiles.id'.
                // Try standard syntax.
                .select(`*, student:student_id(first_name, last_name)`)
                .eq('professional_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback if relation alias is wrong
                console.warn("Error fetching transactions details, trying simple fetch", error);
                const { data: simpleData, error: simpleError } = await supabase
                    .from('financial_transactions')
                    .select('*')
                    .eq('professional_id', user.id)
                    .order('created_at', { ascending: false });
                if (simpleError) throw simpleError;
                return simpleData.map(t => ({ ...t, student: { first_name: 'Aluno', last_name: 'Desconhecido' } }));
            }
            return data;
        }
    });

    const totalReceived = transactions?.reduce((acc, t) => acc + (Number(t.professional_net) || 0), 0) || 0;
    const pendingAmount = 0; // Future implementation

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Minhas Finanças
                    </h1>
                    <p className="text-muted-foreground">Acompanhe seus recebimentos e taxas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Saldo Total Recebido
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{formatCurrency(totalReceived)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Valor líquido após taxas da plataforma
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Último Pagamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {transactions && transactions.length > 0
                                ? formatCurrency(Number(transactions[0].professional_net))
                                : 'R$ 0,00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {transactions && transactions.length > 0
                                ? format(new Date(transactions[0].created_at), "d 'de' MMMM", { locale: ptBR })
                                : '-'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Extrato Financeiro</CardTitle>
                    <CardDescription>Histórico detalhado de assinaturas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Valor Bruto</TableHead>
                                <TableHead className="text-red-500">Taxa (-)</TableHead>
                                <TableHead className="text-green-600 font-bold">Líquido</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions?.map((t: any) => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        {format(new Date(t.created_at), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {t.student?.first_name
                                                    ? `${t.student.first_name} ${t.student.last_name || ''}`
                                                    : 'Aluno'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {t.plan_snapshot?.name || 'Plano'}
                                    </TableCell>
                                    <TableCell>{formatCurrency(t.amount_gross)}</TableCell>
                                    <TableCell className="text-red-500 text-xs">
                                        {formatCurrency(t.platform_fee)}
                                    </TableCell>
                                    <TableCell className="font-bold text-green-600">
                                        {formatCurrency(t.professional_net)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={(t.status === 'paid' || t.status === 'active') ? 'default' : 'secondary'} className="bg-green-100 text-green-800 hover:bg-green-100">
                                            {t.status === 'paid' ? 'Pago' : t.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!transactions || transactions.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhuma transação encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
