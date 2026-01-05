import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';

export default function CheckoutSuccess() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'checking' | 'success'>('checking');
    const [dots, setDots] = useState('');

    // Animation for text
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let intervalId: any;
        let attempts = 0;

        const checkStatus = async () => {
            attempts++;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Optionally redirect to login if session lost
                return;
            }

            // Check for any active active connection associated with recent payment
            // Ideally we would check a specific transaction, but polling active status is sufficient for MVP flow
            const { data, error } = await supabase
                .from('client_professionals')
                .select('status, updated_at')
                .eq('client_id', user.id)
                .eq('status', 'active')
                .order('updated_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                // Simple check: if updated recently (within last 5 min)
                const lastUpdate = new Date(data[0].updated_at).getTime();
                const now = new Date().getTime();
                // Allow up to 10 min diff just in case
                if (now - lastUpdate < 10 * 60 * 1000) {
                    setStatus('success');
                    clearInterval(intervalId);
                    setTimeout(() => navigate('/app/dashboard'), 3000);
                }
            }

            // Stop polling after 2 minutes
            if (attempts > 40) { // 40 * 3s = 120s
                clearInterval(intervalId);
                // Show timeout message or manual check button?
            }
        };

        // Initial check
        checkStatus();
        // Poll every 3 seconds
        intervalId = setInterval(checkStatus, 3000);

        return () => clearInterval(intervalId);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-gradient-to-b from-background to-secondary/20">
            <Card className="w-full max-w-md text-center p-8 border-primary/10 shadow-2xl animate-in fade-in zoom-in duration-500 backdrop-blur-sm bg-card/80">
                <CardContent className="space-y-8 pt-4">
                    {status === 'checking' ? (
                        <>
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping delay-75"></div>
                                <div className="absolute inset-2 border-4 border-primary/40 rounded-full animate-ping duration-1000"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                    Processando Pagamento
                                </h1>
                                <p className="text-muted-foreground animate-pulse">
                                    Aguardando confirmação do gateway{dots}
                                </p>
                                <p className="text-xs text-muted-foreground/60">
                                    Isso pode levar alguns segundos.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-in zoom-in spin-in-180 duration-700">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    Pagamento Confirmado!
                                </h1>
                                <p className="text-muted-foreground">
                                    Seu acesso foi liberado com sucesso.
                                </p>
                                <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-4 overflow-hidden">
                                    <div className="bg-green-500 h-full w-full animate-progress-origin-left"></div>
                                </div>
                                <p className="text-xs text-muted-foreground pt-2">
                                    Redirecionando para o Dashboard...
                                </p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <style>{`
        @keyframes progress-origin-left {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(0); }
        }
        .animate-progress-origin-left {
            animation: progress-origin-left 3s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
