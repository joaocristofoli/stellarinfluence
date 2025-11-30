import { useEffect, useRef } from "react";

export function useScrollReveal(options = {}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        element.style.opacity = "1";
                        element.style.transform = "translateY(0)";
                        element.style.filter = "blur(0)";
                    }
                });
            },
            {
                threshold: 0.1,
                ...options,
            }
        );

        // Initial state
        element.style.opacity = "0";
        element.style.transform = "translateY(40px)";
        element.style.filter = "blur(10px)";
        element.style.transition = "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
        element.style.willChange = "transform, opacity, filter";

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    return ref;
}

export function useCountUp(end: number, duration: number = 2000) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const element = ref.current;
        if (!element || hasAnimated.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;
                        let start = 0;
                        const increment = end / (duration / 16);

                        const timer = setInterval(() => {
                            start += increment;
                            if (start >= end) {
                                element.textContent = end.toString();
                                clearInterval(timer);
                            } else {
                                element.textContent = Math.floor(start).toString();
                            }
                        }, 16);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [end, duration]);

    return ref;
}
