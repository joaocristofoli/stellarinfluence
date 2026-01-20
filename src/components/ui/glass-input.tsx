import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface GlassInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    error?: string | boolean;
    success?: boolean;
    containerClassName?: string;
    label?: string;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, type, icon, rightIcon, error, success, containerClassName, label, ...props }, ref) => {
        // Generate unique ID for label association if not provided
        const id = props.id || React.useId();
        const isError = !!error;
        const isSuccess = !!success;

        return (
            <div className={cn("space-y-1.5 w-full", containerClassName)}>
                {label && (
                    <label
                        htmlFor={id}
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1"
                    >
                        {label}
                    </label>
                )}

                <div className="relative group">
                    {/* Backdrop Glow Effect (only visible on focus via CSS sibling or parent state, utilizing Framer for animation) */}
                    <motion.div
                        className={cn(
                            "absolute -inset-0.5 rounded-lg opacity-0 transition-opacity duration-500 blur-md pointer-events-none",
                            isError ? "bg-destructive/20" : isSuccess ? "bg-green-500/20" : "bg-accent/20"
                        )}
                        initial={false}
                        animate={{ opacity: 0 }} // Managed by focus-within state via CSS usually, or enable manually
                        whileHover={{ opacity: 0.5 }}
                    />

                    <motion.div
                        className="relative flex items-center"
                        initial={false}
                        whileTap={{ scale: 0.995 }}
                    >
                        {icon && (
                            <div className="absolute left-3 text-muted-foreground pointer-events-none z-10">
                                {icon}
                            </div>
                        )}

                        <input
                            type={type}
                            id={id}
                            className={cn(
                                // Base
                                "flex h-12 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-300",
                                // Glassmorphism - Premium
                                "bg-white/5 backdrop-blur-md border-white/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.05)]",
                                // Typography & Colors
                                "text-foreground placeholder:text-muted-foreground/70 file:border-0 file:bg-transparent file:text-sm file:font-medium",
                                // Spacing
                                icon ? "pl-10" : "pl-4",
                                (rightIcon || isError || isSuccess) ? "pr-10" : "pr-4",
                                // Focus States (Glow instead of ring)
                                "focus-visible:outline-none focus:border-accent/50 focus:bg-white/10 dark:focus:bg-black/20 focus:shadow-[0_0_20px_rgba(255,107,53,0.15)]",
                                // Error/Success States
                                isError && "border-destructive/50 text-destructive focus:border-destructive focus:shadow-[0_0_20px_rgba(239,68,68,0.15)]",
                                isSuccess && "border-green-500/50 text-green-500 focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
                                // Disabled
                                "disabled:cursor-not-allowed disabled:opacity-50",
                                className
                            )}
                            ref={ref}
                            {...props}
                        />

                        {/* Status Icons (Right Side) */}
                        <div className="absolute right-3 flex items-center pointer-events-none z-10 gap-2">
                            {rightIcon}
                            <AnimatePresence mode="popLayout">
                                {isError && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                    >
                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                    </motion.div>
                                )}
                                {isSuccess && !isError && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Error Message with Smooth Reveal */}
                <AnimatePresence>
                    {isError && typeof error === 'string' && (
                        <motion.p
                            initial={{ height: 0, opacity: 0, y: -10 }}
                            animate={{ height: "auto", opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -10 }}
                            className="text-[0.8rem] font-medium text-destructive ml-1"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);
GlassInput.displayName = "GlassInput";

export { GlassInput };
