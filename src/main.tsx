import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/shared/query";
import { NotificationCenter } from "@/shared/notifications";
import { ErrorBoundary } from "@/shared/errors";
import "./index.css";
import App from "./App.tsx";

async function enableMocking() {
  const shouldEnableMocks = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true";

  if (!shouldEnableMocks) {
    return;
  }

  const { worker } = await import("./mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass" });
}

await enableMocking();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Root safety net: catches anything the route-level boundary can't (e.g. the app
          shell itself). NotificationCenter stays outside so toasts still render. */}
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <NotificationCenter />
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  </StrictMode>
);
