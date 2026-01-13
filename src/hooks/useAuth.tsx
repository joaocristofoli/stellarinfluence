import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkUserRoles = async (userId: string) => {
      console.log("🔍 Starting role check for:", userId);

      // Always ensure loading completes, even if RPC fails
      const timeout = setTimeout(() => {
        if (isMounted) {
          console.warn("⏰ Role check timeout - forcing loading complete");
          setLoading(false);
        }
      }, 5000); // 5 second timeout

      try {
        // Check if user is admin using RPC function (bypasses RLS)
        console.log("📡 Calling is_user_admin RPC...");
        const { data: isAdminData, error: adminError } = await supabase
          .rpc('is_user_admin' as any, { check_user_id: userId });

        if (adminError) {
          console.error("❌ Error checking admin role:", adminError);
          if (isMounted) setIsAdmin(false);
        } else {
          console.log("👨‍💼 Admin check result:", { isAdminData, userId });
          if (isMounted) setIsAdmin(!!isAdminData);
        }

        // Check if user is a creator
        console.log("📡 Checking creator status...");
        const { data: creatorData, error: creatorError } = await supabase
          .from("creators")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (creatorError) {
          console.error("❌ Error checking creator role:", creatorError);
          if (isMounted) setIsCreator(false);
        } else {
          console.log("🎨 Creator check result:", { creatorData, userId });
          if (isMounted) setIsCreator(!!creatorData);
        }

        console.log("✅ Role check complete:", { isAdmin: !!isAdminData, isCreator: !!creatorData });
      } catch (error) {
        console.error("❌ Unexpected error in role check:", error);
        if (isMounted) {
          setIsAdmin(false);
          setIsCreator(false);
        }
      } finally {
        clearTimeout(timeout);
        if (isMounted) {
          console.log("🏁 Setting loading to false");
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 Auth state changed:", event, session?.user?.email);

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (session?.user) {
          // Call checkUserRoles directly, not via setTimeout
          checkUserRoles(session.user.id);
        } else {
          if (isMounted) {
            setIsAdmin(false);
            setIsCreator(false);
            setLoading(false);
          }
        }
      }
    );

    // Check for existing session
    console.log("📱 Checking for existing session...");
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("📱 Initial session:", session?.user?.email ?? "none");

      if (isMounted) {
        setSession(session);
        setUser(session?.user ?? null);
      }

      if (session?.user) {
        await checkUserRoles(session.user.id);
      } else {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, isCreator, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
