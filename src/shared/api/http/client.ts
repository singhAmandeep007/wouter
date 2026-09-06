import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "@/shared/api/generated/schema";

/**
 * Base URL is the primary deployment knob. Empty string keeps requests same-origin,
 * which is what MSW intercepts in dev / mock builds. Point it at a real gateway in
 * other environments via `VITE_API_BASE_URL` without touching any service code.
 */
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

/**
 * Extension point for auth. Wire this to your real token store (memory, cookie-backed
 * session, silent-refresh, etc.). Returning `undefined` simply sends no auth header.
 */
function getAuthToken(): string | undefined {
  return undefined;
}

/**
 * Cross-cutting request concerns live in middleware so individual services never repeat
 * them: auth header injection + a per-request correlation id for tracing. Add response
 * logging, retry, or 401→refresh here and every call inherits it.
 */
const requestMiddleware: Middleware = {
  onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    if (!request.headers.has("x-request-id")) {
      request.headers.set("x-request-id", crypto.randomUUID());
    }
    return request;
  },
};

/**
 * The single typed low-level client. Every path/method/param/response is inferred from
 * the generated `paths` (the OpenAPI spec). Services wrap this; components never import it.
 */
export const apiClient = createClient<paths>({
  baseUrl,
  // Late-bind fetch instead of letting openapi-fetch capture globalThis.fetch at
  // creation time. This matters for tests: MSW's Node server patches globalThis.fetch
  // AFTER modules load, so an early-captured reference would bypass interception. In the
  // browser it's a no-op indirection. Also the seam to inject a custom fetch if needed.
  fetch: (input: Request) => globalThis.fetch(input),
});
apiClient.use(requestMiddleware);

export type ApiClient = typeof apiClient;
