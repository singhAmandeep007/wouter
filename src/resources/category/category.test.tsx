import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryWrapper } from "@/test/test-utils";
import { categoryService } from "./category.service";
import { useCategories } from "./category.hooks";

describe("category resource", () => {
  it("service lists categories", async () => {
    const categories = await categoryService.list();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("title");
  });

  it("hook loads categories", async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useCategories(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThan(0);
  });
});
