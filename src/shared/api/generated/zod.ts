// @ts-nocheck
import type * as __TypedOpenapi from "./zod.types.js";

  import { z } from "zod";

// <Schemas>
export type UserProfile = __TypedOpenapi.Schemas.UserProfile;
export const UserProfile = z.object({ id: z.string(), name: z.string(), email: z.email(), loyaltyTier: z.enum(["bronze", "silver", "gold"]), defaultPaymentMethod: z.string() }).catchall(z.unknown());

export type UpdateUserProfileInput = __TypedOpenapi.Schemas.UpdateUserProfileInput;
export const UpdateUserProfileInput = z.object({ name: z.string(), email: z.email(), defaultPaymentMethod: z.string() }).partial().catchall(z.unknown());

export type Product = __TypedOpenapi.Schemas.Product;
export const Product = z.object({ id: z.string(), title: z.string(), categoryId: z.string(), price: z.number().min(0), stock: z.number().int().min(0), description: z.string() }).catchall(z.unknown());

export type Category = __TypedOpenapi.Schemas.Category;
export const Category = z.object({ id: z.string(), title: z.string() }).catchall(z.unknown());

export type OrderItem = __TypedOpenapi.Schemas.OrderItem;
export const OrderItem = z.object({ id: z.string(), productId: z.string(), title: z.string(), quantity: z.number().int(), unitPrice: z.number() }).catchall(z.unknown());

export type Order = __TypedOpenapi.Schemas.Order;
export const Order = z.object({ id: z.string(), status: z.enum(["created", "paid", "shipped", "delivered"]), createdAt: z.iso.datetime(), totalAmount: z.number(), items: z.array(OrderItem) }).catchall(z.unknown());

export type DashboardSummary = __TypedOpenapi.Schemas.DashboardSummary;
export const DashboardSummary = z.object({ profile: UserProfile, openOrders: z.number().int(), revenueMonth: z.number(), lowStockProducts: z.array(Product) }).catchall(z.unknown());

export type PaymentMethod = __TypedOpenapi.Schemas.PaymentMethod;
export const PaymentMethod = z.object({ id: z.string(), type: z.enum(["card", "upi", "wallet"]), label: z.string(), isDefault: z.boolean() }).catchall(z.unknown());

export type EnterpriseKpi = __TypedOpenapi.Schemas.EnterpriseKpi;
export const EnterpriseKpi = z.object({ activeTenants: z.number().int().min(0), apiRequestsPerMinute: z.number().int().min(0), slaPercent: z.number().min(0).max(100), unresolvedIncidents: z.number().int().min(0) }).catchall(z.unknown());

export type RevenuePoint = __TypedOpenapi.Schemas.RevenuePoint;
export const RevenuePoint = z.object({ month: z.string(), amount: z.number(), region: z.enum(["apac", "emea", "amer"]) }).catchall(z.unknown());

export type IntegrationStatus = __TypedOpenapi.Schemas.IntegrationStatus;
export const IntegrationStatus = z.object({ id: z.string(), name: z.string(), owner: z.string(), health: z.enum(["healthy", "degraded", "down"]), latencyMs: z.number().int() }).catchall(z.unknown());

export type ChatbotTranscript = __TypedOpenapi.Schemas.ChatbotTranscript;
export const ChatbotTranscript = z.object({ id: z.string(), tenant: z.string(), createdAt: z.iso.datetime(), tokens: z.number().int(), channel: z.enum(["web", "slack", "teams"]) }).catchall(z.unknown());

export type ApiError = __TypedOpenapi.Schemas.ApiError;
export const ApiError = z.object({ message: z.string(), code: z.string().optional() }).catchall(z.unknown());

// </Schemas>

  
  
  