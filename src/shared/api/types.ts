export type UserProfile = {
  id: string;
  name: string;
  email: string;
  loyaltyTier: "bronze" | "silver" | "gold";
  defaultPaymentMethod: string;
};

export type Product = {
  id: string;
  title: string;
  categoryId: string;
  price: number;
  stock: number;
  description: string;
};

export type Category = {
  id: string;
  title: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  status: "created" | "paid" | "shipped" | "delivered";
  createdAt: string;
  totalAmount: number;
  items: OrderItem[];
};

export type DashboardSummary = {
  profile: UserProfile;
  openOrders: number;
  revenueMonth: number;
  lowStockProducts: Product[];
};

export type PaymentMethod = {
  id: string;
  type: "card" | "upi" | "wallet";
  label: string;
  isDefault: boolean;
};
