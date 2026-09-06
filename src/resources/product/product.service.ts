import { z } from "zod";
import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { Product as productSchema } from "@/shared/api/generated/zod";
import type { Product } from "./product.types";

/**
 * The service class is the imperative surface — usable anywhere, no React required
 * (tests, router loaders, prefetch, scripts). The client is constructor-injected so it
 * can be swapped for a mock or an alternate configuration, which makes the class
 * testable and overridable (extend it, or `new ProductService(customClient)`).
 */
export class ProductService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  list(): Promise<Product[]> {
    return unwrap(this.client.GET("/api/catalog/products"), z.array(productSchema));
  }

  getById(productId: string): Promise<Product> {
    return unwrap(
      this.client.GET("/api/catalog/products/{productId}", { params: { path: { productId } } }),
      productSchema
    );
  }
}

/** Default singleton used by the hooks. Import the class directly to inject a client. */
export const productService = new ProductService();
