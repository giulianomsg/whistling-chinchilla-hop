import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./components/layout/DashboardLayout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutPlanner from "./pages/WorkoutPlanner";
import MyClients from "./pages/MyClients";
import ClientWorkout from "./pages/ClientWorkout";
import ClientMealPlan from "./pages/ClientMealPlan";
import FoodLibrary from "./pages/FoodLibrary";
import MealPlanner from "./pages/MealPlanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente interno para lidar com redirecionamentos
const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  // Loading simples
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
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

      {/* Rotas Protegidas */}
      <Route 
        path="/app" 
        element={
          user ? <DashboardLayout /> : <Navigate to="/auth" replace />
        }
      >
        {/* Redirecionamento baseado no role */}
        <Route index element={
          profile?.role === 'client' ? 
            <Navigate to="/app/my-workout" replace /> : 
            <Navigate to="/app/clients" replace />
        } />
        
        {/* Professional/Admin */}
        <Route 
          path="clients" 
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ? 
              <MyClients /> : 
              <Navigate to="/app/my-workout" replace />
          } 
        />
        <Route 
          path="planner" 
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ? 
              <WorkoutPlanner /> : 
              <Navigate to="/app/my-workout" replace />
          } 
        />
        <Route 
          path="meal-planner" 
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ? 
              <MealPlanner /> : 
              <Navigate to="/app/my-workout" replace />
          } 
        />
        <Route 
          path="library" 
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ? 
              <ExerciseLibrary /> : 
              <Navigate to="/app/my-workout" replace />
          } 
        />
        <Route 
          path="foods" 
          element={
            (profile?.role === 'professional' || profile?.role === 'admin') ? 
              <FoodLibrary /> : 
              <Navigate to="/app/my-workout" replace />
          } 
        />

        {/* Cliente */}
        <Route 
          path="my-workout" 
          element={
            profile?.role === 'client' ? 
              <ClientWorkout /> : 
              <Navigate to="/app/clients" replace />
          } 
        />
        <Route 
          path="my-meal-plan" 
          element={
            profile?.role === 'client' ? 
              <ClientMealPlan /> : 
              <Navigate to="/app/clients" replace />
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;