import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Standalone Vitest config (kept separate from vite.config.ts so the app build's
// manualChunks / analyzer plugin never leak into the test runner). We only need the
// React plugin + the `@` alias here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost:3000" },
    },
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // The app uses a relative baseUrl (""), which the browser resolves against
    // location.origin. In Node/jsdom, openapi-fetch needs an absolute base. MSW resolves
    // its relative handler paths against jsdom's location, so the base URL MUST share
    // that same origin (http://localhost:3000) or requests won't match any handler.
    env: {
      VITE_API_BASE_URL: "http://localhost:3000",
    },
    // Only run unit/component tests under src/. Playwright e2e specs live in tests/e2e
    // and must NOT be picked up by Vitest.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/shared/**/*.{ts,tsx}", "src/resources/**/*.{ts,tsx}"],
      exclude: ["src/shared/api/generated/**", "**/index.ts", "**/*.d.ts", "**/*.{test,spec}.{ts,tsx}"],
    },
  },
});
