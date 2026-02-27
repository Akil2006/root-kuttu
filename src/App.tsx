import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import FarmerInput from "./pages/FarmerInput";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FarmPulse from "./pages/FarmPulse";
import Weather from "./pages/Weather";
import CropDisease from "./pages/CropDisease";
import CommunityForum from "./pages/CommunityForum";
import ExpenseTracker from "./pages/ExpenseTracker";
import { lazy, Suspense } from "react";
const StoreLocator = lazy(() => import("./pages/StoreLocator"));
import AdvisoryDetail from "./pages/AdvisoryDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  return isLoggedIn ? <Navigate to="/" replace /> : <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
    <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/input" element={<ProtectedRoute><FarmerInput /></ProtectedRoute>} />
    <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
    <Route path="/farm-pulse" element={<ProtectedRoute><FarmPulse /></ProtectedRoute>} />
    <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
    <Route path="/crop-disease" element={<ProtectedRoute><CropDisease /></ProtectedRoute>} />
    <Route path="/community" element={<ProtectedRoute><CommunityForum /></ProtectedRoute>} />
    <Route path="/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
    <Route path="/store-locator" element={<ProtectedRoute><Suspense fallback={<div>Loading Map...</div>}><StoreLocator /></Suspense></ProtectedRoute>} />
    <Route path="/advisory/:slug" element={<ProtectedRoute><AdvisoryDetail /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

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
