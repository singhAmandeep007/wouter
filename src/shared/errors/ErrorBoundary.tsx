import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError } from "./isChunkLoadError";
import styles from "./errorBoundary.module.css";

export type ErrorFallbackProps = {
  error: Error;
  /** Clears the boundary's error state and re-renders children. */
  reset: () => void;
  /** True when the error looks like a failed dynamic import (stale deploy / network). */
  isChunkLoadError: boolean;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  /** Custom fallback. Defaults to <DefaultErrorFallback/>. */
  fallback?: (props: ErrorFallbackProps) => ReactNode;
  /** Side-effect hook for logging/telemetry (e.g. Sentry.captureException). */
  onError?: (error: Error, info: ErrorInfo) => void;
  /**
   * When any value here changes while in an error state, the boundary auto-resets.
   * Route-level boundaries pass the current location so navigating away clears the error
   * instead of leaving a permanently-broken subtree.
   */
  resetKeys?: readonly unknown[];
};

type ErrorBoundaryState = {
  error: Error | null;
};

function keysChanged(a: readonly unknown[] = [], b: readonly unknown[] = []): boolean {
  return a.length !== b.length || a.some((value, index) => !Object.is(value, b[index]));
}

/**
 * React error boundaries must be class components — there is no hook equivalent, because
 * getDerivedStateFromError / componentDidCatch are lifecycle-only. This one catches render
 * exceptions in its subtree (including failed lazy imports thrown through Suspense) and
 * shows a fallback instead of unmounting the whole app to a white screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && keysChanged(prevProps.resetKeys, this.props.resetKeys)) {
      this.reset();
    }
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      const render = this.props.fallback ?? DefaultErrorFallback;
      return render({ error, reset: this.reset, isChunkLoadError: isChunkLoadError(error) });
    }
    return this.props.children;
  }
}

export function DefaultErrorFallback({ error, reset, isChunkLoadError: chunkError }: ErrorFallbackProps) {
  return (
    <div
      className={styles.errorBoundary}
      role="alert"
      data-testid="error-boundary-fallback"
    >
      <h2>Something went wrong</h2>
      <p className={styles.message}>{error.message}</p>
      {chunkError ? (
        <button
          type="button"
          data-testid="error-boundary-reload"
          onClick={() => window.location.reload()}
        >
          Reload the app
        </button>
      ) : (
        <button
          type="button"
          data-testid="error-boundary-retry"
          onClick={reset}
        >
          Try again
        </button>
      )}
    </div>
  );
}
