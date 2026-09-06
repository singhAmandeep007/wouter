import { z } from "zod";
import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { PaymentMethod as paymentMethodSchema } from "@/shared/api/generated/zod";
import type { PaymentMethod } from "./paymentMethod.types";

export class PaymentMethodService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  list(): Promise<PaymentMethod[]> {
    return unwrap(this.client.GET("/api/settings/payment-methods"), z.array(paymentMethodSchema));
  }
}

export const paymentMethodService = new PaymentMethodService();
