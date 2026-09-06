import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/server";
import { apiClient } from "./client";

describe("apiClient request middleware", () => {
  it("attaches a correlation id (x-request-id) to every request", async () => {
    let seen: string | null = null;

    server.use(
      http.get("/api/settings/profile", ({ request }) => {
        seen = request.headers.get("x-request-id");
        return HttpResponse.json({
          id: "u-1",
          name: "Test",
          email: "test@example.com",
          loyaltyTier: "gold",
          defaultPaymentMethod: "pm-1",
        });
      })
    );

    await apiClient.GET("/api/settings/profile");

    expect(seen).toBeTruthy();
    expect(seen).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("generates a distinct correlation id per request", async () => {
    const ids: (string | null)[] = [];

    server.use(
      http.get("/api/settings/payment-methods", ({ request }) => {
        ids.push(request.headers.get("x-request-id"));
        return HttpResponse.json([]);
      })
    );

    await apiClient.GET("/api/settings/payment-methods");
    await apiClient.GET("/api/settings/payment-methods");

    expect(ids).toHaveLength(2);
    expect(ids[0]).not.toBe(ids[1]);
  });
});
