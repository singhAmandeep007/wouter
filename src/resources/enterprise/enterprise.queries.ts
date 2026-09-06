import { queryOptions } from "@tanstack/react-query";
import { enterpriseKeys } from "./enterprise.keys";
import { enterpriseService } from "./enterprise.service";

export const enterpriseQueries = {
  kpi: () =>
    queryOptions({
      queryKey: enterpriseKeys.kpi(),
      queryFn: () => enterpriseService.getKpi(),
      meta: { errorMessage: "Failed to load enterprise KPIs" },
    }),

  revenue: () =>
    queryOptions({
      queryKey: enterpriseKeys.revenue(),
      queryFn: () => enterpriseService.getRevenue(),
    }),

  integrations: () =>
    queryOptions({
      queryKey: enterpriseKeys.integrations(),
      queryFn: () => enterpriseService.getIntegrations(),
    }),

  transcripts: () =>
    queryOptions({
      queryKey: enterpriseKeys.transcripts(),
      queryFn: () => enterpriseService.getChatbotTranscripts(),
    }),
};
