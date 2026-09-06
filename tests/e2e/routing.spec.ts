import { expect, test } from "@playwright/test";

test.describe("Wouter routing, active links, and module loading", () => {
  test("defaults to dashboard and highlights dashboard nav", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/dashboard");
    await expect(page.getByTestId("dashboard-module")).toBeVisible();
    await expect(page.getByTestId("nav-dashboard")).toHaveAttribute("aria-current", "page");
  });

  test("catalog route-hint tabs highlight exact active route", async ({ page }) => {
    await page.goto("/catalog/product/p-100");
    await expect(page.getByTestId("catalog-product-page")).toBeVisible();
    await expect(page.getByTestId("catalog-hint-catalog-product-p-100")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("catalog-hint-catalog")).not.toHaveAttribute("aria-current", "page");
  });

  test("settings deep order item route highlights only deep tab", async ({ page }) => {
    await page.goto("/settings/orders/o-5001/items/oi-1");
    await expect(page.getByTestId("order-item-details-page")).toBeVisible();
    await expect(page.getByTestId("orders-tab-item")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("orders-tab-list")).not.toHaveAttribute("aria-current", "page");
  });

  test("admin parent route redirects to API and active tab is API", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/api/);
    await expect(page.getByTestId("admin-api-page")).toBeVisible();
    await expect(page.getByTestId("nav-admin")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("admin-tab-api")).toHaveAttribute("aria-current", "page");
  });

  test("admin api and chatbot pages load with corresponding tab active", async ({ page }) => {
    await page.goto("/admin/api");
    await expect(page.getByTestId("admin-api-page")).toBeVisible();
    await expect(page.getByTestId("admin-tab-api")).toHaveAttribute("aria-current", "page");

    await page.goto("/admin/chatbot");
    await expect(page.getByTestId("admin-chatbot-page")).toBeVisible();
    await expect(page.getByTestId("admin-tab-chatbot")).toHaveAttribute("aria-current", "page");
  });

  test("module-level and global not-found routes render correctly", async ({ page }) => {
    await page.goto("/settings/unknown");
    await expect(page.getByTestId("settings-not-found")).toBeVisible();

    await page.goto("/does-not-exist");
    await expect(page.getByTestId("global-not-found")).toBeVisible();
  });

  test("history demo deep navigation button lands on order item page", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByTestId("history-module")).toBeVisible();
    await page.getByTestId("history-push-deep").click();
    await expect(page).toHaveURL(/\/settings\/orders\/o-5001\/items\/oi-1/);
    await expect(page.getByTestId("order-item-details-page")).toBeVisible();
  });

  test("active link matching remains correct with trailing slash and query/hash", async ({ page }) => {
    await page.goto("/admin/dashboard/?view=grid#top");
    await expect(page.getByTestId("admin-dashboard-page")).toBeVisible();
    await expect(page.getByTestId("admin-tab-dashboard")).toHaveAttribute("aria-current", "page");
  });

  test("enterprise parent route redirects and dashboard tab is active", async ({ page }) => {
    await page.goto("/enterprise");
    await page.waitForURL("**/enterprise/dashboard");
    await expect(page.getByTestId("enterprise-dashboard-page")).toBeVisible();
    await expect(page.getByTestId("nav-enterprise")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("enterprise-tab-dashboard")).toHaveAttribute("aria-current", "page");
  });

  test("enterprise analytics and integrations routes load specific components", async ({ page }) => {
    await page.goto("/enterprise/analytics");
    await expect(page.getByTestId("enterprise-analytics-page")).toBeVisible();
    await expect(page.getByTestId("enterprise-tab-analytics")).toHaveAttribute("aria-current", "page");

    await page.goto("/enterprise/integrations");
    await expect(page.getByTestId("enterprise-integrations-page")).toBeVisible();
    await expect(page.getByTestId("enterprise-tab-integrations")).toHaveAttribute("aria-current", "page");
  });
});
