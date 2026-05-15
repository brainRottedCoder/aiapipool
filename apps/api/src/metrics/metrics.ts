import { Registry, Counter, Histogram, Gauge } from "prom-client";

export const registry = new Registry();

export const httpRequestsTotal = new Counter({
  name: "fluxai_http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status_code"],
  registers: [registry],
});

export const requestDuration = new Histogram({
  name: "fluxai_request_duration_seconds",
  help: "Request latency distribution in seconds",
  labelNames: ["path", "provider"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
  registers: [registry],
});

export const activeConnections = new Gauge({
  name: "fluxai_active_connections",
  help: "Currently active SSE streams",
  registers: [registry],
});

export const providerKeyCredits = new Gauge({
  name: "fluxai_provider_key_credits",
  help: "Remaining credits per provider key",
  labelNames: ["provider", "key_id"],
  registers: [registry],
});
