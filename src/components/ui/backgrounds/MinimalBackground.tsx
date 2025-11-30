import { motion } from "framer-motion";

interface BackgroundProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
    };
    position?: 'fixed' | 'absolute';
}

export const MinimalBackground = ({ theme, position = 'fixed' }: BackgroundProps) => {
    const primaryColor = theme?.primaryColor || '#000000';
    const bgColor = theme?.backgroundColor || '#FFFFFF';

    return (
        <div className={`${position} inset-0 overflow-hidden pointer-events-none z-[-1]`} style={{ backgroundColor: bgColor }}>
            {/* Subtle Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }}
            />

            {/* Slow Moving Gradient Blob */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-5"
                style={{
                    backgroundColor: primaryColor,
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
};
