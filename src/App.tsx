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
import { PremiumGuard } from "@/components/auth/PremiumGuard";

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
const ClientAgenda = lazy(() => import("./pages/ClientAgenda"));
const ClientProfessionals = lazy(() => import("./pages/ClientProfessionals"));
const ProfessionalAgenda = lazy(() => import("./pages/ProfessionalAgenda"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const ProfessionalMarketplace = lazy(() => import("./pages/ProfessionalMarketplace"));
const ProfessionalDetails = lazy(() => import("./pages/ProfessionalDetails"));
// Financial
const AdminFinancialDashboard = lazy(() => import("./pages/admin/AdminFinancialDashboard"));
const PaymentSettings = lazy(() => import("./pages/admin/PaymentSettings"));
const ProfessionalFinance = lazy(() => import("./pages/ProfessionalFinance"));
const ClientBillingHistory = lazy(() => import("./pages/ClientBillingHistory"));
const CheckoutSuccess = lazy(() => import("./pages/checkout/Success"));
const Settings = lazy(() => import("./pages/Settings")); // New Settings Page

const PublicProfile = lazy(() => import("./pages/PublicProfile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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

        {/* Unified Settings Route */}
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <Settings />
            </Suspense>
          }
        />

        {/* Profile Separate Route */}
        <Route
          path="profile"
          element={
            <Suspense fallback={<PageLoader />}>
              <ProfileSettings />
            </Suspense>
          }
        />

        {/* Note: PaymentSettings is strictly Admin, assuming Settings handles access control internally via Tabs logic */}
        <Route path="admin/payment-settings" element={<Navigate to="/app/settings?tab=payments" replace />} />


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

        {/* Perfil Público (Reputação) - Mantém separado pois é visualização externa */}
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
                <PremiumGuard>
                  <ClientWorkout />
                </PremiumGuard>
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        <Route
          path="my-meal-plan"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <PremiumGuard>
                  <ClientMealPlan />
                </PremiumGuard>
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
                <PremiumGuard>
                  <ClientAgenda />
                </PremiumGuard>
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

        {/* Financeiro: Admin */}
        <Route
          path="admin/financial"
          element={
            profile?.role === 'admin' ?
              <Suspense fallback={<PageLoader />}>
                <AdminFinancialDashboard />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />
        {/* Payment Settings already redirected to /settings */}

        {/* Financeiro: Profissional */}
        <Route
          path="finance"
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ?
              <Suspense fallback={<PageLoader />}>
                <ProfessionalFinance />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Financeiro: Cliente */}
        <Route
          path="billing"
          element={
            profile?.role === 'client' ?
              <Suspense fallback={<PageLoader />}>
                <ClientBillingHistory />
              </Suspense> :
              <Navigate to="/app/dashboard" replace />
          }
        />

        {/* Checkout Success (Public/Auth) */}
        <Route
          path="checkout/success"
          element={
            <Suspense fallback={<PageLoader />}>
              <CheckoutSuccess />
            </Suspense>
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