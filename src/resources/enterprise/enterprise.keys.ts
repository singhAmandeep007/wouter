/**
 * The enterprise module owns several distinct endpoints, so its key factory is hand-rolled
 * with one branch per sub-resource (all under the shared `["enterprise", ...]` prefix,
 * so a single `invalidateQueries({ queryKey: enterpriseKeys.all })` clears them together).
 */
const scope = "enterprise" as const;

export const enterpriseKeys = {
  all: [scope] as const,
  kpi: () => [scope, "kpi"] as const,
  revenue: () => [scope, "revenue"] as const,
  integrations: () => [scope, "integrations"] as const,
  transcripts: () => [scope, "transcripts"] as const,
};
