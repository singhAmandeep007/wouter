import { afterEach, describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
import { ApiError } from "@/shared/api/http/errors";
import { notificationStore } from "@/shared/notifications";
import { createAppQueryClient } from "./queryClient";

// The cache callbacks push into the module-level notification store; clear it per test.
afterEach(() => notificationStore.clear());

function kinds() {
  return notificationStore.getSnapshot().map((n) => ({ kind: n.kind, message: n.message }));
}

describe("QueryCache error notifications", () => {
  it("emits an error toast when a query fails", async () => {
    const client = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });

    await client
      .query({
        queryKey: ["boom"],
        queryFn: () => Promise.reject(new ApiError("query exploded", { status: 500 })),
      })
      .catch(() => undefined);

    await waitFor(() => expect(kinds()).toContainEqual({ kind: "error", message: "query exploded" }));
  });

  it("prefers meta.errorMessage over the raw error message", async () => {
    const client = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });

    await client
      .query({
        queryKey: ["boom2"],
        queryFn: () => Promise.reject(new ApiError("raw", { status: 500 })),
        meta: { errorMessage: "Friendly message" },
      })
      .catch(() => undefined);

    await waitFor(() => expect(kinds()).toContainEqual({ kind: "error", message: "Friendly message" }));
  });

  it("suppresses the toast when meta.suppressErrorNotification is set", async () => {
    const client = createAppQueryClient({ defaultOptions: { queries: { retry: false } } });

    await client
      .query({
        queryKey: ["quiet"],
        queryFn: () => Promise.reject(new ApiError("silent", { status: 500 })),
        meta: { suppressErrorNotification: true },
      })
      .catch(() => undefined);

    // Give any async callback a tick, then assert nothing was pushed.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(notificationStore.getSnapshot()).toHaveLength(0);
  });
});

describe("MutationCache notifications", () => {
  it("emits a success toast from meta.successMessage", async () => {
    const client = createAppQueryClient();

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.resolve({ ok: true }),
        meta: { successMessage: "Saved!" },
      })
      .execute(undefined);

    await waitFor(() => expect(kinds()).toContainEqual({ kind: "success", message: "Saved!" }));
  });

  it("emits an error toast when a mutation fails", async () => {
    const client = createAppQueryClient();

    await client
      .getMutationCache()
      .build(client, {
        mutationFn: () => Promise.reject(new ApiError("mutation failed", { status: 400 })),
        meta: { errorMessage: "Could not save" },
      })
      .execute(undefined)
      .catch(() => undefined);

    await waitFor(() => expect(kinds()).toContainEqual({ kind: "error", message: "Could not save" }));
  });
});
