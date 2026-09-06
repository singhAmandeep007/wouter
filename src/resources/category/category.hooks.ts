import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { categoryQueries } from "./category.queries";
import type { Category } from "./category.types";

export function useCategories(overrides?: AppQueryOverrides<Category[]>) {
  return useAppQuery(categoryQueries.list(), overrides);
}
