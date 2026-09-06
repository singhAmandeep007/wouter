import { createQueryKeys } from "@/shared/query";

/**
 * Cache-key factory for the product resource. All product cache entries live under the
 * `["product", ...]` prefix, so `invalidateQueries({ queryKey: productKeys.all })`
 * refreshes every product query at once.
 */
export const productKeys = createQueryKeys("product");
