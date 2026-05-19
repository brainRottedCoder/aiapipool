export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const ENDPOINTS = {
  // Auth
  auth: {
    callback: "/api/auth/callback",
    session: "/api/auth/session",
    csrf: "/api/auth/csrf",
    signin: "/api/auth/signin",
    signout: "/api/auth/signout",
  },

  // Public
  health: `${API_BASE}/health`,

  // User Dashboard API
  user: {
    me: `${API_BASE}/api/user/me`,
    usage: `${API_BASE}/api/user/usage`,
    usageDetail: (id: string) => `${API_BASE}/api/user/usage/${id}`,
    events: `${API_BASE}/api/user/events`,
    ledger: `${API_BASE}/api/user/ledger`,
    apiKeys: `${API_BASE}/api/user/api-keys`,
    apiKeyDetail: (id: string) => `${API_BASE}/api/user/api-keys/${id}`,
    topUp: `${API_BASE}/api/user/top-up`,
    invoices: `${API_BASE}/api/user/invoices`,
    changePassword: `${API_BASE}/api/user/change-password`,
  },

  // Admin API
  admin: {
    authLogin: `${API_BASE}/admin/auth/login`,
    authLogout: `${API_BASE}/admin/auth/logout`,
    authMe: `${API_BASE}/admin/auth/me`,
    overview: `${API_BASE}/admin/overview`,
    activity: `${API_BASE}/admin/activity`,
    providerKeys: `${API_BASE}/admin/provider-keys`,
    providerKeyRotate: (id: string) => `${API_BASE}/admin/provider-keys/${id}/rotate`,
    providerKeyStatus: (id: string) => `${API_BASE}/admin/provider-keys/${id}/status`,
    providerKeyDetail: (id: string) => `${API_BASE}/admin/provider-keys/${id}`,
    modelMappings: `${API_BASE}/admin/model-mappings`,
    modelMappingDetail: (id: string) => `${API_BASE}/admin/model-mappings/${id}`,
    users: `${API_BASE}/admin/users`,
    userDetail: (id: string) => `${API_BASE}/admin/users/${id}`,
    userSummary: (id: string) => `${API_BASE}/admin/users/${id}/summary`,
    userLedger: (id: string) => `${API_BASE}/admin/users/${id}/ledger`,
    userSuspend: (id: string) => `${API_BASE}/admin/users/${id}/suspend`,
    userUnsuspend: (id: string) => `${API_BASE}/admin/users/${id}/unsuspend`,
    userBalance: (id: string) => `${API_BASE}/admin/users/${id}/balance`,
    userUsage: (id: string) => `${API_BASE}/admin/users/${id}/usage`,
    margins: `${API_BASE}/admin/margins`,
    ledgers: `${API_BASE}/admin/ledgers`,
    balanceReconciliations: `${API_BASE}/admin/balance-reconciliations`,
    healthProviders: `${API_BASE}/admin/health/providers`,
    healthKeys: `${API_BASE}/admin/health/keys`,
    healthQueues: `${API_BASE}/admin/health/queues`,
    emergencyDrain: `${API_BASE}/admin/emergency/drain-provider`,
    emergencyRotate: `${API_BASE}/admin/emergency/rotate-all-keys`,
  },

  // Webhooks (server-side only)
  webhooks: {
    stripe: `${API_BASE}/webhooks/stripe`,
  },
} as const;

/** Alias for admin portal API client */
export const ADMIN_ENDPOINTS = ENDPOINTS.admin;
