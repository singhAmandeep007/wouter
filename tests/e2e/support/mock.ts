import type { Page } from "@playwright/test";

/**
 * Playwright helpers for driving the app's MSW mock backend (see src/mocks/faults.ts).
 *
 * Strategy: boot the app on a route that fetches NO data (`/history`), which registers
 * `window.__mock`, then set a fault and navigate to the target route via an in-app link.
 * Because it's a single-page navigation (no reload), the fault stays active and applies to
 * the target route's FIRST fetch — which is what surfaces the error/empty state.
 *
 * Each Playwright test gets a fresh page (isolated context), so faults never leak between
 * tests and no explicit reset is needed.
 */

type MockControl = {
  fail: (operationId: string, status?: number) => void;
  empty: (operationId: string) => void;
  network: (operationId: string) => void;
  clear: (operationId: string) => void;
  reset: () => void;
};

/** Boots the app on a data-free route and waits until the mock control surface exists. */
export async function bootApp(page: Page) {
  await page.goto("/history");
  await page.waitForFunction(() => Boolean((window as unknown as { __mock?: unknown }).__mock));
}

export async function mockFail(page: Page, operationId: string, status = 500) {
  await page.evaluate(
    ([op, code]) => (window as unknown as { __mock?: MockControl }).__mock?.fail(op as string, code as number),
    [operationId, status] as const
  );
}

export async function mockEmpty(page: Page, operationId: string) {
  await page.evaluate((op) => (window as unknown as { __mock?: MockControl }).__mock?.empty(op), operationId);
}

export async function mockNetwork(page: Page, operationId: string) {
  await page.evaluate((op) => (window as unknown as { __mock?: MockControl }).__mock?.network(op), operationId);
}
