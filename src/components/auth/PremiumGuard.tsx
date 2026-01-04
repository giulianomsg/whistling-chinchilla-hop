import React from 'react';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Star, ArrowRight } from 'lucide-react';

interface PremiumGuardProps {
    children: React.ReactNode;
}

export const PremiumGuard: React.FC<PremiumGuardProps> = ({ children }) => {
    const { isPremium, loading } = usePremiumAccess();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="p-4 space-y-4 w-full h-full flex flex-col">
                <div className="flex items-center space-x-4 mb-8">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
        );
    }

    if (!isPremium) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-500">
                <div className="bg-primary/10 p-6 rounded-full mb-6 ring-1 ring-primary/20">
                    <Lock className="w-12 h-12 text-primary" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    Desbloqueie seu Potencial
                </h2>

                <p className="text-muted-foreground text-center max-w-md mb-8 text-lg">
                    Esta funcionalidade é exclusiva para alunos com planos ativos.
                    Conecte-se a um Personal Trainer para receber treinos e dietas sob medida.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-10">
                    <div className="flex items-center p-4 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                        <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
                            <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="font-medium">Treinos Personalizados</span>
                    </div>
                    <div className="flex items-center p-4 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                        <div className="p-2 bg-green-500/10 rounded-lg mr-3">
                            <Star className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="font-medium">Planos Alimentares</span>
                    </div>
                    <div className="flex items-center p-4 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                        <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                            <Star className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="font-medium">Acompanhamento</span>
                    </div>
                    <div className="flex items-center p-4 bg-card/50 backdrop-blur-sm border rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                        <div className="p-2 bg-purple-500/10 rounded-lg mr-3">
                            <Star className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="font-medium">Feedback Direto</span>
                    </div>
                </div>

                <Button
                    size="lg"
                    onClick={() => navigate('/app/marketplace')}
                    className="group text-lg px-8 py-6 h-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                >
                    Encontrar um Personal
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        );
    }

    return <>{children}</>;
};
