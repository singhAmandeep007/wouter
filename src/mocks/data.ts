import type { Category, Order, PaymentMethod, Product, UserProfile } from "../shared/api/types";

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
