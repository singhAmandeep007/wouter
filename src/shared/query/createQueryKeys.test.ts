import { describe, expect, it } from "vitest";
import { createQueryKeys } from "./createQueryKeys";

describe("createQueryKeys", () => {
  const keys = createQueryKeys("product");

  it("roots every key under the scope", () => {
    expect(keys.all).toEqual(["product"]);
    expect(keys.lists()).toEqual(["product", "list"]);
    expect(keys.details()).toEqual(["product", "detail"]);
    expect(keys.detail("p-1")).toEqual(["product", "detail", "p-1"]);
  });

  it("nests list params so broad invalidation matches narrower keys", () => {
    expect(keys.list()).toEqual(["product", "list", null]);
    expect(keys.list({ page: 2 })).toEqual(["product", "list", { page: 2 }]);
  });

  it("keeps scopes isolated from each other", () => {
    const orderKeys = createQueryKeys("order");
    expect(orderKeys.all).toEqual(["order"]);
    expect(orderKeys.detail("o-1")).toEqual(["order", "detail", "o-1"]);
  });
});
