import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { enterpriseQueries } from "./enterprise.queries";
import type { ChatbotTranscript, EnterpriseKpi, IntegrationStatus, RevenuePoint } from "./enterprise.types";

export function useEnterpriseKpi(overrides?: AppQueryOverrides<EnterpriseKpi>) {
  return useAppQuery(enterpriseQueries.kpi(), overrides);
}

export function useEnterpriseRevenue(overrides?: AppQueryOverrides<RevenuePoint[]>) {
  return useAppQuery(enterpriseQueries.revenue(), overrides);
}

export function useEnterpriseIntegrations(overrides?: AppQueryOverrides<IntegrationStatus[]>) {
  return useAppQuery(enterpriseQueries.integrations(), overrides);
}

export function useEnterpriseTranscripts(overrides?: AppQueryOverrides<ChatbotTranscript[]>) {
  return useAppQuery(enterpriseQueries.transcripts(), overrides);
}
