import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
    fallbackDescription?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component - Prevents blank screens from uncaught errors
 * Implements progressive error recovery with user-friendly fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console in development only
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const { fallbackTitle = 'Algo deu errado', fallbackDescription = 'Ocorreu um erro inesperado. Por favor, tente novamente.' } = this.props;

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="max-w-md w-full glass border-border/50">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
                            </div>
                            <CardTitle className="text-xl">{fallbackTitle}</CardTitle>
                            <CardDescription>{fallbackDescription}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Show error details in development */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="p-3 rounded-lg bg-muted text-sm font-mono text-muted-foreground overflow-auto max-h-32">
                                    {this.state.error.message}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                    onClick={this.handleRetry}
                                    className="flex-1 gap-2"
                                    variant="default"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Tentar Novamente
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="flex-1 gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    Voltar ao Início
                                </Button>
                            </div>

                            <p className="text-xs text-center text-muted-foreground">
                                Se o problema persistir, entre em contato com o suporte.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
