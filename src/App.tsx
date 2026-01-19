import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Lazy Imports para Code Splitting
const Index = lazy(() => import("./pages/Index"));
const CreatorProfile = lazy(() => import("./pages/CreatorProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const ToledoPrefeitura = lazy(() => import("./pages/ToledoPrefeitura"));
const Admin = lazy(() => import("./pages/Admin"));
const CreatorForm = lazy(() => import("./pages/CreatorForm"));
const CreatorDashboard = lazy(() => import("./pages/CreatorDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));
const EditLanding = lazy(() => import("./pages/EditLanding"));
const Preview = lazy(() => import("./pages/Preview"));
const BannerGenerator = lazy(() => import("./pages/admin/BannerGenerator"));
const ThemeManager = lazy(() => import("./pages/admin/ThemeManager"));
const ToledoAdmin = lazy(() => import("./pages/admin/ToledoAdmin"));
const MarketingPlanner = lazy(() => import("./pages/marketing/MarketingPlanner"));
const CalendarPage = lazy(() => import("./pages/marketing/CalendarPage"));
const ProjectsDashboard = lazy(() => import("./pages/admin/ProjectsDashboard"));
const ClientPortalPage = lazy(() => import("./pages/public/ClientPortalPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de Loading Simples
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground font-medium">Carregando...</span>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary fallbackTitle="Erro na Aplicação" fallbackDescription="Ocorreu um erro inesperado. Tente recarregar a página.">
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/toledo" element={<ToledoPrefeitura />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/creator/:id" element={<CreatorProfile />} />
                <Route path="/creator/dashboard" element={<CreatorDashboard />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/creator/setup" element={<CreatorForm />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/creators/new" element={<CreatorForm />} />
                <Route path="/admin/creators/:id" element={<CreatorForm />} />
                <Route path="/admin/creators/:id/landing" element={<EditLanding />} />
                <Route path="/admin/banners" element={<BannerGenerator />} />
                <Route path="/admin/themes" element={<ThemeManager />} />
                <Route path="/admin/toledo" element={<ToledoAdmin />} />
                <Route path="/admin/marketing" element={<MarketingPlanner />} />
                <Route path="/admin/calendar/:companyId" element={<CalendarPage />} />
                <Route path="/admin/flyers" element={<Navigate to="/admin/marketing" replace />} />
                <Route path="/admin/dashboard" element={<ProjectsDashboard />} />
                {/* Portal do Cliente - Link compartilhável público */}
                <Route path="/cliente/:id" element={<ClientPortalPage />} />
                {/* Rota legada - redirect para nova página */}
                <Route path="/view/plan/:id" element={<Navigate to={`/cliente/${window.location.pathname.split('/').pop()}`} replace />} />
                <Route path="/preview" element={<Preview />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

export default App;
