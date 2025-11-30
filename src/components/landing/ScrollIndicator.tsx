import { motion } from "framer-motion";

interface ScrollIndicatorProps {
    /** Primary color from theme */
    accentColor?: string;
}

export function ScrollIndicator({ accentColor = "#FF6B35" }: ScrollIndicatorProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }} // More subtle opacity
            transition={{ delay: 2, duration: 1 }}
            className="flex flex-col items-center gap-1.5"
            style={{ color: accentColor }}
        >
            <span className="text-[8px] uppercase tracking-[0.15em] opacity-40">Scroll</span>
            <motion.div
                animate={{ y: [0, 6, 0] }} // Gentler movement
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} // Slower, smoother
                className="w-4 h-7 border border-current/15 rounded-full flex items-start justify-center p-1" // Smaller, more transparent border
                style={{
                    backdropFilter: "blur(8px)",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                }}
            >
                <motion.div
                    className="w-0.5 h-1 rounded-full"
                    style={{
                        background: `linear-gradient(to bottom, ${accentColor}60, ${accentColor}30)`, // More transparent gradient
                    }}
                    animate={{ y: [0, 10, 0], opacity: [0.6, 0.2, 0.6] }} // Slower, more subtle fade
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>
        </motion.div>
    );
}
