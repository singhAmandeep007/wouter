import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { orderQueries } from "./order.queries";
import type { Order } from "./order.types";

export function useOrders(overrides?: AppQueryOverrides<Order[]>) {
  return useAppQuery(orderQueries.list(), overrides);
}

export function useOrder(orderId: string, overrides?: AppQueryOverrides<Order>) {
  return useAppQuery(orderQueries.detail(orderId), {
    enabled: orderId.length > 0,
    ...overrides,
  });
}
