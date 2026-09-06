import { setupServer } from "msw/node";
import { handlers } from "@/mocks/handlers";

/**
 * Shared MSW server for Node/Vitest. Reuses the exact same handlers the browser app uses,
 * so tests exercise the real request/response contract. Import this in individual test
 * files to add per-test overrides via `server.use(...)` (e.g. to force an error response).
 */
export const server = setupServer(...handlers);
