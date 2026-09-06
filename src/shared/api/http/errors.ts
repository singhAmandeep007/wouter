import type { components } from "@/shared/api/generated/schema";

type ApiErrorBody = components["schemas"]["ApiError"];

/**
 * Normalized error thrown by every service method. Because openapi-fetch returns a
 * discriminated `{ data, error, response }` result rather than throwing, we convert
 * non-2xx responses into a single typed error shape here. TanStack Query then treats
 * anything thrown from a `queryFn`/`mutationFn` as the error state, so the whole app
 * has exactly one error type to reason about.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly payload?: unknown;

  constructor(message: string, options: { status: number; code?: string; payload?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.payload = options.payload;
  }

  static fromResponse(response: Response, errorBody: unknown): ApiError {
    const body = (errorBody ?? {}) as Partial<ApiErrorBody>;
    const message =
      typeof body.message === "string" && body.message.length > 0
        ? body.message
        : `Request failed with status ${response.status}`;

    return new ApiError(message, {
      status: response.status,
      code: body.code,
      payload: errorBody,
    });
  }
}

/**
 * Result shape produced by openapi-fetch method calls (`client.GET(...)` etc.).
 * Kept structural so services stay decoupled from openapi-fetch's exact generics.
 */
export type FetchResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

/**
 * Minimal structural contract for a runtime validator — satisfied by any zod schema's
 * `.parse`. Kept structural so services stay decoupled from zod specifics.
 */
export interface ResponseValidator<T> {
  parse: (input: unknown) => T;
}

/**
 * Await an openapi-fetch call and return typed `data`, or throw a normalized `ApiError`.
 * This is the single choke point where "HTTP result" becomes "domain value or throw".
 *
 * When a `schema` is supplied, the payload is validated at runtime here — the trust
 * boundary. Generated types only guarantee shape at compile time; this asserts it against
 * the real response, turning a malformed payload into a clear, localized failure instead
 * of an `undefined`-access crash three components deep. Validation failures are converted
 * to `ApiError` so the whole app still reasons about exactly one error type.
 */
export async function unwrap<T>(promise: Promise<FetchResult<T>>, schema?: ResponseValidator<T>): Promise<T> {
  const { data, error, response } = await promise;

  if (error !== undefined || !response.ok || data === undefined) {
    throw ApiError.fromResponse(response, error);
  }

  if (!schema) {
    return data;
  }

  try {
    return schema.parse(data);
  } catch (validationError) {
    throw new ApiError("Response did not match the expected schema", {
      status: response.status,
      code: "RESPONSE_VALIDATION_FAILED",
      payload: validationError,
    });
  }
}
