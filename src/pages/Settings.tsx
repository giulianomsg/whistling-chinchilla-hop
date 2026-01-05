import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, CreditCard, Bell, Key } from 'lucide-react';

// Sub-components
import ProfileSettings from './ProfileSettings';
import PaymentSettings from './admin/PaymentSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'admin';

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 pb-20 animate-in fade-in zoom-in-95 duration-500">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Configurações do Sistema
                    </h1>
                    <p className="text-muted-foreground">
                        Gerencie suas preferências, perfil e assinaturas.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] bg-muted/50 p-1">
                    <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <User className="h-4 w-4" /> Perfil
                    </TabsTrigger>

                    {isAdmin && (
                        <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <CreditCard className="h-4 w-4" /> Pagamentos
                        </TabsTrigger>
                    )}

                    <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Bell className="h-4 w-4" /> Notificações
                    </TabsTrigger>

                    {isAdmin && (
                        <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Key className="h-4 w-4" /> Integrações
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="profile" className="outline-none">
                    <div className="mt-2">
                        <ProfileSettings isEmbedded={true} />
                    </div>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="payments" className="outline-none">
                        <div className="mt-2">
                            <PaymentSettings isEmbedded={true} />
                        </div>
                    </TabsContent>
                )}

                <TabsContent value="notifications" className="outline-none">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Preferências de Notificação</CardTitle>
                            <CardDescription>Gerencie como e quando você deseja ser notificado.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                            Preferências de notificação em breve...
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="integrations" className="outline-none">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> Integrações & APIs</CardTitle>
                                <CardDescription>Gestão de chaves de API e webhooks externos.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                                Gestão de APIs em breve...
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
