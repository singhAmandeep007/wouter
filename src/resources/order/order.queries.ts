import { queryOptions } from "@tanstack/react-query";
import { orderKeys } from "./order.keys";
import { orderService } from "./order.service";

export const orderQueries = {
  list: () =>
    queryOptions({
      queryKey: orderKeys.lists(),
      queryFn: () => orderService.list(),
    }),

  detail: (orderId: string) =>
    queryOptions({
      queryKey: orderKeys.detail(orderId),
      queryFn: () => orderService.getById(orderId),
      meta: { errorMessage: "Failed to load order" },
    }),
};
