import { motion } from "framer-motion";

interface BackgroundProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
    };
    position?: 'fixed' | 'absolute';
}

export const LifestyleBackground = ({ theme, position = 'fixed' }: BackgroundProps) => {
    const primaryColor = theme?.primaryColor || '#FF9B9B';
    const secondaryColor = theme?.secondaryColor || '#A8D8EA';
    const bgColor = theme?.backgroundColor || '#FFF5F5';

    return (
        <div className={`${position} inset-0 overflow-hidden pointer-events-none z-[-1]`} style={{ backgroundColor: bgColor }}>
            {/* Organic Blobs */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-[60px] opacity-40"
                    style={{
                        width: Math.random() * 300 + 200 + 'px',
                        height: Math.random() * 300 + 200 + 'px',
                        backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                        left: `${Math.random() * 80}%`,
                        top: `${Math.random() * 80}%`,
                    }}
                    animate={{
                        x: [0, 50, -50, 0],
                        y: [0, -50, 50, 0],
                        scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply bg-noise" />
        </div>
    );
};
