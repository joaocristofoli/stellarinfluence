// Reusable table wrapper for admin sections
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AdminTableWrapperProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}

export function AdminTableWrapper({
    title,
    description,
    action,
    children,
}: AdminTableWrapperProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="glass rounded-2xl p-6 border border-border/50">
                {children}
            </div>
        </motion.div>
    );
}
