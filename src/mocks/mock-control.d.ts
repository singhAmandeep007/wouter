/**
 * Types for the e2e mock control surface exposed on `window` in mock/dev builds only
 * (see browser.ts). `operationId` values match the OpenAPI spec's operation ids.
 */
export type MockControl = {
  /** Make an endpoint respond with an error status (default 500). */
  fail: (operationId: string, status?: number) => void;
  /** Make a list endpoint return an empty collection. */
  empty: (operationId: string) => void;
  /** Make an endpoint fail at the transport level (rejected fetch). */
  network: (operationId: string) => void;
  /** Clear the fault for a single endpoint. */
  clear: (operationId: string) => void;
  /** Clear all faults and reseed the DB (clean slate). */
  reset: () => void;
};

declare global {
  interface Window {
    __mock?: MockControl;
  }
}

export {};
