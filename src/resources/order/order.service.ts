import { z } from "zod";
import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { Order as orderSchema } from "@/shared/api/generated/zod";
import type { Order } from "./order.types";

export class OrderService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  list(): Promise<Order[]> {
    return unwrap(this.client.GET("/api/orders"), z.array(orderSchema));
  }

  getById(orderId: string): Promise<Order> {
    return unwrap(this.client.GET("/api/orders/{orderId}", { params: { path: { orderId } } }), orderSchema);
  }
}

export const orderService = new OrderService();
