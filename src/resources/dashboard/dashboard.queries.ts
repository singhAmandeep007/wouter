import { queryOptions } from "@tanstack/react-query";
import { dashboardKeys } from "./dashboard.keys";
import { dashboardService } from "./dashboard.service";

export const dashboardQueries = {
  // A singleton resource: the scope root key is the whole identity.
  summary: () =>
    queryOptions({
      queryKey: dashboardKeys.all,
      queryFn: () => dashboardService.getSummary(),
      meta: { errorMessage: "Failed to load dashboard" },
    }),
};
