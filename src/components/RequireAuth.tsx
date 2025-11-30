// src/components/RequireAuth.tsx

import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface RequireAuthProps {
    children: ReactNode;
    requiredRole?: "admin" | "creator"; // optional role check
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                // Not logged in – redirect to auth page
                navigate("/auth");
            } else if (requiredRole) {
                if (requiredRole === "admin" && !isAdmin) {
                    // Logged in but not admin – redirect to appropriate dashboard
                    navigate("/creator/dashboard");
                }
                // For creator role we assume any logged‑in non‑admin user is a creator
            }
        }
    }, [authLoading, user, isAdmin, requiredRole, navigate]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
