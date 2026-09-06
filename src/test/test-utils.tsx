import type { ReactElement, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import { createAppQueryClient } from "@/shared/query";

type RenderWithProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** Initial URL for the in-memory router (defaults to "/"). */
  route?: string;
};

/**
 * Renders a component inside the app's real providers: an isolated QueryClient (with
 * retry disabled for fast, deterministic tests) and a Wouter in-memory router so route
 * hooks work without a real browser history.
 */
export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}) {
  const { route = "/", ...renderOptions } = options;

  // retry:false so a mocked error surfaces immediately instead of after backoff retries.
  const queryClient = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });
  const { hook } = memoryLocation({ path: route });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router hook={hook}>{children}</Router>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Wrapper for `renderHook` on data hooks: an isolated, retry-disabled QueryClient. Use
 * when you only need the query context (no router).
 */
export function createQueryWrapper() {
  const queryClient = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

export * from "@testing-library/react";
export { userEvent } from "@testing-library/user-event";
