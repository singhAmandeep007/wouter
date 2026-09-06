import { describe, expect, it } from "vitest";
import { ApiError, unwrap } from "./errors";

describe("ApiError.fromResponse", () => {
  it("uses the server-provided message and code when present", () => {
    const response = new Response(null, { status: 404 });
    const error = ApiError.fromResponse(response, { message: "Product not found", code: "NOT_FOUND" });

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Product not found");
    expect(error.status).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });

  it("falls back to a status-based message when the body has none", () => {
    const response = new Response(null, { status: 500 });
    const error = ApiError.fromResponse(response, undefined);

    expect(error.message).toBe("Request failed with status 500");
    expect(error.status).toBe(500);
  });
});

describe("unwrap", () => {
  it("returns typed data on a successful result", async () => {
    const result = Promise.resolve({ data: { id: "p-1" }, response: new Response(null, { status: 200 }) });
    await expect(unwrap(result)).resolves.toEqual({ id: "p-1" });
  });

  it("throws a normalized ApiError when the result carries an error", async () => {
    const result = Promise.resolve({
      error: { message: "boom", code: "E" },
      response: new Response(null, { status: 400 }),
    });

    await expect(unwrap(result)).rejects.toBeInstanceOf(ApiError);
    await expect(unwrap(result)).rejects.toMatchObject({ status: 400, message: "boom" });
  });

  it("throws when the response is not ok even if data is present", async () => {
    const result = Promise.resolve({ data: { id: "x" }, response: new Response(null, { status: 503 }) });
    await expect(unwrap(result)).rejects.toBeInstanceOf(ApiError);
  });

  it("throws when data is undefined on an ok response", async () => {
    const result = Promise.resolve({ data: undefined, response: new Response(null, { status: 200 }) });
    await expect(unwrap(result)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("unwrap with a response schema", () => {
  const idSchema = {
    parse(input: unknown) {
      if (typeof input !== "object" || input === null || typeof (input as { id?: unknown }).id !== "string") {
        throw new Error("invalid shape");
      }
      return input as { id: string };
    },
  };

  it("returns validated data when the payload matches", async () => {
    const result = Promise.resolve({ data: { id: "ok" }, response: new Response(null, { status: 200 }) });
    await expect(unwrap(result, idSchema)).resolves.toEqual({ id: "ok" });
  });

  it("throws a RESPONSE_VALIDATION_FAILED ApiError when validation fails", async () => {
    // Payload shape is intentionally wrong, so type `data` as unknown (a real response is
    // untrusted anyway — validation is exactly what proves its shape).
    const result: Promise<{ data?: unknown; response: Response }> = Promise.resolve({
      data: { id: 123 },
      response: new Response(null, { status: 200 }),
    });

    await expect(unwrap(result, idSchema)).rejects.toBeInstanceOf(ApiError);
    await expect(unwrap(result, idSchema)).rejects.toMatchObject({ code: "RESPONSE_VALIDATION_FAILED" });
  });

  it("does not validate when no schema is provided", async () => {
    const result = Promise.resolve({ data: { anything: true }, response: new Response(null, { status: 200 }) });
    await expect(unwrap(result)).resolves.toEqual({ anything: true });
  });
});
