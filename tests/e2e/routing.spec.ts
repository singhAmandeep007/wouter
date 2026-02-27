import { expect, test } from "@playwright/test";

test.describe("Wouter routing, active links, and module loading", () => {
  test("defaults to dashboard and highlights dashboard nav", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/dashboard");
    await expect(page.getByTestId("dashboard-module")).toBeVisible();
    await expect(page.getByTestId("nav-dashboard")).toHaveClass(/is-active/);
  });

  test("catalog route-hint tabs highlight exact active route", async ({ page }) => {
    await page.goto("/catalog/product/p-100");
    await expect(page.getByTestId("catalog-product-page")).toBeVisible();
    await expect(page.getByTestId("catalog-hint-catalog-product-p-100")).toHaveClass(/is-active/);
    await expect(page.getByTestId("catalog-hint-catalog")).not.toHaveClass(/is-active/);
  });

  test("settings deep order item route highlights only deep tab", async ({ page }) => {
    await page.goto("/settings/orders/o-5001/items/oi-1");
    await expect(page.getByTestId("order-item-details-page")).toBeVisible();
    await expect(page.getByTestId("orders-tab-item")).toHaveClass(/is-active/);
    await expect(page.getByTestId("orders-tab-list")).not.toHaveClass(/is-active/);
  });

  test("admin parent route redirects to dashboard and active tab is dashboard", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/dashboard");
    await expect(page.getByTestId("admin-dashboard-page")).toBeVisible();
    await expect(page.getByTestId("nav-admin")).toHaveClass(/is-active/);
    await expect(page.getByTestId("admin-tab-dashboard")).toHaveClass(/is-active/);
  });

  test("admin api and chatbot pages load with corresponding tab active", async ({ page }) => {
    await page.goto("/admin/api");
    await expect(page.getByTestId("admin-api-page")).toBeVisible();
    await expect(page.getByTestId("admin-tab-api")).toHaveClass(/is-active/);

    await page.goto("/admin/chatbot");
    await expect(page.getByTestId("admin-chatbot-page")).toBeVisible();
    await expect(page.getByTestId("admin-tab-chatbot")).toHaveClass(/is-active/);
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
    await expect(page.getByTestId("admin-tab-dashboard")).toHaveClass(/is-active/);
  });
});
