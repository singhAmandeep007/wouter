import type { components } from "@/shared/api/generated/schema";

/**
 * Domain types are narrowed from the generated OpenAPI components — the spec stays the
 * single source of truth, and components import stable names (`Product`) instead of
 * reaching into `components["schemas"][...]` everywhere.
 */
export type Product = components["schemas"]["Product"];
