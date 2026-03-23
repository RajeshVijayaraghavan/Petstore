import { mapErrorToMessage } from "@/lib/error-mapper";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface QueryErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function QueryErrorState({
  error,
  onRetry,
  className = "",
}: QueryErrorStateProps) {
  const message = mapErrorToMessage(error);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-xl bg-destructive/5 py-16 text-center ${className}`}
    >
      <p className="text-lg font-medium text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
