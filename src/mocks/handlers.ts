import { delay, http, HttpResponse } from "msw";
import { KPI_ID, PROFILE_ID, db } from "./db";
import { isEmpty, withFaults } from "./faults";

// One delay for every endpoint (DRY) — enough to exercise loading states without slowing tests.
const LATENCY_MS = 150;

// Prefix every route with the app's public base path so handlers match the client's requests
// under a subpath deploy (GitHub Pages → "/wouter/api/..."). Empty in dev/tests → "/api/...".
const basePrefix = import.meta.env.BASE_URL.replace(/\/+$/, "");
const withBase = (path: string) => `${basePrefix}${path}`;

/**
 * Request handlers. Each maps a custom `/api/...` path to a query against the mock DB and is
 * wrapped in `withFaults(operationId, …)` so any endpoint can be flipped to error/empty/network
 * failure at runtime (see faults.ts). Handlers describe ONLY the happy path.
 *
 * `operationId`s mirror the OpenAPI spec, so the fault control API speaks the same names.
 */
export const handlers = [
  http.get(
    withBase("/api/summary"),
    withFaults("getDashboardSummary", async () => {
      await delay(LATENCY_MS);
      const orders = db.order.getAll();
      return HttpResponse.json({
        profile: db.profile.findFirst({ where: { id: { equals: PROFILE_ID } } }),
        openOrders: orders.filter((order) => order.status !== "delivered").length,
        revenueMonth: orders.reduce((total, order) => total + order.totalAmount, 0),
        lowStockProducts: db.product.getAll().filter((product) => product.stock <= 10),
      });
    })
  ),

  http.get(
    withBase("/api/settings/profile"),
    withFaults("getUserProfile", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(db.profile.findFirst({ where: { id: { equals: PROFILE_ID } } }));
    })
  ),

  http.put(
    withBase("/api/settings/profile"),
    withFaults("updateUserProfile", async ({ request }) => {
      await delay(LATENCY_MS);
      const updates = (await request.json()) as Record<string, unknown>;
      const updated = db.profile.update({
        where: { id: { equals: PROFILE_ID } },
        data: updates,
      });
      return HttpResponse.json(updated);
    })
  ),

  http.get(
    withBase("/api/settings/payment-methods"),
    withFaults("listPaymentMethods", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("listPaymentMethods") ? [] : db.paymentMethod.getAll());
    })
  ),

  http.get(
    withBase("/api/catalog/categories"),
    withFaults("listCategories", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("listCategories") ? [] : db.category.getAll());
    })
  ),

  http.get(
    withBase("/api/catalog/products"),
    withFaults("listProducts", async ({ request }) => {
      await delay(LATENCY_MS);
      if (isEmpty("listProducts")) {
        return HttpResponse.json([]);
      }
      const categoryId = new URL(request.url).searchParams.get("categoryId");
      const products = categoryId
        ? db.product.findMany({ where: { categoryId: { equals: categoryId } } })
        : db.product.getAll();
      return HttpResponse.json(products);
    })
  ),

  http.get(
    withBase("/api/catalog/products/:productId"),
    withFaults("getProductById", async ({ params }) => {
      await delay(LATENCY_MS);
      const product = db.product.findFirst({ where: { id: { equals: String(params.productId) } } });
      if (!product) {
        return HttpResponse.json({ message: "Product not found", code: "NOT_FOUND" }, { status: 404 });
      }
      return HttpResponse.json(product);
    })
  ),

  http.get(
    withBase("/api/orders"),
    withFaults("listOrders", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("listOrders") ? [] : db.order.getAll());
    })
  ),

  http.get(
    withBase("/api/orders/:orderId"),
    withFaults("getOrderById", async ({ params }) => {
      await delay(LATENCY_MS);
      const order = db.order.findFirst({ where: { id: { equals: String(params.orderId) } } });
      if (!order) {
        return HttpResponse.json({ message: "Order not found", code: "NOT_FOUND" }, { status: 404 });
      }
      return HttpResponse.json(order);
    })
  ),

  http.get(
    withBase("/api/enterprise/kpi"),
    withFaults("getEnterpriseKpi", async () => {
      await delay(LATENCY_MS);
      const record = db.enterpriseKpi.findFirst({ where: { id: { equals: KPI_ID } } });
      if (!record) {
        return HttpResponse.json({ message: "KPI unavailable", code: "NOT_FOUND" }, { status: 404 });
      }
      // Map explicit fields so the synthetic primary key never leaks into the response
      // (keeps it matching the EnterpriseKpi contract exactly).
      return HttpResponse.json({
        activeTenants: record.activeTenants,
        apiRequestsPerMinute: record.apiRequestsPerMinute,
        slaPercent: record.slaPercent,
        unresolvedIncidents: record.unresolvedIncidents,
      });
    })
  ),

  http.get(
    withBase("/api/enterprise/revenue"),
    withFaults("getEnterpriseRevenue", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("getEnterpriseRevenue") ? [] : db.revenuePoint.getAll());
    })
  ),

  http.get(
    withBase("/api/enterprise/integrations"),
    withFaults("getEnterpriseIntegrations", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("getEnterpriseIntegrations") ? [] : db.integrationStatus.getAll());
    })
  ),

  http.get(
    withBase("/api/enterprise/chatbot/transcripts"),
    withFaults("getChatbotTranscripts", async () => {
      await delay(LATENCY_MS);
      return HttpResponse.json(isEmpty("getChatbotTranscripts") ? [] : db.chatbotTranscript.getAll());
    })
  ),
];
