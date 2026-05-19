export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiKey {
  id: string;
  name: string | null;
  key_prefix: string;
  status: "active" | "revoked";
  rate_limit_rpm: number;
  rate_limit_tokens_day: number;
  created_at: string;
}

export interface UsageStats {
  period: string;
  requests: number;
  tokens_input: number;
  tokens_output: number;
  cost: number;
}

export interface LedgerEntry {
  id: string;
  amount: string;
  balance_after: string;
  type: "api_usage" | "topup" | "refund" | "adjustment";
  created_at: string;
}

export interface ProviderHealth {
  provider: string;
  status: "healthy" | "degraded" | "down";
  latency: number;
  uptime: number;
}

export interface ModelMapping {
  id: string;
  model_alias: string;
  provider: string;
  provider_model_id: string;
  pricing_input: string;
  pricing_output: string;
  capabilities: Record<string, unknown>;
  status: "ACTIVE" | "INACTIVE";
}

export interface ProviderKey {
  id: string;
  provider: string;
  remaining_credits: string;
  initial_credits: string;
  status: "ACTIVE" | "EXHAUSTED" | "ERROR" | "ROTATING";
  is_emergency_reserve: boolean;
  last_used: string | null;
  created_at: string;
}

export interface UserAdmin {
  id: string;
  email: string;
  name: string | null;
  balance: string;
  status: "active" | "suspended";
  created_at: string;
  stripe_customer_id?: string | null;
  oauth_providers?: string[];
}

export interface AdminOverview {
  total_users: number;
  active_users: number;
  suspended_users: number;
  total_balance: string;
  requests_24h: number;
  errors_24h: number;
  revenue_24h: string;
  provider_key_counts: Record<string, number>;
  recent_alerts: Array<{ level: string; message: string }>;
}

export interface AdminActivityFeed {
  requests: Array<{
    id: string;
    type: string;
    user_email: string;
    model: string;
    user_charge: string;
    status: string;
    latency_ms: number;
    created_at: string;
  }>;
  ledger: Array<{
    id: string;
    type: string;
    user_email: string;
    amount: string;
    ledger_type: string;
    balance_after: string;
    created_at: string;
  }>;
  audits: Array<{
    id: string;
    type: string;
    admin_email: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>;
}

export interface UserUsageLog {
  id: string;
  model: string;
  provider: string;
  tokens_input: number;
  tokens_output: number;
  user_charge: string;
  latency_ms: number;
  status: string;
  created_at: string;
}

export interface MarginReport {
  period: string;
  total_upstream_cost: string;
  total_user_charges: string;
  total_margin: string;
}

export interface SseEvent {
  type: "balance_update" | "key_rotation" | "outage_alert" | "heartbeat";
  payload: Record<string, unknown>;
}
