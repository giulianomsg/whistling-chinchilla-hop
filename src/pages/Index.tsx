import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Dumbbell, Users, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  // Se já estiver autenticado, redirecionar para o dashboard
  if (user) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Dumbbell className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            CapiFit
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sua plataforma completa para fitness e nutrição. Conecte-se com profissionais 
            e alcance seus objetivos de saúde.
          </p>
          <div className="mt-8 space-x-4">
            <Button size="lg" asChild>
              <a href="/auth">Começar Agora</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/auth">Entrar</a>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Conexão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Conecte-se com profissionais de fitness e nutrição qualificados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acompanhe sua evolução com planos personalizados e métricas detalhadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-orange-600" />
                Treinos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Planos de treino elaborados por profissionais para seus objetivos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Seus dados protegidos com as melhores práticas de segurança
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Junte-se a milhares de usuários que já alcançaram seus objetivos
          </p>
          <Button size="lg" asChild>
            <a href="/auth">Criar Conta Gratuita</a>
          </Button>
        </div>
      </div>

      <MadeWithDyad />
    </div>
  );
};

export default Index;