import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutPlanner from "./pages/WorkoutPlanner";
import MyClients from "./pages/MyClients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Index />} />
            <Route 
              path="/auth" 
              element={
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              } 
            />

            {/* ROTAS PROTEGIDAS DO APP */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <DashboardLayout /> 
                </ProtectedRoute>
              }
            >
              {/* Rotas de Professional/Admin */}
              <Route path="library" element={<ExerciseLibrary />} />
              <Route path="planner" element={<WorkoutPlanner />} />
              <Route path="clients" element={<MyClients />} />

              {/* Rotas de Cliente (Ainda não criadas) */}
              {/* <Route path="my-workout" element={<ClientDashboard />} /> */}

              {/* Rota Padrão - Redireciona baseado no role */}
              <Route index element={<Navigate to="clients" replace />} /> 
            </Route>

            {/* Rota de Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;