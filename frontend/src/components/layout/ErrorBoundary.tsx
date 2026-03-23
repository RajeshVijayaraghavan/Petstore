import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md rounded-xl bg-surface-container-low p-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-foreground">
              Something went wrong
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ConnectionBannerProps {
  onRetry: () => void;
}

export function ConnectionBanner({ onRetry }: ConnectionBannerProps) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive">
      <span>Unable to connect to the server</span>
      <Button variant="destructive" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default ErrorBoundary;
