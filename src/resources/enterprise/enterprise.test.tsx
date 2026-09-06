import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { renderHook, waitFor } from "@testing-library/react";
import { notificationStore } from "@/shared/notifications";
import { createQueryWrapper } from "@/test/test-utils";
import { server } from "@/test/server";
import { enterpriseService } from "./enterprise.service";
import { enterpriseKeys } from "./enterprise.keys";
import {
  useEnterpriseIntegrations,
  useEnterpriseKpi,
  useEnterpriseRevenue,
  useEnterpriseTranscripts,
} from "./enterprise.hooks";

afterEach(() => notificationStore.clear());

describe("EnterpriseService KPI zod validation", () => {
  it("returns validated KPI data for a well-formed payload", async () => {
    const kpi = await enterpriseService.getKpi();
    expect(kpi).toMatchObject({
      activeTenants: expect.any(Number),
      slaPercent: expect.any(Number),
    });
  });

  it("rejects a malformed KPI payload at the boundary", async () => {
    server.use(
      http.get("/api/enterprise/kpi", () =>
        // slaPercent out of range (>100) + negative count + wrong type → schema must reject.
        HttpResponse.json({ activeTenants: -1, apiRequestsPerMinute: "lots", slaPercent: 200, unresolvedIncidents: 0 })
      )
    );
    await expect(enterpriseService.getKpi()).rejects.toMatchObject({ code: "RESPONSE_VALIDATION_FAILED" });
  });

  it("loads revenue, integrations, and transcripts", async () => {
    expect((await enterpriseService.getRevenue()).length).toBeGreaterThan(0);
    expect((await enterpriseService.getIntegrations()).length).toBeGreaterThan(0);
    expect((await enterpriseService.getChatbotTranscripts()).length).toBeGreaterThan(0);
  });
});

describe("enterprise keys", () => {
  it("scopes all sub-resources under the enterprise prefix", () => {
    expect(enterpriseKeys.all).toEqual(["enterprise"]);
    expect(enterpriseKeys.kpi()).toEqual(["enterprise", "kpi"]);
    expect(enterpriseKeys.revenue()).toEqual(["enterprise", "revenue"]);
  });
});

describe("enterprise hooks", () => {
  it("hydrate each sub-resource", async () => {
    const { wrapper } = createQueryWrapper();

    const kpi = renderHook(() => useEnterpriseKpi(), { wrapper });
    const revenue = renderHook(() => useEnterpriseRevenue(), { wrapper });
    const integrations = renderHook(() => useEnterpriseIntegrations(), { wrapper });
    const transcripts = renderHook(() => useEnterpriseTranscripts(), { wrapper });

    await waitFor(() => expect(kpi.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(revenue.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(integrations.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(transcripts.result.current.isSuccess).toBe(true));
  });

  it("surfaces the KPI error toast when validation fails", async () => {
    server.use(http.get("/api/enterprise/kpi", () => HttpResponse.json({ bogus: true })));
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useEnterpriseKpi(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    await waitFor(() =>
      expect(notificationStore.getSnapshot().some((n) => n.message === "Failed to load enterprise KPIs")).toBe(true)
    );
  });
});
