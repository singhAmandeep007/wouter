import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Router } from "wouter";
import { queryClient } from "@/shared/query";
import { NotificationCenter } from "@/shared/notifications";
import { ErrorBoundary } from "@/shared/errors";
import "./index.css";
import App from "./App.tsx";

// The app's public base path, minus the trailing slash: "" for local dev, "/wouter" on
// GitHub Pages. Used both for wouter routing and for locating the MSW service worker.
const basePath = import.meta.env.BASE_URL.replace(/\/+$/, "");

async function enableMocking() {
  const shouldEnableMocks = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MSW === "true";

  if (!shouldEnableMocks) {
    return;
  }

  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    // The worker file is served from the base path; its scope is that subpath, which is why
    // API requests are kept under the base (see http/client.ts).
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

await enableMocking();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* `base` lets every wouter Link/Route resolve under the deploy subpath. */}
      <Router base={basePath}>
        {/* Root safety net: catches anything the route-level boundary can't (e.g. the app
            shell itself). NotificationCenter stays outside so toasts still render. */}
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Router>
      <NotificationCenter />
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  </StrictMode>
);
