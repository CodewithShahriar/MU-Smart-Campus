/**
 * Logs client-side errors captured by the root error boundary.
 * A reporting service can be added here later without changing the UI.
 */
export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  console.error("Runtime error", {
    error,
    route: window.location.pathname,
    ...context,
  });
}
