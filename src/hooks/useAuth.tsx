import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkUserRoles = async (userId: string) => {
      try {
        // Check if user is admin using RPC function (bypasses RLS)
        const { data: isAdminData, error: adminError } = await supabase
          .rpc('is_user_admin' as any, { check_user_id: userId });

        if (adminError) {
          console.error("❌ Error checking admin role:", adminError);
          setIsAdmin(false);
        } else {
          console.log("👨‍💼 Admin check (RPC):", { isAdminData, userId });
          setIsAdmin(!!isAdminData);
        }

        // Check if user is a creator
        const { data: creatorData, error: creatorError } = await supabase
          .from("creators")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (creatorError) {
          console.error("❌ Error checking creator role:", creatorError);
          setIsCreator(false);
        } else {
          console.log("🎨 Creator check:", { creatorData, userId });
          setIsCreator(!!creatorData);
        }

        console.log("✅ Auth complete:", { isAdmin: !!isAdminData, isCreator: !!creatorData });
      } catch (error) {
        console.error("❌ Unexpected error in role check:", error);
        setIsAdmin(false);
        setIsCreator(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkUserRoles(session.user.id);
        } else {
          setIsAdmin(false);
          setIsCreator(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("📱 Initial session:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await checkUserRoles(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, session, loading, isAdmin, isCreator, signOut };
}
