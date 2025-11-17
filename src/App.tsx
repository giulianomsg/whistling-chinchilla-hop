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
import ClientWorkout from "./pages/ClientWorkout";
import AppIndex from "./components/auth/AppIndex";
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

            {/* Rotas Protegidas */}
            <Route 
              path="/app" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Professional/Admin */}
              <Route path="clients" element={<MyClients />} />
              <Route path="planner" element={<WorkoutPlanner />} />
              <Route path="library" element={<ExerciseLibrary />} />

              {/* Cliente */}
              <Route path="my-workout" element={<ClientWorkout />} />

              {/* Rota Dinâmica */}
              <Route index element={<AppIndex />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;