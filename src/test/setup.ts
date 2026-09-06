import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./server";

// One MSW node server for the whole suite. `onUnhandledRequest: "error"` makes any
// un-mocked request a hard failure, so tests can never silently hit the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  // Drop any per-test handler overrides so tests stay isolated.
  server.resetHandlers();
});

afterAll(() => server.close());
