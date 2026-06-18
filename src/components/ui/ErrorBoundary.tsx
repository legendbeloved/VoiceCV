import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card variant="glass" padding="xl" className="max-w-md text-center border-destructive/20">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Something went wrong</h2>
            <p className="text-white/50 mb-8 leading-relaxed">
              We encountered an unexpected error. Don't worry, your progress is safe. Please try refreshing.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
              leftIcon={<RefreshCcw size={18} />}
            >
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
