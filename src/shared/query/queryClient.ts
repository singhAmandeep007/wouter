import { MutationCache, QueryCache, QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { ApiError } from "@/shared/api/http/errors";
import { notify } from "@/shared/notifications";
import "./meta"; // registers defaultError + typed meta

function messageFromError(error: unknown, fallback?: string): string {
  if (error instanceof ApiError || error instanceof Error) {
    return error.message;
  }
  return fallback ?? "Something went wrong";
}

/**
 * Global success/error handling lives here, on the caches — NOT in individual hooks.
 *
 * Why: cache-level callbacks fire once per cache entry regardless of how many components
 * observe the same query. Putting toast logic in per-component `onError` would fire N
 * times for N subscribers and double-fire under StrictMode. The `meta` field (typed in
 * meta.ts) lets any query/mutation customize or opt out of the default toast declaratively.
 *
 * Fresh caches are built per client (not shared module singletons) so each QueryClient —
 * the app's and each test's — is fully isolated while carrying identical behavior.
 */
function createQueryCache(): QueryCache {
  return new QueryCache({
    onError(error, query) {
      if (query.meta?.suppressErrorNotification) return;
      notify.error(query.meta?.errorMessage ?? messageFromError(error));
    },
  });
}

function createMutationCache(): MutationCache {
  return new MutationCache({
    onError(error, _variables, _context, mutation) {
      if (mutation.meta?.suppressErrorNotification) return;
      notify.error(mutation.meta?.errorMessage ?? messageFromError(error));
    },
    onSuccess(_data, _variables, _context, mutation) {
      if (mutation.meta?.suppressSuccessNotification) return;
      if (mutation.meta?.successMessage) {
        notify.success(mutation.meta.successMessage);
      }
    },
  });
}

/**
 * Factory for an app-configured QueryClient. Exported (not just the singleton) so tests
 * can spin up isolated clients that carry the SAME cache/notification behavior and
 * defaults as production — the only difference tests want is `retry: false` for speed
 * and deterministic error assertions, passed via `overrides`.
 */
export function createAppQueryClient(overrides?: QueryClientConfig): QueryClient {
  return new QueryClient({
    queryCache: createQueryCache(),
    mutationCache: createMutationCache(),
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30s: treat data as fresh, dedup refetches within this window
        gcTime: 5 * 60_000, // 5m: keep unused cache before garbage collection
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
    ...overrides,
  });
}

/**
 * Single QueryClient for the app. Defaults are centralized in the factory so every
 * query/mutation inherits consistent caching and retry behavior; any hook can still
 * override per call.
 */
export const queryClient = createAppQueryClient();
