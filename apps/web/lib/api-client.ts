import { parseSessionTokenFromCookieHeader } from "./session-cookies";
import { ENDPOINTS } from "./api-endpoints";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public param?: string | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Standard list envelope from the Fastify API (`{ data: T }`) */
export interface ApiDataResponse<T> {
  data: T;
}

export function unwrapData<T>(response: ApiDataResponse<T>): T {
  return response.data;
}

let cachedSessionToken: string | null | undefined;
let sessionTokenCacheExpiresAt = 0;

export function clearSessionCache() {
  cachedSessionToken = undefined;
  sessionTokenCacheExpiresAt = 0;
}

async function getSessionToken(): Promise<string | null> {
  if (cachedSessionToken !== undefined && Date.now() < sessionTokenCacheExpiresAt) {
    return cachedSessionToken;
  }

  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/auth/session-token", { credentials: "include" });
      if (res.ok) {
        const body = (await res.json()) as { token?: string };
        if (body.token) {
          cachedSessionToken = body.token;
          sessionTokenCacheExpiresAt = Date.now() + 60_000;
          return body.token;
        }
      }
    } catch {
      // fall through to legacy reads
    }

    const fromCookie = parseSessionTokenFromCookieHeader(document.cookie);
    if (fromCookie) {
      cachedSessionToken = fromCookie;
      sessionTokenCacheExpiresAt = Date.now() + 60_000;
      return fromCookie;
    }

    const fromStorage = localStorage.getItem("session-token");
    if (fromStorage) {
      cachedSessionToken = fromStorage;
      sessionTokenCacheExpiresAt = Date.now() + 60_000;
      return fromStorage;
    }
  }

  cachedSessionToken = null;
  sessionTokenCacheExpiresAt = Date.now() + 5_000;
  return null;
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getSessionToken();

  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error?.code ?? "unknown_error",
      body.error?.message ?? `HTTP ${res.status}`,
      body.error?.param ?? null
    );
  }

  return res;
}

export const apiClient = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetchWithAuth(url, { method: "GET" });
    return res.json();
  },

  post: async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.json();
  },

  patch: async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await fetchWithAuth(url, { method: "DELETE" });
    return res.json();
  },

  // Stripe checkout returns a URL to redirect to
  checkout: async (url: string, body: unknown): Promise<{ url: string }> => {
    const res = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return res.json();
  },
};

export { ENDPOINTS };
