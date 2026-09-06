import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { dashboardQueries } from "./dashboard.queries";
import type { DashboardSummary } from "./dashboard.types";

export function useDashboardSummary(overrides?: AppQueryOverrides<DashboardSummary>) {
  return useAppQuery(dashboardQueries.summary(), overrides);
}
