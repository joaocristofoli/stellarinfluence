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
    // For "10.000", we want numericValue=10000 and suffix=""
    // We remove dots and commas before parsing to get the raw number
    const numericValue = parseInt(value.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "")) || 0;

    // Suffix is anything that is NOT a digit, dot, or comma
    const suffix = value.replace(/[0-9.,]/g, "");

    const springValue = useSpring(0, {
        damping: 30,
        stiffness: 50,
        duration: 2
    });

    const [displayValue, setDisplayValue] = useState("0");

    useEffect(() => {
        if (isInView) {
            setTimeout(() => {
                springValue.set(numericValue);
            }, delay * 1000);
        }
    }, [isInView, numericValue, delay, springValue]);

    useEffect(() => {
        return springValue.on("change", (latest) => {
            // Format the current number with dots
            const val = Math.floor(latest);
            setDisplayValue(new Intl.NumberFormat('pt-BR').format(val));
        });
    }, [springValue]);

    return (
        <span ref={ref} className={`tabular-nums ${className}`} style={style}>
            {displayValue}{suffix}
        </span>
    );
};
