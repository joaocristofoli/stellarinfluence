import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import React, { useRef, useState } from "react";

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    target?: string;
    rel?: string;
    style?: React.CSSProperties;
}

export const MagneticButton = ({ children, className, onClick, href, target, rel, style }: MagneticButtonProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const ySpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;

        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        // Magnetic pull strength
        x.set(distanceX * 0.3);
        y.set(distanceY * 0.3);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    const Component = href ? motion.a : motion.div;
    const props = href ? { href, target, rel } : { onClick };

    return (
        <Component
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{ x: xSpring, y: ySpring, ...style }}
            className={`relative cursor-pointer ${className}`}
            {...props}
        >
            {/* Shine Effect */}
            {isHovered && (
                <motion.div
                    layoutId="shine"
                    className="absolute inset-0 -z-10 rounded-full opacity-50 blur-md"
                    style={{
                        background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, transparent 70%)",
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 0.3 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                />
            )}
            {children}
        </Component>
    );
};
