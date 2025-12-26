import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "./components/theme-provider";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";

// Lazy loading das páginas principais
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const ExerciseLibrary = lazy(() => import("./pages/ExerciseLibrary"));
const WorkoutPlanner = lazy(() => import("./pages/WorkoutPlanner"));
const MyClients = lazy(() => import("./pages/MyClients"));
const ClientWorkout = lazy(() => import("./pages/ClientWorkout"));
const ClientMealPlan = lazy(() => import("./pages/ClientMealPlan"));
const ClientHistory = lazy(() => import("./pages/ClientHistory"));
const FoodLibrary = lazy(() => import("./pages/FoodLibrary"));
const MealPlanner = lazy(() => import("./pages/MealPlanner"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfessionalDashboard = lazy(() => import("./pages/ProfessionalDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ClientDetails = lazy(() => import("./pages/ClientDetails"));
const Chat = lazy(() => import("./pages/Chat"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const ClientAgenda = lazy(() => import("./pages/ClientAgenda")); // Nova Página Agenda
const ClientProfessionals = lazy(() => import("./pages/ClientProfessionals")); // Nova Página Meus Profissionais
const ProfessionalAgenda = lazy(() => import("./pages/ProfessionalAgenda")); // Nova Página Agenda Global
const AdminUsers = lazy(() => import("./pages/AdminUsers")); // Nova Página Admin Users
const ProfessionalMarketplace = lazy(() => import("./pages/ProfessionalMarketplace"));
const ProfessionalDetails = lazy(() => import("./pages/ProfessionalDetails"));

const PublicProfile = lazy(() => import("./pages/PublicProfile"));

const queryClient = new QueryClient();

// Componente de Loading para lazy loading
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Componente interno para lidar com redirecionamentos
const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // Loading simples
  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          user ? <Navigate to="/app" replace /> : <Auth />
        }
      />

      {/* Rotas Protegidas com Lazy Loading */}
      <Route
        path="/app"
        element={
          user ? <DashboardLayout /> : <Navigate to="/auth" replace />
        }
      >
        {/* Dashboard principal - redireciona baseado no role */}
        <Route index element={<Navigate to="/app/dashboard" replace />} />

        {/* Dashboard unificado baseado no role */}
        <Route
          path="dashboard"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientDashboard />
              </Suspense> :
              <Suspense fallback={<PageLoader />}>
                <ProfessionalDashboard />
              </Suspense>
          }
        />

        {/* Rota de Perfil (Acessível a todos) */}
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfileSettings />
            </Suspense>
          }
        />

        {/* Perfil Público (Reputação) */}
        <Route
          path="profile/public/:id"
          element={
            <Suspense fallback={<PageLoader />}>
              <PublicProfile />
            </Suspense>
          }
        />

        <Route
          path="admin/users"
          element={
            profile?.role === 'admin' ?
              <Suspense fallback={<PageLoader />}>
                <AdminUsers />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Professional/Admin */}
        <Route
          path="clients"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <MyClients />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="clients/:id"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <ClientDetails />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="planner"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <WorkoutPlanner />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="meal-planner"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <MealPlanner />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="library"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <ExerciseLibrary />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="foods"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <FoodLibrary />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="chat"
          element={
            (profile?.role === 'professional' || profile?.role === 'client' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <Chat />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Professional Agenda (Global) */}
        <Route
          path="agenda/global"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <ProfessionalAgenda />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Cliente */}
        <Route
          path="my-workout"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientWorkout />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="my-meal-plan"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientMealPlan />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="my-history"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientHistory />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="agenda"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientAgenda />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="my-professionals"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientProfessionals />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Marketplace (Clientes) */}
        <Route
          path="marketplace"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ProfessionalMarketplace />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="marketplace/:id"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ProfessionalDetails />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <ChatProvider>
              <AppRoutes />
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;