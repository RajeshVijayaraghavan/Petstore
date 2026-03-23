const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: "Something went wrong with your request. Please check your input and try again.",
  404: "The item you're looking for doesn't exist or has been removed.",
  422: "Please check the highlighted fields and correct any errors.",
};

const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your connection and try again.";

const SERVER_ERROR_MESSAGE =
  "Something went wrong on our end. Please try again in a moment.";

const FALLBACK_MESSAGE =
  "An unexpected error occurred. Please try again.";

function hasStatus(error: unknown): error is { status: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const msg = (error as { message: string }).message.toLowerCase();
    return msg.includes("network") || msg.includes("fetch");
  }

  return false;
}

export function getErrorStatus(error: unknown): number | null {
  return hasStatus(error) ? error.status : null;
}

export function mapErrorToMessage(error: unknown): string {
  if (hasStatus(error)) {
    const { status } = error;

    const mapped = HTTP_ERROR_MESSAGES[status];
    if (mapped) return mapped;

    if (status >= 500 && status < 600) return SERVER_ERROR_MESSAGE;
  }

  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;

  return FALLBACK_MESSAGE;
}
