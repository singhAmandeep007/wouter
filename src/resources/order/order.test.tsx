import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { ApiError } from "@/shared/api/http/errors";
import { notificationStore } from "@/shared/notifications";
import { createQueryWrapper } from "@/test/test-utils";
import { server } from "@/test/server";
import { orderService } from "./order.service";
import { useOrder, useOrders } from "./order.hooks";

afterEach(() => notificationStore.clear());

describe("OrderService", () => {
  it("lists orders and fetches one by id", async () => {
    const orders = await orderService.list();
    expect(orders.length).toBeGreaterThan(0);

    const one = await orderService.getById(orders[0].id);
    expect(one.id).toBe(orders[0].id);
    expect(Array.isArray(one.items)).toBe(true);
  });

  it("throws ApiError on a missing order", async () => {
    server.use(
      http.get("/api/orders/:orderId", () => HttpResponse.json({ message: "no order" }, { status: 404 }))
    );
    await expect(orderService.getById("nope")).rejects.toBeInstanceOf(ApiError);
  });
});

describe("useOrders / useOrder", () => {
  it("loads the orders list", async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useOrders(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("does not fetch for an empty order id", () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useOrder(""), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("emits the configured error toast on failure", async () => {
    server.use(http.get("/api/orders/:orderId", () => HttpResponse.json({ message: "x" }, { status: 500 })));
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useOrder("o-err"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(notificationStore.getSnapshot().some((n) => n.message === "Failed to load order")).toBe(true)
    );
  });
});
