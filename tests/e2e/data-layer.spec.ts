import { expect, test } from "@playwright/test";

/**
 * Exercises the TanStack Query data layer end-to-end: query-backed rendering, the
 * mutation write path, and the global notification wiring (MutationCache meta -> toast).
 */
test.describe("Data layer: queries, mutation, and notifications", () => {
  test("dashboard renders data fetched through the query hook", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-module")).toBeVisible();
    // Content only appears once the useDashboardSummary query resolves.
    await expect(page.getByTestId("dashboard-module")).toContainText("Open orders");
  });

  test("updating the profile fires a global success notification", async ({ page }) => {
    await page.goto("/settings/profile");

    const nameInput = page.getByTestId("profile-name-input");
    await expect(nameInput).toBeVisible();
    await nameInput.fill("Updated Reference Name");

    await page.getByTestId("profile-save-button").click();

    // The success toast is emitted centrally by the MutationCache callback from meta.
    const toast = page.getByTestId("notification-success");
    await expect(toast).toBeVisible();
    await expect(toast).toContainText("Profile updated");
  });

  test("shared KPI query hydrates both enterprise dashboard and contracts tabs", async ({ page }) => {
    await page.goto("/enterprise/dashboard");
    await expect(page.getByTestId("enterprise-dashboard-page")).toBeVisible();

    // Contracts reuses the same cached KPI query and validates it via zod in the service.
    await page.getByTestId("enterprise-tab-contracts").click();
    await expect(page.getByTestId("enterprise-contracts-page")).toContainText("Contract valid");
  });
});
