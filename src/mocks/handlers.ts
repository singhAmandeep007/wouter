import { delay, http, HttpResponse } from "msw";
import {
  categories,
  chatbotTranscripts,
  enterpriseKpi,
  enterpriseRevenue,
  integrationStatuses,
  orders,
  paymentMethods,
  products,
  profile,
} from "./data";

export const handlers = [
  http.get("/api/summary", async () => {
    await delay(250);

    const lowStockProducts = products.filter((product) => product.stock <= 10);
    const revenueMonth = orders.reduce((total, order) => total + order.totalAmount, 0);

    return HttpResponse.json({
      profile,
      openOrders: orders.filter((order) => order.status !== "delivered").length,
      revenueMonth,
      lowStockProducts,
    });
  }),

  http.get("/api/settings/profile", async () => {
    await delay(150);
    return HttpResponse.json(profile);
  }),

  http.put("/api/settings/profile", async ({ request }) => {
    await delay(200);
    const updates = (await request.json()) as Partial<typeof profile>;
    // Mutate the mock record in place so subsequent GETs reflect the change.
    Object.assign(profile, updates);
    return HttpResponse.json(profile);
  }),

  http.get("/api/settings/payment-methods", async () => {
    await delay(180);
    return HttpResponse.json(paymentMethods);
  }),

  http.get("/api/catalog/categories", async () => {
    await delay(200);
    return HttpResponse.json(categories);
  }),

  http.get("/api/catalog/products", async ({ request }) => {
    await delay(220);

    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");

    const result = categoryId ? products.filter((product) => product.categoryId === categoryId) : products;

    return HttpResponse.json(result);
  }),

  http.get("/api/catalog/products/:productId", async ({ params }) => {
    await delay(200);
    const product = products.find((entry) => entry.id === params.productId);

    if (!product) {
      return HttpResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return HttpResponse.json(product);
  }),

  http.get("/api/orders", async () => {
    await delay(240);
    return HttpResponse.json(orders);
  }),

  http.get("/api/orders/:orderId", async ({ params }) => {
    await delay(180);
    const order = orders.find((entry) => entry.id === params.orderId);

    if (!order) {
      return HttpResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return HttpResponse.json(order);
  }),

  http.get("/api/enterprise/kpi", async () => {
    await delay(220);
    return HttpResponse.json(enterpriseKpi);
  }),

  http.get("/api/enterprise/revenue", async () => {
    await delay(320);
    return HttpResponse.json(enterpriseRevenue);
  }),

  http.get("/api/enterprise/integrations", async () => {
    await delay(260);
    return HttpResponse.json(integrationStatuses);
  }),

  http.get("/api/enterprise/chatbot/transcripts", async () => {
    await delay(300);
    return HttpResponse.json(chatbotTranscripts);
  }),
];
