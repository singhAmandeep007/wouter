import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { productQueries } from "./product.queries";
import type { Product } from "./product.types";

/**
 * Resource hooks are thin: they bind a `queryOptions` builder to the global `useAppQuery`
 * wrapper and forward caller overrides (enabled, staleTime, select, meta, ...). Callers
 * never see the query key or fetcher — only the resource's public verbs.
 */
export function useProducts(overrides?: AppQueryOverrides<Product[]>) {
  return useAppQuery(productQueries.list(), overrides);
}

export function useProduct(productId: string, overrides?: AppQueryOverrides<Product>) {
  return useAppQuery(productQueries.detail(productId), {
    // Guard against empty ids from route params; callers can still override.
    enabled: productId.length > 0,
    ...overrides,
  });
}
