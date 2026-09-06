import type { QueryKey } from "@tanstack/react-query";

/**
 * Builds a hierarchical, typed query-key factory for a resource. Centralizing key shape
 * matters because keys drive cache identity AND invalidation scope:
 *
 *   queryClient.invalidateQueries({ queryKey: productKeys.all })      // everything product
 *   queryClient.invalidateQueries({ queryKey: productKeys.lists() })  // just the lists
 *
 * The nesting (`[scope] ⊃ [scope,"list"] ⊃ [scope,"list",params]`) means a broad
 * invalidation naturally matches the narrower keys beneath it.
 */
export function createQueryKeys<TScope extends string>(scope: TScope) {
  const all = [scope] as const;

  return {
    all,
    lists: () => [...all, "list"] as const,
    list: <TParams>(params?: TParams) => [...all, "list", params ?? null] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: string) => [...all, "detail", id] as const,
  };
}

export type ResourceQueryKeys = ReturnType<typeof createQueryKeys>;

/** Convenience: assert a value is a valid QueryKey (tuple) — handy in tests. */
export function asQueryKey(key: QueryKey): QueryKey {
  return key;
}
