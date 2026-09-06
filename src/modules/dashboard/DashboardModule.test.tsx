import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { notificationStore } from "@/shared/notifications";
import { server } from "@/test/server";
import DashboardModule from "./DashboardModule";

afterEach(() => notificationStore.clear());

describe("DashboardModule", () => {
  it("renders summary data once the query resolves", async () => {
    renderWithProviders(<DashboardModule />, { route: "/dashboard" });

    expect(await screen.findByTestId("dashboard-module")).toBeInTheDocument();
    expect(await screen.findByText(/Open orders:/)).toBeInTheDocument();
    expect(screen.getByText(/Revenue this month:/)).toBeInTheDocument();
  });

  it("shows an inline error message when the summary request fails", async () => {
    server.use(http.get("/api/summary", () => HttpResponse.json({ message: "boom" }, { status: 500 })));
    renderWithProviders(<DashboardModule />, { route: "/dashboard" });

    expect(await screen.findByText(/Failed to load dashboard/)).toBeInTheDocument();
  });
});
