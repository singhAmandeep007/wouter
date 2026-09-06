import { factory, manyOf, primaryKey } from "@mswjs/data";

/**
 * In-memory relational mock database (a single shared instance — the mock "backend").
 *
 * Why @mswjs/data instead of static arrays: it gives a real query API
 * (`findFirst`/`getAll`/`update`), referential integrity, and mutations — so handlers stay
 * thin and DRY (no scattered `.find`/`.filter`/`reduce`) and the mock behaves like an
 * actual backend (a profile PUT persists; an order owns its items).
 *
 * Modeling notes:
 * - `primaryKey` uses a field that already exists on the API type wherever possible
 *   (`id`, or `month` for revenue) so serialized records match the OpenAPI contract exactly.
 * - `enterpriseKpi` is a singleton with no natural id, so it gets a synthetic `id` that the
 *   handler strips before responding (see handlers.ts).
 * - `order.items` is a real relation (`manyOf`), so querying an order returns its nested
 *   order-item records.
 */
export const db = factory({
  category: {
    id: primaryKey(String),
    title: String,
  },
  product: {
    id: primaryKey(String),
    title: String,
    categoryId: String,
    price: Number,
    stock: Number,
    description: String,
  },
  orderItem: {
    id: primaryKey(String),
    productId: String,
    title: String,
    quantity: Number,
    unitPrice: Number,
  },
  order: {
    id: primaryKey(String),
    status: String,
    createdAt: String,
    totalAmount: Number,
    items: manyOf("orderItem"),
  },
  profile: {
    id: primaryKey(String),
    name: String,
    email: String,
    loyaltyTier: String,
    defaultPaymentMethod: String,
  },
  paymentMethod: {
    id: primaryKey(String),
    type: String,
    label: String,
    isDefault: Boolean,
  },
  enterpriseKpi: {
    // Synthetic id (stripped in the handler) — KPI is a singleton with no natural key.
    id: primaryKey(String),
    activeTenants: Number,
    apiRequestsPerMinute: Number,
    slaPercent: Number,
    unresolvedIncidents: Number,
  },
  revenuePoint: {
    month: primaryKey(String),
    amount: Number,
    region: String,
  },
  integrationStatus: {
    id: primaryKey(String),
    name: String,
    owner: String,
    health: String,
    latencyMs: Number,
  },
  chatbotTranscript: {
    id: primaryKey(String),
    tenant: String,
    createdAt: String,
    tokens: Number,
    channel: String,
  },
});

export const PROFILE_ID = "u-1";
export const KPI_ID = "singleton";
