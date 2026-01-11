import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";;
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreatorProfile from "./pages/CreatorProfile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ToledoPrefeitura from "./pages/ToledoPrefeitura";
import Admin from "./pages/Admin";
import CreatorForm from "./pages/CreatorForm";
import CreatorDashboard from "./pages/CreatorDashboard";
import Pricing from "./pages/Pricing";
import EditLanding from "./pages/EditLanding";
import Preview from "./pages/Preview";
import BannerGenerator from "./pages/admin/BannerGenerator";
import ThemeManager from "./pages/admin/ThemeManager";
import ToledoAdmin from "./pages/admin/ToledoAdmin";
import MarketingPlanner from "./pages/marketing/MarketingPlanner";


const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
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
          <Route path="/preview" element={<Preview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
