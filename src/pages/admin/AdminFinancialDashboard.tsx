import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, DollarSign } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area
} from 'recharts';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AdminFinancialDashboard() {
    const [gatewayFilter, setGatewayFilter] = useState<'all' | 'stripe' | 'sandbox'>('all');

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['admin_transactions', gatewayFilter],
        queryFn: async () => {
            let query = supabase
                .from('financial_transactions')
                .select(`
            *,
            profiles:student_id(email),
            professionals:professional_id(email)
        `)
                .order('created_at', { ascending: true });

            if (gatewayFilter === 'sandbox') {
                query = query.eq('is_sandbox', true);
            } else if (gatewayFilter === 'stripe') {
                query = query.eq('is_sandbox', false);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    });

    const metrics = useMemo(() => {
        if (!transactions) return { totalGross: 0, totalNet: 0, platformFees: 0, chartData: [] };

        let totalGross = 0;
        let totalNet = 0;
        let platformFees = 0;

        // Group by Month-Year
        const grouped = transactions.reduce((acc: any, t) => {
            const date = new Date(t.created_at);
            const key = `${date.getMonth() + 1}/${date.getFullYear()}`; // MM/YYYY

            if (!acc[key]) {
                acc[key] = { name: key, gross: 0, net: 0, fees: 0, count: 0 };
            }

            const gross = Number(t.amount_gross) || 0;
            const fee = Number(t.platform_fee) || 0;
            const net = Number(t.professional_net) || 0;

            acc[key].gross += gross;
            acc[key].fees += fee;
            acc[key].net += net;
            acc[key].count += 1;

            totalGross += gross;
            platformFees += fee;
            totalNet += net;

            return acc;
        }, {});

        const chartData = Object.values(grouped);
        return { totalGross, totalNet, platformFees, chartData };
    }, [transactions]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Dashboard Financeiro
                    </h1>
                    <p className="text-muted-foreground">Visão geral das transações da plataforma.</p>
                </div>

                <Select value={gatewayFilter} onValueChange={(val: any) => setGatewayFilter(val)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Gateway" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Gateways</SelectItem>
                        <SelectItem value="stripe">Stripe (Produção)</SelectItem>
                        <SelectItem value="sandbox">Sandbox (Testes)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Volume Total Transacionado</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.totalGross)}</div>
                        <p className="text-xs text-muted-foreground">
                            {transactions?.length} transações no período
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita da Plataforma</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.platformFees)}</div>
                        <p className="text-xs text-muted-foreground">
                            Taxas retidas sobre assinaturas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Repasse aos Profissionais</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalNet)}</div>
                        <p className="text-xs text-muted-foreground">
                            Valor líquido destinado aos profissionais
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Evolução de Receita</CardTitle>
                        <CardDescription>Receita bruta vs Taxas da plataforma</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.chartData}>
                                    <defs>
                                        <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(val) => `R$${val}`} width={80} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Area type="monotone" dataKey="gross" name="Volume Bruto" stroke="#8884d8" fillOpacity={1} fill="url(#colorGross)" />
                                    <Area type="monotone" dataKey="fees" name="Receita Plataforma" stroke="#82ca9d" fillOpacity={1} fill="url(#colorFees)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Composição de Repasse</CardTitle>
                        <CardDescription>Valor Líquido vs Taxas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.chartData}>
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(val) => `R$${val}`} width={80} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                    <Legend />
                                    <Bar dataKey="net" name="Repasse Profissional" stackId="a" fill="#3b82f6" />
                                    <Bar dataKey="fees" name="Taxa Plataforma" stackId="a" fill="#22c55e" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
