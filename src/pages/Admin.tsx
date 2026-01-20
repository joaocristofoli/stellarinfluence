import { useEffect, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreatorsTable } from "@/components/admin/CreatorsTable";
import { PricingManager } from "@/components/admin/PricingManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PlatformSettingsManager } from "@/components/admin/PlatformSettingsManager";
import { AgencyBrandingManager } from "@/components/admin/AgencyBrandingManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { ThemeConfigManager } from "@/components/admin/ThemeConfigManager";
import { HomepageEditor } from "@/components/admin/HomepageEditor";
import { CalendarIntegration } from "@/components/admin/CalendarIntegration";
import { MergeProfilesDialog } from "@/components/admin/MergeProfilesDialog";
import { LuxuryDashboard } from "@/components/admin/LuxuryDashboard";
import { CommandPalette } from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useCreatorsRealtime } from "@/hooks/useCreatorsRealtime";
import {
  Users, DollarSign, Megaphone, Calendar, LogOut, Plus,
  Image as ImageIcon, Settings, UserCog, Palette, LayoutDashboard,
  Building2, Landmark, ChevronRight, Menu, X, Home, FileText, Command,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

// Menu items with hierarchical structure
// Menu items with semantic hierarchical structure
const menuItems = [
  {
    category: "Core",
    items: [
      {
        id: "dashboard",
        label: "Command Center",
        icon: LayoutDashboard,
        path: "/admin",
      },
      {
        id: "creators",
        label: "Parceiros de Mídia",
        icon: Users,
        path: "/admin/creators",
      },
      {
        id: "marketing",
        label: "Marketing Planner",
        icon: Building2,
        path: "/admin/marketing",
      },
    ]
  },
  {
    category: "Tools",
    items: [
      {
        id: "bookings",
        label: "Reservas",
        icon: Calendar,
        path: "/admin/bookings",
      },
      {
        id: "banners",
        label: "Gerador de Banners",
        icon: Megaphone,
        path: "/admin/banners",
      },
      {
        id: "calendar",
        label: "Calendário Unificado",
        icon: Calendar,
        path: "/admin/calendar",
      },
    ]
  },
  {
    category: "System",
    items: [
      {
        id: "settings",
        label: "Configurações",
        icon: Settings,
        children: [
          { id: "homepage", label: "Homepage CMS", path: "/admin/homepage" },
          { id: "branding", label: "Branding", path: "/admin/branding" },
          { id: "platforms", label: "Plataformas", path: "/admin/platforms" },
          { id: "themes", label: "Personalização", path: "/admin/themes-config" },
          { id: "users", label: "Gestão de Usuários", path: "/admin/users" },
          { id: "pricing", label: "Tabelas de Preço", path: "/admin/pricing" },
        ],
      },
      {
        id: "projects",
        label: "Projetos Ativos",
        icon: Landmark,
        children: [
          { id: "toledo", label: "Prefeitura Toledo", path: "/admin/toledo" },
        ],
      },
    ]
  }
];

export default function Admin() {
  const { user, loading, isAdmin, isCreator, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // const [searchParams, setSearchParams] = useSearchParams();
  // const activeSection = searchParams.get("tab") || "creators";

  // const setActiveSection = (section: string) => {
  //   setSearchParams({ tab: section });
  // };
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["settings", "projects"]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Enable realtime sync for creators data
  useCreatorsRealtime();

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    { keys: 'meta+k', handler: () => setCommandPaletteOpen(true), description: 'Open command palette' },
    { keys: 'escape', handler: () => setCommandPaletteOpen(false), allowInInputs: true },
  ]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) {
      if (isCreator) {
        navigate("/creator/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [user, loading, isAdmin, isCreator, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (item: any) => {
    if (item.path) {
      // BRG-001: Preserve Context (companyId) on navigation
      navigate({
        pathname: item.path,
        search: location.search
      });
      setMobileMenuOpen(false);
    } else if (item.children) {
      toggleMenu(item.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  // Removed manual renderContent switch - using Outlet now
  // This drastically simplifies the component and enables true Nested Routing

  const SidebarContent = () => {
    const { theme, setTheme } = useTheme();

    // Componente de botão de tema
    const ThemeButton = ({ mode, label, title }: { mode: 'light' | 'dark' | 'system', label: string, title: string }) => (
      <button
        onClick={() => setTheme(mode)}
        title={title}
        className={cn(
          "flex-1 py-1.5 rounded text-sm transition-colors",
          theme === mode
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50 hover:bg-muted"
        )}
      >
        {label}
      </button>
    );

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <h1 className="text-xl font-bold text-gradient">Eternizar Admin</h1>
          <p className="text-xs text-muted-foreground mt-1">Painel de Controle</p>
        </div>

        {/* Menu */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {menuItems.map((group, index) => (
              <div key={index} className="mb-6">
                <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => handleMenuClick(item)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                          "hover:bg-accent/10 hover:text-accent group",
                          (location.pathname === item.path || item.children?.some(c => location.pathname === c.path))
                            ? "bg-accent/10 text-accent font-semibold shadow-sm ring-1 ring-accent/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={cn(
                            "w-4 h-4 transition-colors",
                            (location.pathname === item.path || item.children?.some(c => location.pathname === c.path))
                              ? "text-accent"
                              : "text-muted-foreground group-hover:text-accent"
                          )} />
                          <span>{item.label}</span>
                        </div>
                        {item.children && (
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform opacity-50",
                            expandedMenus.includes(item.id) && "rotate-90"
                          )} />
                        )}
                      </button>

                      {/* Submenu */}
                      <AnimatePresence>
                        {item.children && expandedMenus.includes(item.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 mt-1 space-y-1 pl-3 border-l border-border/50"
                          >
                            {item.children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => handleMenuClick(child)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all duration-200",
                                  "hover:bg-accent/10 hover:text-accent hover:translate-x-1",
                                  location.pathname === child.path
                                    ? "text-accent font-medium bg-accent/5"
                                    : "text-muted-foreground"
                                )}
                              >
                                <span>{child.label}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="w-full justify-start"
          >
            <Home className="w-4 h-4 mr-2" />
            Ver Site
          </Button>

          {/* Seletor de Tema */}
          <div className="border-t border-border/50 pt-2 mt-2">
            <p className="text-xs text-muted-foreground mb-2 px-2">Tema</p>
            <div className="flex gap-1">
              <ThemeButton mode="light" label="☀️" title="Claro" />
              <ThemeButton mode="dark" label="🌙" title="Escuro" />
              <ThemeButton mode="system" label="💻" title="Sistema" />
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start mt-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className={cn(
          "hidden lg:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm fixed h-screen",
          !sidebarOpen && "lg:w-16"
        )}>
          <SidebarContent />
        </aside>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg border border-border/50 shadow-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border/50 z-50"
              >
                <SidebarContent />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className={cn(
          "flex-1 min-h-screen",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}>
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
              <h1 className="text-lg font-semibold hidden lg:block">
                {/* Dynamic Header based on route */}
                <span className="capitalize">
                  {(location.pathname.split('/').pop() || 'Dashboard').replace(/-/g, ' ')}
                </span>
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.email}
                </span>
                <span className="px-2 py-1 text-xs bg-accent/20 text-accent rounded-full">
                  Admin
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
