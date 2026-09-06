import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ApiError } from "@/shared/api/http/errors";
import { createAppQueryClient } from "@/shared/query";
import { notificationStore } from "@/shared/notifications";
import { server } from "@/test/server";
import { ProductService, productService } from "./product.service";
import { productKeys } from "./product.keys";
import { useProduct, useProducts } from "./product.hooks";

afterEach(() => notificationStore.clear());

function makeWrapper() {
  const client = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe("ProductService", () => {
  it("lists products against the real handler contract", async () => {
    const products = await productService.list();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty("id");
    expect(products[0]).toHaveProperty("price");
  });

  it("fetches a single product by id", async () => {
    const all = await productService.list();
    const one = await productService.getById(all[0].id);
    expect(one.id).toBe(all[0].id);
  });

  it("throws a normalized ApiError on a 404", async () => {
    server.use(
      http.get("/api/catalog/products/:productId", () =>
        HttpResponse.json({ message: "Product not found", code: "NOT_FOUND" }, { status: 404 })
      )
    );

    await expect(productService.getById("missing")).rejects.toBeInstanceOf(ApiError);
    await expect(productService.getById("missing")).rejects.toMatchObject({ status: 404 });
  });

  it("accepts an injected client (overridable/testable)", () => {
    const custom = new ProductService();
    expect(custom).toBeInstanceOf(ProductService);
  });

  it("rejects a payload that violates the generated schema (missing field)", async () => {
    server.use(
      http.get("/api/catalog/products/:productId", () =>
        // `title` and other required fields are missing → schema validation must fail.
        HttpResponse.json({ id: "p-broken" })
      )
    );

    await expect(productService.getById("p-broken")).rejects.toBeInstanceOf(ApiError);
    await expect(productService.getById("p-broken")).rejects.toMatchObject({ code: "RESPONSE_VALIDATION_FAILED" });
  });

  it("rejects a payload that violates a spec constraint (negative price)", async () => {
    server.use(
      http.get("/api/catalog/products/:productId", () =>
        HttpResponse.json({ id: "p-1", title: "X", categoryId: "c", price: -5, stock: 1, description: "d" })
      )
    );

    await expect(productService.getById("p-1")).rejects.toMatchObject({ code: "RESPONSE_VALIDATION_FAILED" });
  });
});

describe("product query keys", () => {
  it("produces stable, hierarchical keys", () => {
    expect(productKeys.all).toEqual(["product"]);
    expect(productKeys.lists()).toEqual(["product", "list"]);
    expect(productKeys.detail("p-1")).toEqual(["product", "detail", "p-1"]);
  });
});

describe("useProducts / useProduct", () => {
  it("loads the product list through the hook", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProducts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });

  it("supports a select override to derive filtered data without refetching", async () => {
    const { wrapper } = makeWrapper();
    const all = await productService.list();
    const targetCategory = all[0].categoryId;
    const { result } = renderHook(() => useProducts({ select: (list) => list.filter((p) => p.categoryId === targetCategory) }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.every((p) => p.categoryId === targetCategory)).toBe(true);
  });

  it("loads a single product", async () => {
    const { wrapper } = makeWrapper();
    const list = await productService.list();
    const { result } = renderHook(() => useProduct(list[0].id), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(list[0].id);
  });

  it("is disabled for an empty id (no request, stays pending)", async () => {
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProduct(""), { wrapper });

    // enabled:false => fetchStatus idle, never resolves.
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.isSuccess).toBe(false);
  });

  it("surfaces an error toast when the detail query fails", async () => {
    server.use(
      http.get("/api/catalog/products/:productId", () => HttpResponse.json({ message: "boom" }, { status: 500 }))
    );
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useProduct("p-err"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // product.queries sets meta.errorMessage = "Failed to load product"
    await waitFor(() =>
      expect(notificationStore.getSnapshot().some((n) => n.message === "Failed to load product")).toBe(true)
    );
  });
});
