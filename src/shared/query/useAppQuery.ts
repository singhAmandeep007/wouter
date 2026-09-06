import { type QueryKey, type UseQueryOptions, type UseQueryResult, useQuery } from "@tanstack/react-query";
import type { ApiError } from "@/shared/api/http/errors";

/**
 * Per-call overrides a resource hook accepts: everything except the identity of the
 * query (`queryKey`/`queryFn`), which is owned by the resource's `queryOptions` builder.
 * This is what makes hooks "configurable/overridable" — callers tune `enabled`,
 * `staleTime`, `select`, `meta`, etc. without being able to break the cache key.
 *
 * Deliberately NOT parameterized by the query-key type: the base `queryOptions` carries a
 * precise literal key (e.g. `["product","detail",id]`), but overrides never touch the key,
 * so pinning them to the general `QueryKey` keeps the two independent and composable.
 */
export type AppQueryOverrides<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, ApiError, TData, QueryKey>,
  "queryKey" | "queryFn"
>;

/**
 * The global query wrapper. Resource hooks call `useAppQuery(resourceQueries.x(id), options)`.
 * It merges caller overrides over the resource's base `queryOptions` (deep-merging `meta`)
 * and pins the error type to our normalized `ApiError`. Error/success toasts are handled
 * globally by the cache callbacks in queryClient.ts, so this stays a thin, typed seam.
 */
export function useAppQuery<TQueryFnData, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>(
  base: UseQueryOptions<TQueryFnData, ApiError, TData, TQueryKey>,
  overrides?: AppQueryOverrides<TQueryFnData, TData>
): UseQueryResult<TData, ApiError> {
  // The public signature is fully typed; internally we merge two option objects with
  // different key generics (precise base key vs. general override), so we assert the
  // merged shape back to the base's concrete options type. This cast is the only
  // unavoidable seam in an otherwise end-to-end-typed wrapper.
  const merged = {
    ...base,
    ...overrides,
    meta: { ...base.meta, ...overrides?.meta },
  } as UseQueryOptions<TQueryFnData, ApiError, TData, TQueryKey>;

  return useQuery(merged);
}
