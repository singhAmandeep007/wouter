import { queryOptions } from "@tanstack/react-query";
import { paymentMethodKeys } from "./paymentMethod.keys";
import { paymentMethodService } from "./paymentMethod.service";

export const paymentMethodQueries = {
  list: () =>
    queryOptions({
      queryKey: paymentMethodKeys.lists(),
      queryFn: () => paymentMethodService.list(),
    }),
};
