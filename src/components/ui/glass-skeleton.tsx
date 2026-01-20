import { cn } from "@/lib/utils";

function GlassSkeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-white/5 border border-white/5 backdrop-blur-sm",
                "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
                className
            )}
            {...props}
        />
    );
}

export { GlassSkeleton };
