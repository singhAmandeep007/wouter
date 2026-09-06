import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { DashboardSummary as dashboardSummarySchema } from "@/shared/api/generated/zod";
import type { DashboardSummary } from "./dashboard.types";

export class DashboardService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  getSummary(): Promise<DashboardSummary> {
    return unwrap(this.client.GET("/api/summary"), dashboardSummarySchema);
  }
}

export const dashboardService = new DashboardService();
