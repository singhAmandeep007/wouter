import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { notificationStore } from "@/shared/notifications";
import { createQueryWrapper } from "@/test/test-utils";
import { server } from "@/test/server";
import { paymentMethodService } from "./paymentMethod.service";
import { usePaymentMethods } from "./paymentMethod.hooks";

afterEach(() => notificationStore.clear());

describe("payment-method resource", () => {
  it("service lists payment methods", async () => {
    const methods = await paymentMethodService.list();
    expect(methods.length).toBeGreaterThan(0);
    expect(methods.some((m) => m.isDefault)).toBe(true);
  });

  it("hook loads payment methods", async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePaymentMethods(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("hook errors and emits a toast when the request fails", async () => {
    server.use(
      http.get("/api/settings/payment-methods", () => HttpResponse.json({ message: "boom" }, { status: 500 }))
    );
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePaymentMethods(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() => expect(notificationStore.getSnapshot().some((n) => n.kind === "error")).toBe(true));
  });
});
