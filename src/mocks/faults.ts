import { HttpResponse, type HttpResponseResolver } from "msw";
import { resetDb, seedDb } from "./seed";

/**
 * Fault injection for the mock backend.
 *
 * Tests (especially Playwright e2e) need to drive error, empty, and network-failure paths
 * deterministically. Rather than duplicate error branches in every handler, faults are held
 * in one map keyed by OpenAPI `operationId`, and every handler is wrapped with `withFaults`
 * — a single higher-order resolver that short-circuits to the configured failure. This is
 * the DRY seam: all failure behavior lives here, handlers only describe the happy path.
 */

export type FaultKind = "error" | "empty" | "network";
type Fault = { kind: FaultKind; status?: number };

const faults = new Map<string, Fault>();

export function getFault(operationId: string): Fault | undefined {
  return faults.get(operationId);
}

/** True when a list endpoint should return an empty collection. */
export function isEmpty(operationId: string): boolean {
  return faults.get(operationId)?.kind === "empty";
}

/**
 * Wraps a handler resolver, applying any configured fault for `operationId` first:
 * - `network` → a transport-level failure (rejected fetch),
 * - `error`   → a JSON error body with the configured status (default 500),
 * - `empty`   → left to the resolver, which checks `isEmpty()` and returns `[]`.
 */
export function withFaults(operationId: string, resolver: HttpResponseResolver): HttpResponseResolver {
  return async (info) => {
    const fault = faults.get(operationId);

    if (fault?.kind === "network") {
      return HttpResponse.error();
    }
    if (fault?.kind === "error") {
      return HttpResponse.json(
        { message: `Simulated failure for ${operationId}`, code: "SIMULATED_FAULT" },
        { status: fault.status ?? 500 }
      );
    }

    return resolver(info);
  };
}

/** Programmatic control surface. Also exposed on `window.__mock` for Playwright. */
export const faultControl = {
  fail(operationId: string, status = 500) {
    faults.set(operationId, { kind: "error", status });
  },
  empty(operationId: string) {
    faults.set(operationId, { kind: "empty" });
  },
  network(operationId: string) {
    faults.set(operationId, { kind: "network" });
  },
  clear(operationId: string) {
    faults.delete(operationId);
  },
  /** Clears all faults AND reseeds the DB — a clean slate for the next test. */
  reset() {
    faults.clear();
    seedDb();
  },
  /** Reseed only (undo mutations) without touching faults. */
  reseed() {
    resetDb();
    seedDb();
  },
};

export type FaultControl = typeof faultControl;
