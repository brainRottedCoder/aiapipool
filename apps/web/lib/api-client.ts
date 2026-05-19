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

async function getSessionToken(): Promise<string | null> {
  // NextAuth session token is stored in cookies by default
  // For cross-domain, we can also use localStorage as fallback
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/next-auth\.session-token=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  // Fallback for cross-domain
  return localStorage.getItem("session-token");
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
