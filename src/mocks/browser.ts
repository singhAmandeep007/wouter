import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { seedDb } from "./seed";
import { faultControl } from "./faults";

// Seed the DB before the worker starts serving requests.
seedDb();

export const worker = setupWorker(...handlers);

/**
 * Expose a control surface for end-to-end tests. Playwright drives error/empty/network
 * scenarios by calling these via `page.evaluate(() => window.__mock.fail(...))`. Only
 * serializable args (strings/numbers) cross the boundary, so no function marshalling.
 *
 * This module is imported only when mocking is enabled (see main.tsx), so `window.__mock`
 * never exists in a real production build.
 */
if (typeof window !== "undefined") {
  window.__mock = {
    fail: (operationId, status) => faultControl.fail(operationId, status),
    empty: (operationId) => faultControl.empty(operationId),
    network: (operationId) => faultControl.network(operationId),
    clear: (operationId) => faultControl.clear(operationId),
    reset: () => faultControl.reset(),
  };
}
