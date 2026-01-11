import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorsTable } from "@/components/admin/CreatorsTable";
import { PricingManager } from "@/components/admin/PricingManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PlatformSettingsManager } from "@/components/admin/PlatformSettingsManager";
import { AgencyBrandingManager } from "@/components/admin/AgencyBrandingManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { ThemeConfigManager } from "@/components/admin/ThemeConfigManager";
import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { Users, DollarSign, Megaphone, Calendar, BarChart3, LogOut, Plus, Image as ImageIcon, Settings, UserCog, Palette, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const { user, loading, isAdmin, isCreator, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("creators");

  useEffect(() => {
    // Only redirect after loading is complete
    if (loading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    // If not admin, check if they're a creator and redirect appropriately
    if (!isAdmin) {
      if (isCreator) {
        navigate("/creator/dashboard");
      } else {
        // No role assigned - this shouldn't happen in production
        navigate("/");
      }
      return;
    }
  }, [user, loading, isAdmin, isCreator, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-border/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="text-gradient">Painel Admin</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie toda a plataforma em um só lugar
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="hidden sm:flex"
              >
                Ver Site
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 bg-muted/50 p-1 h-auto">
            <TabsTrigger
              value="creators"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Criadores</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <UserCog className="w-4 h-4" />
              <span className="hidden sm:inline">Usuários</span>
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Preços</span>
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Campanhas</span>
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            {/* Analytics Tab Removed for space or moved? Keeping it but adjusting grid */}
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger
              value="themes"
              className="flex items-center gap-2 data-[state=active]:bg-accent data-[state=active]:text-white py-2"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Temas</span>
            </TabsTrigger>
          </TabsList>

          {/* Creators Tab */}
          <TabsContent value="creators" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">Gerenciar Criadores</h2>
                <p className="text-sm text-muted-foreground">
                  Adicione, edite ou remova criadores de conteúdo
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/banners")}
                  className="hidden md:flex"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Gerador de Banners
                </Button>
                <Button
                  onClick={() => navigate("/admin/creators/new")}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Criador
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <CreatorsTable />
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <PricingManager />
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass rounded-3xl p-8 text-center">
                <Megaphone className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Gerenciamento de Campanhas</h3>
                <p className="text-muted-foreground mb-4">
                  Crie e gerencie campanhas de marketing para seus clientes
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  💡 Planeje estratégias por canal, defina orçamentos e acompanhe resultados
                </p>
                <Button
                  onClick={() => navigate("/admin/marketing")}
                  className="bg-accent hover:bg-accent/90 gap-2"
                >
                  <Megaphone className="w-4 h-4" />
                  Abrir Planejador de Marketing
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <BookingsManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass rounded-3xl p-6 md:p-8 text-center">
                <BarChart3 className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics & Relatórios</h3>
                <p className="text-muted-foreground mb-4">
                  Visualize métricas e gere relatórios de desempenho
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Acompanhe KPIs de criadores e campanhas
                </p>
              </div>
            </motion.div>
          </TabsContent>

          {/* Themes Tab */}
          <TabsContent value="themes" className="space-y-4">
            <ThemeConfigManager />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <SettingsTabContent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}



function SettingsTabContent() {
  const homepageRef = useRef<any>(null);
  const brandingRef = useRef<any>(null);
  const platformRef = useRef<any>(null);
  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Trigger all saves in parallel
      await Promise.all([
        homepageRef.current?.save(),
        brandingRef.current?.save(),
        platformRef.current?.save()
      ]);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-xl font-semibold">Configurações Gerais</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie a aparência e integrações do site
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all">
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Salvar Todas as Alterações
        </Button>
      </div>

      <HomepageEditor ref={homepageRef} />
      <AgencyBrandingManager ref={brandingRef} />
      <PlatformSettingsManager ref={platformRef} />
    </div>
  );
}
