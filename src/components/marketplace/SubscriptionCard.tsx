import React from 'react';
import { SubscriptionPlan } from '@/types/financial';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SubscriptionCardProps {
    plan: SubscriptionPlan;
    onSelect: (plan: SubscriptionPlan) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ plan, onSelect }) => {
    const isBestValue = plan.name === 'Anual';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const monthlyPrice = plan.price / plan.duration_months;

    return (
        <Card className={`relative flex flex-col h-full transition-all hover:shadow-lg ${isBestValue ? 'border-primary shadow-md' : ''}`}>
            {isBestValue && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                    Melhor Custo-Benefício
                </Badge>
            )}

            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl capitalize">{plan.name}</CardTitle>
                <CardDescription>{plan.duration_months} {plan.duration_months === 1 ? 'Mês' : 'Meses'} de acesso</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4 pt-4">
                <div className="text-center space-y-1">
                    <span className="text-3xl font-bold text-foreground">
                        {formatCurrency(plan.price)}
                    </span>
                    <p className="text-sm text-muted-foreground font-medium">
                        Apenas <span className="text-primary">{formatCurrency(monthlyPrice)}</span>/mês
                    </p>
                </div>

                <div className="space-y-2 w-full pt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Acesso completo ao App
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Treinos Personalizados
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Chat com o Personal
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <Button
                    className="w-full"
                    variant={isBestValue ? "default" : "outline"}
                    onClick={() => onSelect(plan)}
                >
                    Assinar Agora
                </Button>
            </CardFooter>
        </Card>
    );
};
