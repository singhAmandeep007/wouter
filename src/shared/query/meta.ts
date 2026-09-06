import { ApiError } from "@/shared/api/http/errors";

/**
 * Typed `meta` for queries. `meta` is the officially-blessed channel for passing
 * declarative hints to the global cache callbacks (in queryClient.ts). Here we use it to
 * customize or silence the automatic error toast on a per-query basis.
 */
export type AppQueryMeta = {
  /** Override the toast text shown when this query errors. */
  errorMessage?: string;
  /** Opt this query out of the automatic error toast. */
  suppressErrorNotification?: boolean;
};

/**
 * Typed `meta` for mutations. Mutations additionally surface a success toast, so the
 * happy-path message is declared here rather than wired by hand in each component.
 */
export type AppMutationMeta = {
  successMessage?: string;
  errorMessage?: string;
  suppressErrorNotification?: boolean;
  suppressSuccessNotification?: boolean;
};

/**
 * Register app-wide types with TanStack Query. `defaultError: ApiError` makes every
 * `error` in the app inferred as our single normalized `ApiError` (no more `unknown`),
 * and the `*Meta` registrations make `meta` strongly typed everywhere it is set or read.
 *
 * NOTE: these must be object *type aliases* (not interfaces) so they satisfy the
 * `Record<string, unknown>` constraint via TypeScript's implicit index signature.
 */
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: ApiError;
    queryMeta: AppQueryMeta;
    mutationMeta: AppMutationMeta;
  }
}
