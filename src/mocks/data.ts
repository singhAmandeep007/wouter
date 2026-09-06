import type { components } from "@/shared/api/generated/schema";

// Mock records are typed against the generated OpenAPI schemas — same single source of
// truth the app consumes — so the mocks can never drift from the contract.
type Category = components["schemas"]["Category"];
type ChatbotTranscript = components["schemas"]["ChatbotTranscript"];
type EnterpriseKpi = components["schemas"]["EnterpriseKpi"];
type IntegrationStatus = components["schemas"]["IntegrationStatus"];
type Order = components["schemas"]["Order"];
type PaymentMethod = components["schemas"]["PaymentMethod"];
type Product = components["schemas"]["Product"];
type RevenuePoint = components["schemas"]["RevenuePoint"];
type UserProfile = components["schemas"]["UserProfile"];

export const categories: Category[] = [
  { id: "phones", title: "Phones" },
  { id: "audio", title: "Audio" },
  { id: "laptops", title: "Laptops" },
];

export const products: Product[] = [
  {
    id: "p-100",
    title: "Nova X Phone",
    categoryId: "phones",
    price: 699,
    stock: 5,
    description: "Flagship phone with OLED display and all-day battery.",
  },
  {
    id: "p-101",
    title: "Nova Lite Phone",
    categoryId: "phones",
    price: 399,
    stock: 25,
    description: "Balanced mid-range phone for everyday use.",
  },
  {
    id: "p-200",
    title: "Pulse Noise-Canceling Headphones",
    categoryId: "audio",
    price: 249,
    stock: 8,
    description: "Wireless headphones with active noise cancellation.",
  },
  {
    id: "p-300",
    title: "Atlas 14 Laptop",
    categoryId: "laptops",
    price: 1199,
    stock: 2,
    description: "Lightweight 14-inch laptop designed for productivity.",
  },
];

export const profile: UserProfile = {
  id: "u-1",
  name: "Aarav Singh",
  email: "aarav@example.com",
  loyaltyTier: "gold",
  defaultPaymentMethod: "pm-2",
};

export const paymentMethods: PaymentMethod[] = [
  { id: "pm-1", type: "card", label: "Visa **** 8412", isDefault: false },
  { id: "pm-2", type: "upi", label: "aarav@upi", isDefault: true },
  { id: "pm-3", type: "wallet", label: "FastWallet", isDefault: false },
];

export const orders: Order[] = [
  {
    id: "o-5001",
    status: "shipped",
    createdAt: "2026-01-18T08:30:00.000Z",
    totalAmount: 948,
    items: [
      {
        id: "oi-1",
        productId: "p-100",
        title: "Nova X Phone",
        quantity: 1,
        unitPrice: 699,
      },
      {
        id: "oi-2",
        productId: "p-200",
        title: "Pulse Noise-Canceling Headphones",
        quantity: 1,
        unitPrice: 249,
      },
    ],
  },
  {
    id: "o-5002",
    status: "delivered",
    createdAt: "2026-02-02T10:10:00.000Z",
    totalAmount: 1199,
    items: [
      {
        id: "oi-3",
        productId: "p-300",
        title: "Atlas 14 Laptop",
        quantity: 1,
        unitPrice: 1199,
      },
    ],
  },
];

export const enterpriseKpi: EnterpriseKpi = {
  activeTenants: 148,
  apiRequestsPerMinute: 18420,
  slaPercent: 99.94,
  unresolvedIncidents: 3,
};

export const enterpriseRevenue: RevenuePoint[] = [
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

export const integrationStatuses: IntegrationStatus[] = [
  { id: "int-1", name: "Payments Gateway", owner: "FinOps", health: "healthy", latencyMs: 92 },
  { id: "int-2", name: "CRM Sync", owner: "Growth", health: "degraded", latencyMs: 244 },
  { id: "int-3", name: "Inventory Bus", owner: "Supply", health: "healthy", latencyMs: 135 },
  { id: "int-4", name: "Tax Engine", owner: "Finance", health: "down", latencyMs: 0 },
  { id: "int-5", name: "Fraud Detection", owner: "Risk", health: "healthy", latencyMs: 101 },
];

export const chatbotTranscripts: ChatbotTranscript[] = [
  { id: "cb-1", tenant: "northwind", createdAt: "2026-02-25T11:30:00.000Z", tokens: 1532, channel: "web" },
  { id: "cb-2", tenant: "globex", createdAt: "2026-02-25T12:10:00.000Z", tokens: 987, channel: "slack" },
  { id: "cb-3", tenant: "initech", createdAt: "2026-02-25T14:42:00.000Z", tokens: 2210, channel: "teams" },
  { id: "cb-4", tenant: "northwind", createdAt: "2026-02-26T09:12:00.000Z", tokens: 1144, channel: "web" },
  { id: "cb-5", tenant: "umbrella", createdAt: "2026-02-26T16:58:00.000Z", tokens: 1750, channel: "slack" },
  { id: "cb-6", tenant: "globex", createdAt: "2026-02-27T08:16:00.000Z", tokens: 1436, channel: "web" },
];
