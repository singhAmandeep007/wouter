import { expect, test } from "@playwright/test";
import { bootApp, mockEmpty, mockFail } from "./support/mock";

/**
 * Error/empty-path coverage driven through the real MSW mock backend via window.__mock.
 * Each test boots on /history (no fetch), injects a fault, then navigates IN-APP (SPA, no
 * reload) so the fault persists and applies to the target route's first fetch.
 * (A full page.goto would reload the app and reset the fault.)
 *
 * Assertions target the global error toast (notification-error), which uniquely and
 * reliably proves the query-error → MutationCache/QueryCache → notification path fired.
 */
test.describe("Error and empty paths (MSW fault injection)", () => {
  test("dashboard failure surfaces the global error toast", async ({ page }) => {
    await bootApp(page);
    await mockFail(page, "getDashboardSummary", 500);

    await page.getByTestId("nav-dashboard").click();

    await expect(page.getByTestId("notification-error")).toContainText("Failed to load dashboard", { timeout: 12000 });
  });

  test("catalog product fetch failure surfaces the error toast", async ({ page }) => {
    await bootApp(page);
    await mockFail(page, "getProductById", 500);

    await page.getByTestId("nav-catalog").click();
    await expect(page.getByTestId("catalog-home-page")).toBeVisible();
    await page.locator('a[href^="/catalog/product/"]').first().click();

    await expect(page.getByTestId("notification-error")).toContainText("Failed to load product", { timeout: 12000 });
  });

  test("unknown product id (404) surfaces the error toast (no fault needed)", async ({ page }) => {
    await page.goto("/catalog/product/does-not-exist");
    await expect(page.getByTestId("notification-error")).toContainText("Failed to load product", { timeout: 12000 });
  });

  test("enterprise KPI failure keeps the dashboard in its loading state", async ({ page }) => {
    await bootApp(page);
    await mockFail(page, "getEnterpriseKpi", 500);

    await page.getByTestId("nav-enterprise").click();

    await expect(page.getByTestId("enterprise-dashboard-loading")).toBeVisible();
    await expect(page.getByTestId("notification-error")).toContainText("Failed to load enterprise KPIs", { timeout: 12000 });
  });

  test("empty product list renders the catalog with no featured products", async ({ page }) => {
    await bootApp(page);
    await mockEmpty(page, "listProducts");

    await page.getByTestId("nav-catalog").click();

    const home = page.getByTestId("catalog-home-page");
    await expect(home).toBeVisible();
    // Scoped to the home section (the module also renders a hardcoded route-hint link).
    await expect(home.locator('a[href^="/catalog/product/"]')).toHaveCount(0);
  });

  test("profile update failure surfaces an error toast (mutation path)", async ({ page }) => {
    await bootApp(page);
    await mockFail(page, "updateUserProfile", 500);

    await page.getByTestId("nav-settings").click();
    await page.getByTestId("settings-tab-profile").click();
    await page.getByTestId("profile-name-input").fill("Broken Update");
    await page.getByTestId("profile-save-button").click();

    await expect(page.getByTestId("notification-error")).toContainText("Failed to update profile", { timeout: 12000 });
  });

  test("profile update success surfaces a success toast (happy mutation path)", async ({ page }) => {
    await bootApp(page);

    await page.getByTestId("nav-settings").click();
    await page.getByTestId("settings-tab-profile").click();
    await page.getByTestId("profile-name-input").fill("Happy Update");
    await page.getByTestId("profile-save-button").click();

    await expect(page.getByTestId("notification-success")).toContainText("Profile updated");
  });
});
