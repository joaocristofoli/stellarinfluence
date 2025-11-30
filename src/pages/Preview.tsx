import { useEffect, useState } from "react";
import { LandingPagePreview } from "@/components/landing/LandingPagePreview";
import { LandingTheme } from "@/types/landingTheme";

export default function Preview() {
    const [theme, setTheme] = useState<LandingTheme | null>(null);
    const [creatorData, setCreatorData] = useState<any>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // In production, verify origin for security
            // if (event.origin !== window.location.origin) return;

            if (event.data.type === 'UPDATE_PREVIEW') {
                setTheme(event.data.theme);
                setCreatorData(event.data.creatorData);
            }
        };

        window.addEventListener('message', handleMessage);

        // Notify parent that we are ready
        window.parent.postMessage({ type: 'PREVIEW_READY' }, '*');

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    if (!theme) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
                Aguardando dados...
            </div>
        );
    }

    return (
        <LandingPagePreview
            theme={theme}
            creatorData={creatorData}
            isEditor={false} // Treat as public page for accurate rendering
        />
    );
}
