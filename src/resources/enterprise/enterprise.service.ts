import { z } from "zod";
import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import {
  ChatbotTranscript as chatbotTranscriptSchema,
  EnterpriseKpi as enterpriseKpiSchema,
  IntegrationStatus as integrationStatusSchema,
  RevenuePoint as revenuePointSchema,
} from "@/shared/api/generated/zod";
import type { ChatbotTranscript, EnterpriseKpi, IntegrationStatus, RevenuePoint } from "./enterprise.types";

/**
 * Runtime contract validation at the trust boundary, for every endpoint. The zod schemas
 * are generated from the same openapi.yaml as the types (via `npm run codegen`), so there
 * is one source of truth and no hand-maintained duplicate. The KPI schema, for example,
 * enforces slaPercent 0..100 because that constraint lives in the spec.
 */
export class EnterpriseService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  getKpi(): Promise<EnterpriseKpi> {
    return unwrap(this.client.GET("/api/enterprise/kpi"), enterpriseKpiSchema);
  }

  getRevenue(): Promise<RevenuePoint[]> {
    return unwrap(this.client.GET("/api/enterprise/revenue"), z.array(revenuePointSchema));
  }

  getIntegrations(): Promise<IntegrationStatus[]> {
    return unwrap(this.client.GET("/api/enterprise/integrations"), z.array(integrationStatusSchema));
  }

  getChatbotTranscripts(): Promise<ChatbotTranscript[]> {
    return unwrap(this.client.GET("/api/enterprise/chatbot/transcripts"), z.array(chatbotTranscriptSchema));
  }
}

export const enterpriseService = new EnterpriseService();
