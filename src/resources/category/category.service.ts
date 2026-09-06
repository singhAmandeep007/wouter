import { z } from "zod";
import { apiClient, type ApiClient } from "@/shared/api/http/client";
import { unwrap } from "@/shared/api/http/errors";
import { Category as categorySchema } from "@/shared/api/generated/zod";
import type { Category } from "./category.types";

export class CategoryService {
  private readonly client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  list(): Promise<Category[]> {
    return unwrap(this.client.GET("/api/catalog/categories"), z.array(categorySchema));
  }
}

export const categoryService = new CategoryService();
