import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: "dist/bundle-report.html",
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ]
      : []),
  ],
  build: {
    // 'hidden' emits source maps but strips the //# sourceMappingURL comment, so the maps
    // are NOT referenced by (or served alongside) the shipped bundles — browsers won't
    // fetch them and the public can't trivially reconstruct source. In CI you upload the
    // generated .map files to an error tracker (Sentry/Datadog) for server-side
    // symbolication. `true` would publish full source; 'hidden' keeps stack traces
    // debuggable without exposing source.
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Loaded at first paint: React, the router, and the data layer (the root
          // QueryClientProvider needs react-query immediately). openapi-fetch is tiny and
          // stays with the entry chunk.
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/wouter") ||
            id.includes("node_modules/@tanstack/")
          ) {
            return "vendor-core";
          }

          if (id.includes("node_modules/@xyflow/")) {
            return "vendor-flow";
          }

          // NOTE: chart.js is deliberately NOT grouped here. It is loaded via a dynamic
          // import("chart.js/auto") in the Enterprise analytics page. Assigning it to a
          // manualChunk that EnterpriseModule already imports statically (via the libs
          // below) would collapse that dynamic import into an eager one — defeating the
          // lazy-load. Left unassigned, chart.js gets its own async chunk that only
          // downloads when the analytics tab mounts.
          if (
            id.includes("node_modules/lodash-es") ||
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/zod")
          ) {
            return "vendor-analytics";
          }
        },
      },
    },
  },
});
