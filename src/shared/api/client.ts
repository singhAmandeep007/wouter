import type { Category, DashboardSummary, Order, PaymentMethod, Product, UserProfile } from "./types";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  getSummary: () => fetchJson<DashboardSummary>("/api/summary"),
  getProfile: () => fetchJson<UserProfile>("/api/settings/profile"),
  getPaymentMethods: () => fetchJson<PaymentMethod[]>("/api/settings/payment-methods"),
  getCategories: () => fetchJson<Category[]>("/api/catalog/categories"),
  getProducts: () => fetchJson<Product[]>("/api/catalog/products"),
  getProductById: (productId: string) => fetchJson<Product>(`/api/catalog/products/${productId}`),
  getOrders: () => fetchJson<Order[]>("/api/orders"),
  getOrderById: (orderId: string) => fetchJson<Order>(`/api/orders/${orderId}`),
};
