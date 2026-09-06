import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { notificationStore } from "@/shared/notifications";
import { createQueryWrapper } from "@/test/test-utils";
import { server } from "@/test/server";
import { dashboardService } from "./dashboard.service";
import { useDashboardSummary } from "./dashboard.hooks";

afterEach(() => notificationStore.clear());

describe("dashboard resource", () => {
  it("service returns an aggregated summary", async () => {
    const summary = await dashboardService.getSummary();
    expect(summary).toHaveProperty("profile");
    expect(summary).toHaveProperty("openOrders");
    expect(Array.isArray(summary.lowStockProducts)).toBe(true);
  });

  it("hook loads the summary", async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardSummary(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.profile.name).toBeTruthy();
  });

  it("emits the configured error toast on failure", async () => {
    server.use(http.get("/api/summary", () => HttpResponse.json({ message: "x" }, { status: 500 })));
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useDashboardSummary(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(notificationStore.getSnapshot().some((n) => n.message === "Failed to load dashboard")).toBe(true)
    );
  });
});
