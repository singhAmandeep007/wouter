import { queryOptions } from "@tanstack/react-query";
import { productKeys } from "./product.keys";
import { productService } from "./product.service";

/**
 * `queryOptions()` is the single source of truth for each query's identity + fetcher.
 * The SAME object powers the hooks AND imperative calls:
 *
 *   useProducts()                                   // component
 *   queryClient.prefetchQuery(productQueries.list())  // router loader / hover prefetch
 *   queryClient.fetchQuery(productQueries.detail(id))
 *
 * so the key and fetch logic can never drift between those call sites.
 */
export const productQueries = {
  list: () =>
    queryOptions({
      queryKey: productKeys.lists(),
      queryFn: () => productService.list(),
    }),

  detail: (productId: string) =>
    queryOptions({
      queryKey: productKeys.detail(productId),
      queryFn: () => productService.getById(productId),
      meta: { errorMessage: "Failed to load product" },
    }),
};
