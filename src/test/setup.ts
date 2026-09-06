import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./server";
import { faultControl } from "@/mocks/faults";
import { seedDb } from "@/mocks/seed";

// One MSW node server for the whole suite. `onUnhandledRequest: "error"` makes any
// un-mocked request a hard failure, so tests can never silently hit the network.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Start every test from a freshly seeded DB with no faults, so mutations (e.g. profile
// updates) and fault injections in one test can't leak into the next.
beforeEach(() => seedDb());

afterEach(() => {
  cleanup();
  server.resetHandlers();
  faultControl.reset();
});

afterAll(() => server.close());
