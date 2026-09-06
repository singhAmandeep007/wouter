import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/test/test-utils";
import { paymentMethodService } from "./paymentMethod.service";
import { usePaymentMethods } from "./paymentMethod.hooks";

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
});
