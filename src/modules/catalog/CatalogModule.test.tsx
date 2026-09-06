import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/test-utils";
import { notificationStore } from "@/shared/notifications";
import { productService } from "@/resources/product";
import { server } from "@/test/server";
import CatalogModule from "./CatalogModule";

afterEach(() => notificationStore.clear());

describe("CatalogModule", () => {
  it("renders product details for a valid id", async () => {
    const [first] = await productService.list();
    renderWithProviders(<CatalogModule />, { route: `/catalog/product/${first.id}` });

    const page = await screen.findByTestId("catalog-product-page");
    expect(page).toHaveTextContent(first.title);
  });

  it("shows an error message when the product fetch fails", async () => {
    server.use(
      http.get("/api/catalog/products/:productId", () => HttpResponse.json({ message: "x" }, { status: 500 }))
    );
    renderWithProviders(<CatalogModule />, { route: "/catalog/product/p-err" });

    expect(await screen.findByText(/Failed to load product/)).toBeInTheDocument();
  });

  it("renders the not-found route for an unknown catalog path", async () => {
    renderWithProviders(<CatalogModule />, { route: "/catalog/nonsense" });
    expect(await screen.findByTestId("catalog-not-found")).toBeInTheDocument();
  });
});
