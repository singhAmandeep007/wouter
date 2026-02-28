import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vite.dev/config/
export default defineConfig({
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
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // matches paths containing node_modules/react or node_modules/wouter
          if (id.includes("node_modules/react") || id.includes("node_modules/wouter")) {
            return "vendor-core";
          }

          if (
            id.includes("node_modules/@xyflow/") ||
            id.includes("node_modules/reactflow") ||
            id.includes("node_modules/d3-")
          ) {
            return "vendor-flow";
          }

          if (
            id.includes("node_modules/chart.js") ||
            id.includes("node_modules/lodash-es") ||
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/zod") ||
            id.includes("node_modules/axios")
          ) {
            return "vendor-analytics";
          }
        },
      },
    },
  },
});
