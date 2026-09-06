import { KPI_ID, PROFILE_ID, db } from "./db";

/**
 * Seeds the mock database. Idempotent: clears every model first so it can be re-run (e.g.
 * a test that wants a clean slate). This is the single source of mock records — what used
 * to live as static arrays in the old data.ts now lives here as `create()` calls.
 */
export function seedDb() {
  resetDb();

  db.category.create({ id: "phones", title: "Phones" });
  db.category.create({ id: "audio", title: "Audio" });
  db.category.create({ id: "laptops", title: "Laptops" });

  db.product.create({
    id: "p-100",
    title: "Nova X Phone",
    categoryId: "phones",
    price: 699,
    stock: 5,
    description: "Flagship phone with OLED display and all-day battery.",
  });
  db.product.create({
    id: "p-101",
    title: "Nova Lite Phone",
    categoryId: "phones",
    price: 399,
    stock: 25,
    description: "Balanced mid-range phone for everyday use.",
  });
  db.product.create({
    id: "p-200",
    title: "Pulse Noise-Canceling Headphones",
    categoryId: "audio",
    price: 249,
    stock: 8,
    description: "Wireless headphones with active noise cancellation.",
  });
  db.product.create({
    id: "p-300",
    title: "Atlas 14 Laptop",
    categoryId: "laptops",
    price: 1199,
    stock: 2,
    description: "Lightweight 14-inch laptop designed for productivity.",
  });

  db.profile.create({
    id: PROFILE_ID,
    name: "Aarav Singh",
    email: "aarav@example.com",
    loyaltyTier: "gold",
    defaultPaymentMethod: "pm-2",
  });

  db.paymentMethod.create({ id: "pm-1", type: "card", label: "Visa **** 8412", isDefault: false });
  db.paymentMethod.create({ id: "pm-2", type: "upi", label: "aarav@upi", isDefault: true });
  db.paymentMethod.create({ id: "pm-3", type: "wallet", label: "FastWallet", isDefault: false });

  // Order items are created first, then referenced by the order relation (manyOf).
  const oi1 = db.orderItem.create({ id: "oi-1", productId: "p-100", title: "Nova X Phone", quantity: 1, unitPrice: 699 });
  const oi2 = db.orderItem.create({
    id: "oi-2",
    productId: "p-200",
    title: "Pulse Noise-Canceling Headphones",
    quantity: 1,
    unitPrice: 249,
  });
  const oi3 = db.orderItem.create({
    id: "oi-3",
    productId: "p-300",
    title: "Atlas 14 Laptop",
    quantity: 1,
    unitPrice: 1199,
  });

  db.order.create({
    id: "o-5001",
    status: "shipped",
    createdAt: "2026-01-18T08:30:00.000Z",
    totalAmount: 948,
    items: [oi1, oi2],
  });
  db.order.create({
    id: "o-5002",
    status: "delivered",
    createdAt: "2026-02-02T10:10:00.000Z",
    totalAmount: 1199,
    items: [oi3],
  });

  db.enterpriseKpi.create({
    id: KPI_ID,
    activeTenants: 148,
    apiRequestsPerMinute: 18420,
    slaPercent: 99.94,
    unresolvedIncidents: 3,
  });

  const revenue: Array<{ month: string; amount: number; region: string }> = [
    { month: "2025-03", amount: 318000, region: "apac" },
    { month: "2025-04", amount: 332000, region: "apac" },
    { month: "2025-05", amount: 349000, region: "apac" },
    { month: "2025-06", amount: 361000, region: "emea" },
    { month: "2025-07", amount: 382000, region: "emea" },
    { month: "2025-08", amount: 401000, region: "emea" },
    { month: "2025-09", amount: 425000, region: "amer" },
    { month: "2025-10", amount: 448000, region: "amer" },
    { month: "2025-11", amount: 462000, region: "amer" },
    { month: "2025-12", amount: 483000, region: "apac" },
    { month: "2026-01", amount: 496000, region: "apac" },
    { month: "2026-02", amount: 512000, region: "apac" },
  ];
  revenue.forEach((point) => db.revenuePoint.create(point));

  db.integrationStatus.create({ id: "int-1", name: "Payments Gateway", owner: "FinOps", health: "healthy", latencyMs: 92 });
  db.integrationStatus.create({ id: "int-2", name: "CRM Sync", owner: "Growth", health: "degraded", latencyMs: 244 });
  db.integrationStatus.create({ id: "int-3", name: "Inventory Bus", owner: "Supply", health: "healthy", latencyMs: 135 });
  db.integrationStatus.create({ id: "int-4", name: "Tax Engine", owner: "Finance", health: "down", latencyMs: 0 });
  db.integrationStatus.create({ id: "int-5", name: "Fraud Detection", owner: "Risk", health: "healthy", latencyMs: 101 });

  db.chatbotTranscript.create({ id: "cb-1", tenant: "northwind", createdAt: "2026-02-25T11:30:00.000Z", tokens: 1532, channel: "web" });
  db.chatbotTranscript.create({ id: "cb-2", tenant: "globex", createdAt: "2026-02-25T12:10:00.000Z", tokens: 987, channel: "slack" });
  db.chatbotTranscript.create({ id: "cb-3", tenant: "initech", createdAt: "2026-02-25T14:42:00.000Z", tokens: 2210, channel: "teams" });
  db.chatbotTranscript.create({ id: "cb-4", tenant: "northwind", createdAt: "2026-02-26T09:12:00.000Z", tokens: 1144, channel: "web" });
  db.chatbotTranscript.create({ id: "cb-5", tenant: "umbrella", createdAt: "2026-02-26T16:58:00.000Z", tokens: 1750, channel: "slack" });
  db.chatbotTranscript.create({ id: "cb-6", tenant: "globex", createdAt: "2026-02-27T08:16:00.000Z", tokens: 1436, channel: "web" });
}

/** Empties every model. Exposed so tests/control can reset to a known-clean state. */
export function resetDb() {
  db.order.deleteMany({ where: {} });
  db.orderItem.deleteMany({ where: {} });
  db.product.deleteMany({ where: {} });
  db.category.deleteMany({ where: {} });
  db.profile.deleteMany({ where: {} });
  db.paymentMethod.deleteMany({ where: {} });
  db.enterpriseKpi.deleteMany({ where: {} });
  db.revenuePoint.deleteMany({ where: {} });
  db.integrationStatus.deleteMany({ where: {} });
  db.chatbotTranscript.deleteMany({ where: {} });
}
