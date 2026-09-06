import { afterEach, describe, expect, it } from "vitest";
import { HttpResponse } from "msw";
import { faultControl, getFault, isEmpty, withFaults } from "./faults";

// The global afterEach in test/setup.ts already calls faultControl.reset(); this is belt-and-suspenders.
afterEach(() => faultControl.reset());

describe("fault control", () => {
  it("records and clears an error fault", () => {
    faultControl.fail("op", 503);
    expect(getFault("op")).toEqual({ kind: "error", status: 503 });

    faultControl.clear("op");
    expect(getFault("op")).toBeUndefined();
  });

  it("records an empty fault detectable via isEmpty", () => {
    expect(isEmpty("listThings")).toBe(false);
    faultControl.empty("listThings");
    expect(isEmpty("listThings")).toBe(true);
  });

  it("reset() clears every fault", () => {
    faultControl.fail("a");
    faultControl.network("b");
    faultControl.reset();
    expect(getFault("a")).toBeUndefined();
    expect(getFault("b")).toBeUndefined();
  });
});

describe("withFaults HOF", () => {
  const ok = withFaults("op", async () => HttpResponse.json({ ok: true }));
  // MSW resolver info is unused by the fault branches; a minimal stand-in is fine.
  const info = {} as Parameters<typeof ok>[0];

  it("passes through to the resolver when no fault is set", async () => {
    const res = await ok(info);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(200);
    await expect((res as Response).json()).resolves.toEqual({ ok: true });
  });

  it("short-circuits to the configured error status", async () => {
    faultControl.fail("op", 418);
    const res = (await ok(info)) as Response;
    expect(res.status).toBe(418);
    await expect(res.json()).resolves.toMatchObject({ code: "SIMULATED_FAULT" });
  });

  it("produces a transport-level failure for a network fault", async () => {
    faultControl.network("op");
    // HttpResponse.error() yields a Response whose `type` is "error".
    const res = (await ok(info)) as Response;
    expect(res.type).toBe("error");
  });
});
