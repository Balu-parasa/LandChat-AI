import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import AIAssistant from "./pages/AIAssistant";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import SellerPropertyDetails from "./pages/SellerPropertyDetails";
import LandDetails from "./pages/LandDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EditProperty from "./pages/EditProperty";
import MyVisits from "./pages/MyVisits";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRole }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />

                {/* Property Routes */}
                <Route path="/property/:id" element={<LandDetails />} />
                <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />

                {/* Customer Routes */}
                <Route path="/dashboard" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/favorites" element={<ProtectedRoute allowedRole="customer"><Favorites /></ProtectedRoute>} />
                <Route path="/dashboard/messages" element={<ProtectedRoute allowedRole="customer"><Messages /></ProtectedRoute>} />
                <Route path="/dashboard/assistant" element={<ProtectedRoute allowedRole="customer"><AIAssistant /></ProtectedRoute>} />
                <Route path="/my-visits" element={<ProtectedRoute><MyVisits /></ProtectedRoute>} />
                <Route path="/my-visits" element={<ProtectedRoute><MyVisits /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/properties" element={<ProtectedRoute allowedRole="admin"><MyProperties /></ProtectedRoute>} />
                <Route path="/admin/properties/:id" element={<ProtectedRoute allowedRole="admin"><SellerPropertyDetails /></ProtectedRoute>} />
                <Route path="/admin/add-property" element={<ProtectedRoute allowedRole="admin"><AddProperty /></ProtectedRoute>} />
                <Route path="/admin/messages" element={<ProtectedRoute allowedRole="admin"><Messages /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute allowedRole="admin"><Settings /></ProtectedRoute>} />
                <Route path="/admin/edit-property/:id" element={<ProtectedRoute allowedRole="admin"><EditProperty /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
