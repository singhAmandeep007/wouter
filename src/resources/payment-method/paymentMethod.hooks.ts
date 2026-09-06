import { type AppQueryOverrides, useAppQuery } from "@/shared/query";
import { paymentMethodQueries } from "./paymentMethod.queries";
import type { PaymentMethod } from "./paymentMethod.types";

export function usePaymentMethods(overrides?: AppQueryOverrides<PaymentMethod[]>) {
  return useAppQuery(paymentMethodQueries.list(), overrides);
}
