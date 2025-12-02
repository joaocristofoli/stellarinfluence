import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in and redirect accordingly
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await redirectUser(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await redirectUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const redirectUser = async (userId: string) => {
    try {
      // Check if admin using RPC (more reliable)
      const { data: isAdminData, error: adminError } = await supabase
        .rpc('is_user_admin' as any, { check_user_id: userId });

      if (adminError) {
        console.error("Error checking admin status:", adminError);
      } else if (isAdminData) {
        navigate("/admin");
        return;
      }

      // Check if creator
      const { data: creatorData, error: creatorError } = await supabase
        .from("creators")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (creatorError) {
        console.error("Error checking creator status:", creatorError);
      } else if (creatorData) {
        navigate("/creator/dashboard");
        return;
      }

      // No role assigned - redirect to creator dashboard to setup profile
      // This assumes new signups are potential creators
      navigate("/creator/dashboard");
    } catch (error) {
      console.error("Unexpected error in redirectUser:", error);
      navigate("/");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta.",
        });

        // Redirect based on user role
        if (data.user) {
          await redirectUser(data.user.id);
        }
      } else { // This is the sign-up path
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `http://192.168.0.82:8080/admin`,
          },
        });

        if (error) throw error;

        toast({
          title: "Conta criada!",
          description: "Bem-vindo! Configure seu perfil para começar.",
        });

        // Redirect to creator setup after signup
        setTimeout(() => {
          navigate("/creator/setup");
        }, 1500); // Wait 1.5s to show the toast message
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-gradient">AGENCY</span>
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Entre na sua conta" : "Crie sua conta"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>



            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>{isLogin ? "Entrar" : "Criar conta"}</>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent smooth-transition"
            >
              {isLogin
                ? "Não tem conta? Criar nova"
                : "Já tem conta? Fazer login"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
