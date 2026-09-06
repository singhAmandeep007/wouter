import { type UseMutationOptions, type UseMutationResult, useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/shared/api/http/errors";

/**
 * The global mutation wrapper. A thin, typed passthrough over `useMutation` that pins the
 * error type to `ApiError`. Success and error toasts are emitted centrally by the
 * `MutationCache` callbacks (queryClient.ts) based on the mutation's `meta`
 * (`successMessage` / `errorMessage`), so callers stay declarative:
 *
 *   useAppMutation({ mutationFn, meta: { successMessage: "Saved" }, onSuccess: invalidate })
 */
export function useAppMutation<TData, TVariables = void, TContext = unknown>(
  options: UseMutationOptions<TData, ApiError, TVariables, TContext>
): UseMutationResult<TData, ApiError, TVariables, TContext> {
  return useMutation(options);
}
