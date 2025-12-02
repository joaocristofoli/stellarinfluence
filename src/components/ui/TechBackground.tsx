import * as React from "react";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface TechBackgroundProps {
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        textColor?: string;
    };
    overlay?: boolean; // New prop to enable overlay mode
    position?: 'fixed' | 'absolute';
}

export const TechBackground = ({ theme, overlay = false, position = 'fixed' }: TechBackgroundProps) => {
    // Use MotionValues for high-performance updates (no re-renders)
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring animation for the spotlight
    const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

    const [clickPosition, setClickPosition] = React.useState<{ x: number, y: number } | null>(null);
    const [orientation, setOrientation] = React.useState({ x: 0, y: 0 });

    // Scroll hooks for dynamic effects
    const { scrollYProgress } = useScroll();

    // Default colors (Global Site Theme) - Using CSS variables for adaptability
    const defaultPrimary = 'hsl(var(--primary))';
    const defaultSecondary = 'hsl(var(--secondary))';
    const defaultBg = 'hsl(var(--background))';
    const defaultText = 'hsl(var(--foreground))';

    const primaryColor = theme?.primaryColor || defaultPrimary;
    const secondaryColor = theme?.secondaryColor || defaultSecondary;
    const bgColor = theme?.backgroundColor || defaultBg;
    const textColor = theme?.textColor || defaultText;

    // Dynamic Color Transformation based on scroll
    // Interpolates: Primary -> Secondary -> Purple -> Primary
    const waveColor = useTransform(
        scrollYProgress,
        [0, 0.33, 0.66, 1],
        [
            primaryColor,
            secondaryColor,
            '#9333EA', // Purple Accent (Fixed for variety)
            primaryColor
        ]
    );

    // Dynamic Size Transformation based on scroll
    // Starts huge (Top) -> Becomes tiny/none (Bottom)
    const waveScale = useTransform(scrollYProgress, [0, 1], [4, 0.5]); // Changed 0 to 0.5 so it doesn't completely disappear

    React.useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            let x, y;
            if ('touches' in e) {
                if (e.touches.length > 0) {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                } else {
                    return;
                }
            } else {
                x = (e as MouseEvent).clientX;
                y = (e as MouseEvent).clientY;
            }
            // Update MotionValues directly (no React render)
            mouseX.set(x - 250); // Center offset for 500px div
            mouseY.set(y - 250); // Center offset for 500px div
        };

        const handleClick = (e: MouseEvent | TouchEvent) => {
            let x, y;
            if ('touches' in e) {
                if (e.touches.length > 0) {
                    x = e.touches[0].clientX;
                    y = e.touches[0].clientY;
                } else {
                    return;
                }
            } else {
                x = (e as MouseEvent).clientX;
                y = (e as MouseEvent).clientY;
            }
            setClickPosition({ x, y });
            setTimeout(() => setClickPosition(null), 3000);
        };

        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta === null || e.gamma === null) return;

            // Beta is front-to-back tilt in degrees, where front is positive
            // Gamma is left-to-right tilt in degrees, where right is positive
            const x = e.gamma * 5; // Amplify effect
            const y = e.beta * 5;

            setOrientation({ x, y });

            // Update spring values for smoother movement
            mouseX.set(x * 2);
            mouseY.set(y * 2);
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove, { passive: true }); // Passive for better scroll perf
        window.addEventListener('click', handleClick);
        window.addEventListener('touchstart', handleClick, { passive: true });

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        }

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('click', handleClick);
            window.removeEventListener('touchstart', handleClick);
            if (window.DeviceOrientationEvent) {
                window.removeEventListener('deviceorientation', handleOrientation);
            }
        };
    }, []); // Empty dependency array as MotionValues handle updates without re-renders

    return (
        <div className={`${position} inset-0 overflow-hidden pointer-events-none ${overlay ? 'z-50' : 'z-[-1]'}`}>
            {/* Base Background - Only if NOT overlay */}
            {!overlay && (
                <div
                    className="absolute inset-0 transition-colors duration-500"
                    style={{ backgroundColor: bgColor }}
                />
            )}

            {/* Tech Grid Pattern - Only if NOT overlay (to avoid covering text) */}
            {!overlay && (
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(${textColor} 1px, transparent 1px), linear-gradient(90deg, ${textColor} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            )}

            {/* Ambient Spotlight (Follows Cursor/Touch) */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
                style={{
                    x: springX,
                    y: springY,
                    backgroundColor: primaryColor,
                    willChange: "transform" // Hardware acceleration hint
                }}
            />

            {/* Floating Particles - Global Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor, // Alternating colors
                            willChange: "transform, opacity"
                        }}
                        animate={{
                            y: [-20, 20],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Click Ripple Effect (Expanding Rings) */}
            <AnimatePresence>
                {clickPosition && (
                    <>
                        {[0, 1].map((i) => ( // Reduced to 2 rings for subtlety
                            <motion.div
                                key={`${clickPosition.x}-${clickPosition.y}-${i}`}
                                initial={{ width: 0, height: 0, opacity: 0.5, borderWidth: "1px" }} // Thinner border, lower opacity
                                animate={{ width: "300px", height: "300px", opacity: 0, borderWidth: "0px" }} // Smaller max size
                                exit={{ opacity: 0 }}
                                transition={{ duration: 2.5, delay: i * 0.4, ease: [0.25, 0.1, 0.25, 1] }} // Slower, smoother easing
                                className="absolute rounded-full"
                                style={{
                                    left: clickPosition.x,
                                    top: clickPosition.y,
                                    x: "-50%",
                                    y: "-50%",
                                    borderColor: primaryColor,
                                    borderStyle: "solid",
                                    backgroundColor: "transparent",
                                    willChange: "transform, opacity, width, height"
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
