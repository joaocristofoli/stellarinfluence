import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { AgencyBranding } from "@/integrations/supabase/types";

interface NavbarProps {
  simplified?: boolean; // For creator landing pages
}

export function Navbar({ simplified = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isCreator, signOut } = useAuth();
  const [branding, setBranding] = useState<AgencyBranding | null>(null);

  // Fetch agency branding
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase
          .from("agency_settings")
          .select("value")
          .eq("key", "branding")
          .maybeSingle();

        if (error) throw error;
        if (data?.value) {
          setBranding(data.value as AgencyBranding);
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      }
    };

    fetchBranding();
  }, []);

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Criadores", to: "/#creators", isScroll: true },
    { label: "Preços", to: "/pricing" },
    { label: "Admin", to: "/admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-2 md:py-4"
    >
      <div className={`max-w-7xl mx-auto glass rounded-full px-4 md:px-6 py-2 md:py-3 flex items-center justify-between ${branding?.logo_position === 'center' ? 'relative' : ''
        }`}>
        <Link to="/" className={`${branding?.logo_position === 'center' ? 'absolute left-1/2 -translate-x-1/2' :
          branding?.logo_position === 'right' ? 'order-last' : ''
          }`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight flex items-center"
            style={{ marginTop: branding?.logo_margin_top ? `${branding.logo_margin_top}px` : undefined }}
          >
            {branding?.logo_url ? (
              <img
                src={branding.logo_url}
                alt={branding.agency_name || "AGENCY"}
                className="w-auto object-contain transition-all duration-300"
                style={{
                  height: `${branding.logo_height_desktop || 40}px`,
                  // Mobile height override via CSS variable or media query logic if needed, 
                  // but for simplicity we can use a class that scales or inline style with window width check.
                  // For now, let's use a responsive class approach or inline style if we want exact control.
                }}
              />
            ) : (
              <span className="text-gradient">{branding?.agency_name || "AGENCY"}</span>
            )}
          </motion.div>
        </Link>

        {/* DEBUG: Auth Status */}
        {user && (
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="px-2 py-1 bg-blue-500/20 rounded">
              {user.email}
            </span>
            {isAdmin && (
              <span className="px-2 py-1 bg-green-500/20 rounded text-green-400">
                ADMIN ✓
              </span>
            )}
            {isCreator && (
              <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-400">
                CREATOR ✓
              </span>
            )}
            {!isAdmin && !isCreator && (
              <span className="px-2 py-1 bg-gray-500/20 rounded text-gray-400">
                USER
              </span>
            )}
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {!simplified && navItems.map((item) => {
            if (item.label === "Admin") return null; // Skip legacy admin item if present
            return (
              <Link key={item.label} to={item.to}>
                <motion.span
                  whileHover={{ color: "hsl(var(--accent))" }}
                  className="text-sm font-medium smooth-transition"
                  onClick={(e) => {
                    if (item.isScroll) {
                      e.preventDefault();
                      const element = document.getElementById('creators');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}

          {!simplified && (
            <>
              {/* Admin / Dashboard Link */}
              {user && (
                <Link to={isAdmin ? "/admin" : "/creator/dashboard"}>
                  <motion.span
                    whileHover={{ color: "hsl(var(--accent))" }}
                    className="text-sm font-medium smooth-transition"
                  >
                    {isAdmin ? "Admin" : "Meu Painel"}
                  </motion.span>
                </Link>
              )}

              {/* Show Login/Logout based on auth status */}
              {user ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/";
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  Sair
                </Button>
              ) : (
                <Link to="/auth">
                  <motion.span
                    whileHover={{ color: "hsl(var(--accent))" }}
                    className="text-sm font-medium smooth-transition"
                  >
                    Login
                  </motion.span>
                </Link>
              )}
            </>
          )}

          {!simplified && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-accent text-accent-foreground rounded-full font-medium text-sm smooth-transition hover:shadow-[0_0_30px_rgba(255,107,53,0.5)]"
              onClick={() => {
                const bookingSection = document.getElementById("booking-form");
                bookingSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Contato
            </motion.button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white hover:text-accent transition-colors focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-4 mx-4"
          >
            <div className="glass bg-black/95 backdrop-blur-xl rounded-3xl p-6 space-y-4 border border-white/10">
              {navItems.map((item) => {
                if (item.label === "Admin") return null;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => {
                      setIsOpen(false);
                      if (item.isScroll) {
                        setTimeout(() => {
                          const element = document.getElementById('creators');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                  >
                    <div className="text-base font-medium py-2 hover:text-accent transition-colors">
                      {item.label}
                    </div>
                  </Link>
                );
              })}

              {/* Show Admin/Dashboard and Logout when logged in */}
              {user && (
                <>
                  <Link
                    to={isAdmin ? "/admin" : "/creator/dashboard"}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${(location.pathname === "/admin" || location.pathname === "/creator/dashboard")
                      ? "text-accent bg-accent/10"
                      : "text-white hover:text-accent hover:bg-accent/5"
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {isAdmin ? "Painel Admin" : "Meu Painel"}
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                    }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    Sair da Conta
                  </button>
                </>
              )}

              {/* Show Login when not logged in */}
              {!user && (
                <Link
                  to="/auth"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-accent hover:bg-accent/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
              <Button
                className="w-full bg-accent hover:bg-accent/90 text-white"
                onClick={() => {
                  setIsOpen(false);
                  const bookingSection = document.getElementById("booking-form");
                  bookingSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contato
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
