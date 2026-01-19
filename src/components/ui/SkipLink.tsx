import { cn } from "@/lib/utils";

/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows users to skip directly to main content (WCAG 2.4.1)
 * Hidden visually but accessible via keyboard focus
 */
export function SkipLink({
    href = "#main-content",
    children = "Pular para o conteúdo principal"
}: {
    href?: string;
    children?: React.ReactNode
}) {
    return (
        <a
            href={href}
            className={cn(
                // Visually hidden by default
                "sr-only focus:not-sr-only",
                // Visible on focus
                "focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
                // Style when visible
                "focus:bg-primary focus:text-primary-foreground",
                "focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                // Transition
                "transition-all duration-200"
            )}
        >
            {children}
        </a>
    );
}

export default SkipLink;
