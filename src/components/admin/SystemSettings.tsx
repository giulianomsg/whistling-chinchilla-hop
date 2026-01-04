import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { AlertTriangle, Save, Loader2, CreditCard } from 'lucide-react';

export const SystemSettings = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        id: '',
        payment_mode: 'sandbox',
        platform_fee_percentage: 10
    });

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('platform_settings')
                .select('*')
                .limit(1)
                .single();

            if (data) {
                setSettings({
                    id: data.id,
                    payment_mode: data.payment_mode,
                    platform_fee_percentage: Number(data.platform_fee_percentage)
                });
            } else if (error) {
                console.error("Erro ao carregar configurações:", error);
                // Fallback silencioso ou toast de erro, se necessário
            }
            setLoading(false);
        };

        if (profile?.role === 'admin') {
            fetchSettings();
        }
    }, [profile]);

    const handleSave = async () => {
        if (!settings.id) return;
        setSaving(true);

        const { error } = await supabase
            .from('platform_settings')
            .update({
                payment_mode: settings.payment_mode,
                platform_fee_percentage: settings.platform_fee_percentage,
                updated_at: new Date().toISOString()
            })
            .eq('id', settings.id);

        if (error) {
            toast.error("Erro ao salvar configurações", { description: error.message });
        } else {
            toast.success("Configurações atualizadas com sucesso!");
        }
        setSaving(false);
    };

    const toggleMode = (checked: boolean) => {
        setSettings(prev => ({ ...prev, payment_mode: checked ? 'sandbox' : 'production' }));
        // Opcional: Auto-save no toggle
        // setTimeout(handleSave, 100); 
    };

    if (profile?.role !== 'admin') {
        return <div className="p-4 text-center text-red-500">Acesso Negado</div>;
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Configurações de Pagamento
                </CardTitle>
                <CardDescription>
                    Gerencie o modo de operação do gateway e as taxas da plataforma.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Sandbox Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                    <div className="space-y-0.5">
                        <div className="font-medium text-base">Modo Sandbox (Testes)</div>
                        <div className="text-sm text-muted-foreground">
                            Ative para simular pagamentos sem cobrança real.
                            {settings.payment_mode === 'sandbox' && (
                                <span className="text-yellow-500 font-bold ml-2 flex items-center inline-flex gap-1 text-xs">
                                    <AlertTriangle className="w-3 h-3" /> ATIVO
                                </span>
                            )}
                        </div>
                    </div>
                    <Switch
                        checked={settings.payment_mode === 'sandbox'}
                        onCheckedChange={toggleMode}
                    />
                </div>

                {/* Platform Fee */}
                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card/50">
                    <label className="font-medium text-base">Taxa da Plataforma (%)</label>
                    <div className="text-sm text-muted-foreground mb-2">
                        Porcentagem retida de cada transação (Ex: 10 para 10%).
                    </div>
                    <div className="flex items-center gap-2 max-w-xs">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={settings.platform_fee_percentage}
                            onChange={(e) => setSettings({ ...settings, platform_fee_percentage: Number(e.target.value) })}
                        />
                        <span className="text-muted-foreground">%</span>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Salvar Alterações
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
};
