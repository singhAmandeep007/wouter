import { queryOptions } from "@tanstack/react-query";
import { categoryKeys } from "./category.keys";
import { categoryService } from "./category.service";

export const categoryQueries = {
  list: () =>
    queryOptions({
      queryKey: categoryKeys.lists(),
      queryFn: () => categoryService.list(),
    }),
};
