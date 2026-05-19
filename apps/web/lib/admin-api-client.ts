import { ADMIN_ENDPOINTS } from "./api-endpoints";
import { ApiError } from "./api-client";

export const ADMIN_SESSION_COOKIE = "flux-admin.session-token";

export function getAdminSessionToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/flux-admin\.session-token=([^;]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return localStorage.getItem(ADMIN_SESSION_COOKIE);
}

export function setAdminSessionToken(token: string): void {
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  localStorage.setItem(ADMIN_SESSION_COOKIE, token);
}

export function clearAdminSessionToken(): void {
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem(ADMIN_SESSION_COOKIE);
}

async function fetchWithAdminAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminSessionToken();

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

export const adminApiClient = {
  get: async <T>(url: string): Promise<T> => {
    const res = await fetchWithAdminAuth(url, { method: "GET" });
    return res.json();
  },

  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const res = await fetchWithAdminAuth(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return res.json();
  },

  patch: async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetchWithAdminAuth(url, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return res.json();
  },

  delete: async <T>(url: string): Promise<T> => {
    const res = await fetchWithAdminAuth(url, { method: "DELETE" });
    return res.json();
  },
};

export { ADMIN_ENDPOINTS };
