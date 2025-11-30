import { useEffect, useRef, useState } from "react";
import { useInView, useSpring } from "framer-motion";

interface CounterProps {
    value: string;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const Counter = ({ value, delay = 0, className, style }: CounterProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    // Extract number and suffix (e.g., "500K" -> 500, "K")
    const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
    const suffix = value.replace(/[0-9]/g, "");

    const springValue = useSpring(0, {
        damping: 30,
        stiffness: 50,
        duration: 2
    });

    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                springValue.set(numericValue);
            }, delay * 1000);
        }
    }, [isInView, numericValue, delay, springValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [springValue]);

    return (
        <span ref={ref} className={`tabular-nums ${className}`} style={style}>
            {displayValue}{suffix}
        </span>
    );
};
