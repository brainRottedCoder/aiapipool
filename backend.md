# FluxAI Gateway — Full-Stack Implementation Guide

## 1. Tech Stack

### 1.1 Backend

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 20 LTS | Stable, fast streaming, low memory |
| Language | TypeScript 5.x (strict mode) | Type safety, better DX |
| Framework | Fastify 5.x | 2x faster than Express, native streaming, schema validation |
| ORM | Drizzle ORM | Lightweight, type-safe SQL, no query overhead |
| Validation | Zod | Runtime schema validation, OpenAI schema enforcement |
| Logging | Pino | Structured JSON logs, trace ID propagation |
| Job Queue | BullMQ | Redis-backed, retries, scheduling, concurrency control |
| Database | PostgreSQL 16 | ACID, JSONB, rock-solid |
| Cache | Redis 7 (Valkey) | Rate limiting, atomic counters, pub/sub, job queues |
| Payments | Stripe SDK | Checkout, webhooks, idempotency built-in |

### 1.2 Frontend

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR/SSG for marketing; SPA for dashboards |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent dashboard UI |
| State / Data | TanStack Query (React Query) | Server-state caching for usage, billing, logs |
| Charts | Recharts | Token burn, latency, margin visualizations |
| Auth | Clerk (or NextAuth.js) | Email/password + OAuth, JWT sessions, MFA-ready |
| API Client | tRPC or typed REST client | Type-safe calls to Fastify backend |

### 1.3 Infrastructure

| Layer | Technology |
|-------|------------|
| Reverse Proxy / Edge | Cloudflare (WAF, DDoS, SSL, DNS) |
| API Hosting | Railway or Hetzner VPS (Docker) |
| Frontend Hosting | Vercel or Railway (Next.js) |
| Monitoring | Prometheus + Grafana + BetterStack + Sentry |

---

## 2. Project Structure (Monorepo)

```
fluxai/
├── apps/
│   ├── api/                            # ── Fastify Backend ──
│   │   ├── src/
│   │   │   ├── index.ts                # Entry point — bootstraps Fastify
│   │   │   ├── app.ts                  # Fastify app factory (plugins, routes, hooks)
│   │   │   ├── config/
│   │   │   │   ├── env.ts              # Zod-validated environment variables
│   │   │   │   └── constants.ts        # App-wide constants (retry limits, timeouts)
│   │   │   ├── db/
│   │   │   │   ├── client.ts           # Drizzle + node-postgres pool setup
│   │   │   │   ├── schema.ts           # All Drizzle table definitions
│   │   │   │   └── migrations/         # SQL migration files (drizzle-kit)
│   │   │   ├── redis/
│   │   │   │   └── client.ts           # ioredis singleton + health check
│   │   │   ├── routes/
│   │   │   │   ├── v1/
│   │   │   │   │   └── chat-completions.ts  # POST /v1/chat/completions
│   │   │   │   ├── api/
│   │   │   │   │   └── user/            # User Dashboard API routes
│   │   │   │   │       ├── me.ts        # GET /api/user/me
│   │   │   │   │       ├── usage.ts     # GET /api/user/usage, /api/user/usage/:id
│   │   │   │   │       ├── ledger.ts    # GET /api/user/ledger
│   │   │   │   │       ├── api-keys.ts  # GET/POST/DELETE /api/user/api-keys
│   │   │   │   │       ├── top-up.ts    # POST /api/user/top-up
│   │   │   │   │       └── invoices.ts  # GET /api/user/invoices
│   │   │   │   ├── webhooks/
│   │   │   │   │   ├── stripe.ts        # POST /webhooks/stripe
│   │   │   │   │   └── clerk.ts         # POST /webhooks/clerk (user.created)
│   │   │   │   ├── admin/
│   │   │   │   │   ├── provider-keys.ts # CRUD /admin/provider-keys
│   │   │   │   │   ├── model-mappings.ts# CRUD /admin/model-mappings
│   │   │   │   │   ├── users.ts        # GET/PATCH /admin/users
│   │   │   │   │   ├── health.ts       # GET /admin/health/*
│   │   │   │   │   ├── margins.ts      # GET /admin/margins
│   │   │   │   │   ├── ledgers.ts      # GET /admin/ledgers
│   │   │   │   │   └── emergency.ts    # POST /admin/emergency/*
│   │   │   │   └── health.ts           # GET /health (public liveness)
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts             # Bearer token validation (HMAC lookup)
│   │   │   │   ├── session-auth.ts     # JWT session validation (dashboard)
│   │   │   │   ├── admin-auth.ts       # X-Admin-Key or isAdmin role check
│   │   │   │   ├── rate-limiter.ts     # Redis sliding-window rate limiter
│   │   │   │   └── request-id.ts       # Injects unique request ID + trace context
│   │   │   ├── services/
│   │   │   │   ├── auth.ts             # API key HMAC + session + admin role checks
│   │   │   │   ├── key-pool.ts         # Key selection, rotation, exhaustion logic
│   │   │   │   ├── provider-mapper.ts  # model_alias → provider lookup
│   │   │   │   ├── provider-adapter.ts # Registry of provider adapters
│   │   │   │   ├── balance.ts          # Atomic balance checks + mid-stream monitoring
│   │   │   │   ├── stream-proxy.ts     # AbortController, SSE proxying, disconnect
│   │   │   │   ├── ledger.ts           # Immutable request_logs + usage_ledger writes
│   │   │   │   ├── billing.ts          # Stripe checkout + webhook processing
│   │   │   │   └── circuit-breaker.ts  # Per-provider/key failure tracking
│   │   │   ├── providers/
│   │   │   │   ├── base-adapter.ts     # Abstract ProviderAdapter class
│   │   │   │   ├── registry.ts         # Provider name → adapter instance map
│   │   │   │   ├── openrouter.ts       # OpenRouter adapter
│   │   │   │   ├── together.ts         # Together AI adapter
│   │   │   │   ├── openai.ts           # OpenAI adapter
│   │   │   │   ├── anthropic.ts        # Anthropic adapter
│   │   │   │   ├── groq.ts             # Groq adapter
│   │   │   │   └── gemini.ts           # Google Gemini adapter
│   │   │   ├── crypto/
│   │   │   │   ├── encryption.ts       # AES-256-GCM encrypt/decrypt
│   │   │   │   └── hmac.ts             # HMAC-SHA256 for user API key hashing
│   │   │   ├── workers/
│   │   │   │   ├── index.ts            # BullMQ worker bootstrap
│   │   │   │   ├── health-checker.ts   # Provider availability + latency checks
│   │   │   │   ├── balance-reconciler.ts# Sync provider balances every 5 min
│   │   │   │   ├── key-cleaner.ts      # Archive exhausted keys
│   │   │   │   ├── analytics-aggregator.ts # Roll up usage stats (every 15 min)
│   │   │   │   ├── margin-reporter.ts  # Daily/weekly margin reports
│   │   │   │   └── data-retention.ts   # Purge metadata >90d, content >30d
│   │   │   ├── types/
│   │   │   │   ├── openai.ts           # OpenAI request/response/chunk types
│   │   │   │   ├── provider.ts         # ProviderAdapter interface + related types
│   │   │   │   └── common.ts           # Shared types (RequestContext, etc.)
│   │   │   └── utils/
│   │   │       ├── errors.ts           # OpenAI-compatible error factory
│   │   │       ├── streaming.ts        # SSE Transform stream + helpers
│   │   │       ├── id.ts               # nanoid / UUID generators
│   │   │       └── cost.ts             # Token cost calculation helpers
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   └── web/                            # ── Next.js Frontend ──
│       ├── app/
│       │   ├── (marketing)/            # Public pages (no auth)
│       │   │   ├── page.tsx            # Landing page
│       │   │   ├── pricing/page.tsx
│       │   │   ├── models/page.tsx
│       │   │   ├── changelog/page.tsx
│       │   │   └── status/page.tsx
│       │   ├── (auth)/                 # Auth pages
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   ├── verify-email/page.tsx
│       │   │   ├── forgot-password/page.tsx
│       │   │   └── reset-password/page.tsx
│       │   ├── (docs)/                 # Documentation (SSG)
│       │   │   ├── docs/page.tsx
│       │   │   ├── docs/quickstart/page.tsx
│       │   │   ├── docs/api-reference/page.tsx
│       │   │   └── docs/sdks/page.tsx
│       │   ├── dashboard/              # User dashboard (auth required)
│       │   │   ├── page.tsx            # Overview
│       │   │   ├── usage/page.tsx
│       │   │   ├── usage/[id]/page.tsx
│       │   │   ├── billing/page.tsx
│       │   │   ├── billing/top-up/page.tsx
│       │   │   ├── billing/payment-methods/page.tsx
│       │   │   ├── api-keys/page.tsx
│       │   │   ├── api-keys/create/page.tsx
│       │   │   └── api-keys/[id]/page.tsx
│       │   ├── settings/               # User settings (auth required)
│       │   │   ├── page.tsx
│       │   │   ├── profile/page.tsx
│       │   │   ├── security/page.tsx
│       │   │   ├── notifications/page.tsx
│       │   │   └── billing-address/page.tsx
│       │   ├── help/                   # Help center
│       │   │   ├── page.tsx
│       │   │   ├── contact/page.tsx
│       │   │   └── debug/page.tsx
│       │   ├── admin/                  # Admin dashboard (admin role required)
│       │   │   ├── page.tsx            # Admin overview
│       │   │   ├── users/page.tsx
│       │   │   ├── users/[id]/page.tsx
│       │   │   ├── provider-keys/page.tsx
│       │   │   ├── provider-keys/create/page.tsx
│       │   │   ├── model-mappings/page.tsx
│       │   │   ├── model-mappings/create/page.tsx
│       │   │   ├── ledgers/page.tsx
│       │   │   ├── margins/page.tsx
│       │   │   ├── health/page.tsx
│       │   │   └── emergency/page.tsx
│       │   └── layout.tsx              # Root layout
│       ├── components/                 # Reusable UI components
│       ├── lib/                        # API client, auth helpers, utils
│       ├── hooks/                      # Custom React hooks
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/                         # Shared Zod schemas, types, constants
│       ├── src/
│       │   ├── schemas.ts              # Shared Zod schemas (API request/response)
│       │   └── types.ts               # Shared TypeScript types
│       ├── tsconfig.json
│       └── package.json
│
├── docker-compose.yml                  # Postgres + Redis for local dev
├── turbo.json                          # Turborepo config
├── package.json                        # Root workspace config
├── .env.example
└── README.md
```

---

## 3. Environment Variables

File: `src/config/env.ts`

Parse and validate ALL env vars at startup using Zod. If any required var is missing, the process exits immediately with a clear error.

```ts
// Required variables to validate with Zod:
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().url(),

  // Security
  MASTER_ENCRYPTION_KEY: z.string().min(32),  // For AES-256-GCM
  API_KEY_PEPPER: z.string().min(32),          // For HMAC-SHA256
  ADMIN_API_KEY: z.string().min(32),           // Static admin key

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Auth (Clerk or NextAuth)
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Rate limits (configurable)
  DEFAULT_RPM: z.coerce.number().default(60),
  DEFAULT_TOKENS_PER_DAY: z.coerce.number().default(100000),
  MAX_CONCURRENT_REQUESTS: z.coerce.number().default(10),
});
```

---

## 4. Database Schema (Drizzle ORM)

File: `src/db/schema.ts`

Define all tables using Drizzle's `pgTable`. Each table maps 1:1 to the SQL in the PRD.

**Tables to define:**

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `users` | `id` (UUID PK), `email` (unique), `balance` (decimal 12,4), `status`, `created_at` | Balance is the source of truth for credit checks |
| `apiKeys` | `id` (UUID PK), `user_id` (FK→users), `hashed_key`, `name`, `rate_limit_rpm`, `rate_limit_tokens_day`, `status`, `created_at` | Store HMAC hash only, never raw key |
| `providerKeys` | `id` (UUID PK), `provider`, `api_key_encrypted` (bytea), `initial_credits`, `remaining_credits`, `status` (ACTIVE/EXHAUSTED/ERROR/ROTATING), `is_emergency_reserve`, `last_used`, `created_at`, `archived_at` | Encrypted with AES-256-GCM |
| `modelMappings` | `id` (UUID PK), `model_alias` (unique), `provider`, `provider_model_id`, `pricing_input`, `pricing_output`, `capabilities` (jsonb), `status`, `created_at` | 1:1 mapping, no priority/fallback |
| `requestLogs` | `id` (UUID PK), `user_id`, `api_key_id`, `provider_key_id`, `provider`, `model`, `tokens_input`, `tokens_output`, `upstream_cost`, `user_charge`, `margin`, `latency_ms`, `status`, `idempotency_key` (unique), `created_at` | Immutable. Indexed on `(user_id, created_at DESC)` and `idempotency_key` |
| `usageLedger` | `id` (UUID PK), `user_id`, `request_log_id`, `amount`, `balance_after`, `type` (api_usage/topup/refund/adjustment), `idempotency_key` (unique), `created_at` | Immutable financial ledger. Indexed on `(user_id, created_at DESC)` |

File: `src/db/client.ts`

- Create a `node-postgres` `Pool` with `DATABASE_URL`.
- Wrap it with `drizzle(pool)`.
- Export the `db` instance.
- Set `max: 20` connections for the pool (tune based on load).

---

## 5. Redis Client

File: `src/redis/client.ts`

- Use `ioredis` with `REDIS_URL`.
- Export a singleton `redis` instance.
- On `error` event: log with Pino, do NOT crash the process.
- On `connect`: log connection confirmation.
- Create a separate `subscriberRedis` instance if pub/sub is needed later.

---

## 6. App Bootstrap

File: `src/index.ts`

```ts
// 1. Import and validate env (exits on failure)
// 2. Import app factory
// 3. Call app.listen({ port, host })
// 4. Graceful shutdown handler:
//    - SIGTERM / SIGINT
//    - Close Fastify server (stop accepting new requests)
//    - Close DB pool
//    - Close Redis connection
//    - Close BullMQ workers
//    - Exit process
```

File: `src/app.ts`

```ts
// Fastify app factory function: buildApp()
// 1. Create Fastify instance with:
//    - logger: Pino instance
//    - trustProxy: true (behind Cloudflare/Nginx)
//    - bodyLimit: 1MB (prevent payload abuse)
//    - requestIdHeader: 'x-request-id'
// 2. Register plugins:
//    - @fastify/cors
//    - @fastify/helmet (security headers)
// 3. Register global hooks:
//    - onRequest: attach requestId to logger context
// 4. Register route modules:
//    - /health
//    - /v1/* (chat completions — API key auth)
//    - /api/user/* (dashboard API — session auth)
//    - /webhooks/* (Stripe, Clerk — signature verification)
//    - /admin/* (all admin routes, guarded by admin-auth)
// 5. Register error handler (OpenAI-compatible error format)
// 6. Return app instance
```

---

## 7. Middleware

### 7.1 Request ID (`src/middleware/request-id.ts`)

- Fastify `onRequest` hook.
- Read `x-request-id` header or generate one via `crypto.randomUUID()`.
- Attach to `request.id` and Pino child logger for trace propagation.

### 7.2 Auth (`src/middleware/auth.ts`)

Function: `authenticateUser` — Fastify `preHandler` hook for `/v1/*` and `/auth/api-keys` and `/billing/*` routes.

```
Steps:
1. Extract Bearer token from Authorization header.
2. If missing → 401 { error: { message: "Missing API key", type: "authentication_error" } }
3. Compute HMAC-SHA256(token, API_KEY_PEPPER).
4. Query api_keys WHERE hashed_key = hash AND status = 'active'.
5. If not found → 401 { error: { message: "Invalid API key", type: "authentication_error" } }
6. Join with users table to get user record.
7. If user.status !== 'active' → 403 { error: { message: "Account suspended" } }
8. Attach { user, apiKey } to request context (request.locals or Fastify decorations).
```

### 7.3 Session Auth (`src/middleware/session-auth.ts`)

Function: `authenticateSession` — Fastify `preHandler` for `/api/user/*` dashboard routes.

```
Steps:
1. Extract JWT session cookie or Authorization header (Clerk/NextAuth token).
2. Verify JWT signature and expiration.
3. Extract userId from token claims.
4. Query users table to get user record.
5. If user.status !== 'active' → 403 { error: { message: "Account suspended" } }
6. Attach { user } to request context.
```

### 7.4 Admin Auth (`src/middleware/admin-auth.ts`)

Function: `authenticateAdmin` — Fastify `preHandler` for `/admin/*`.

```
Steps:
1. Read X-Admin-Key header OR validate JWT session with isAdmin role.
2. If X-Admin-Key: constant-time compare against env.ADMIN_API_KEY (use crypto.timingSafeEqual).
3. If JWT: verify token, check user.role === 'admin'.
4. If neither passes → 401.
```

### 7.5 Rate Limiter (`src/middleware/rate-limiter.ts`)

Function: `rateLimiter` — Fastify `preHandler` for `/v1/*`.

```
Algorithm: Redis sliding window log.

Steps:
1. Get apiKey.rate_limit_rpm and apiKey.rate_limit_tokens_day from request context.
2. Redis key: `rl:rpm:{apiKeyId}` — INCR with TTL 60s.
   - If count > rate_limit_rpm → 429 { error: { message: "Rate limit exceeded", type: "rate_limit_error" } }
3. Redis key: `rl:tpd:{apiKeyId}` — check accumulated tokens today.
   - If over limit → 429.
4. Redis key: `rl:concurrent:{apiKeyId}` — INCR on request start, DECR on response end.
   - If count > MAX_CONCURRENT_REQUESTS → 429.
```

---

## 8. Core Services

### 8.1 Model Mapper (`src/services/model-mapper.ts`)

Function: `resolveModel(modelAlias: string): ModelMapping | null`

```
Steps:
1. Check Redis cache first: `model:{alias}`.
2. If cache miss → query model_mappings WHERE model_alias = alias AND status = 'ACTIVE'.
3. If found → cache in Redis with 60s TTL, return mapping.
4. If not found → return null.
   Caller returns 404: { error: { message: "Model 'xyz' not found", code: "model_not_found" } }
```

**No fallback logic.** One alias = one provider. If unavailable, fail fast.

### 8.2 Key Pool Manager (`src/services/key-pool.ts`)

Function: `acquireKey(provider: string): ProviderKey`

```
Steps:
1. Query provider_keys WHERE provider = $1 AND status = 'ACTIVE'
   AND is_emergency_reserve = FALSE AND remaining_credits > 1.00
   ORDER BY remaining_credits DESC LIMIT 1.
2. If found → decrypt api_key_encrypted in-memory, return key.
3. If no active keys → check emergency reserve:
   Query WHERE provider = $1 AND is_emergency_reserve = TRUE AND status = 'ACTIVE'.
   If found → log CRITICAL event, return key.
4. If nothing → throw 503 "No available keys for provider".
```

Function: `releaseKey(keyId: string, creditsUsed: number)`

```
Steps:
1. Atomically decrement remaining_credits in Redis counter.
2. Update last_used timestamp.
3. If remaining_credits <= 0 → set status = 'EXHAUSTED', set archived_at = NOW().
4. Sync to PostgreSQL in background (eventual consistency OK for credits).
```

Function: `markKeyUnhealthy(keyId: string, reason: string)`

```
Steps:
1. Set status = 'ERROR' in DB.
2. Feed into circuit breaker.
3. Log with reason.
```

### 8.3 Credit Tracker (`src/services/credit-tracker.ts`)

Function: `checkBalance(userId: string): boolean`

```
Steps:
1. Read users.balance from DB (or Redis cache with short TTL).
2. Return balance > 0.00.
3. If false → caller returns 402 Payment Required.
```

Function: `deductCredits(userId, requestId, tokensInput, tokensOutput, modelMapping)`

```
Steps:
1. Calculate user_charge:
   charge = (tokensInput / 1_000_000 * pricing_input) + (tokensOutput / 1_000_000 * pricing_output)
2. Calculate upstream_cost from provider's actual pricing.
3. Generate idempotency_key: `req_${requestId}_deduction`.
4. In a PostgreSQL transaction:
   a. Check idempotency_key doesn't exist in usage_ledger.
   b. UPDATE users SET balance = balance - charge WHERE id = userId AND balance >= charge.
      If affected rows = 0 → insufficient balance, return error.
   c. INSERT into usage_ledger (amount = -charge, balance_after, type = 'api_usage').
   d. INSERT into request_logs (all metadata).
5. Return { user_charge, upstream_cost, margin: user_charge - upstream_cost }.
```

Function: `deductStreamingCredits(userId, requestId, chunkTokens, modelMapping)`

```
For streaming: called incrementally as chunks arrive.
1. Accumulate token counts in Redis: `stream_tokens:{requestId}`.
2. After final chunk → call deductCredits() with total accumulated tokens.
3. If user balance hits 0 mid-stream:
   a. Check balance in Redis atomic counter.
   b. If depleted → signal the stream proxy to terminate.
   c. Send SSE error event: { error: { message: "Insufficient balance", type: "billing_error" } }
   d. Abort upstream request via AbortController.
```

### 8.4 Circuit Breaker (`src/services/circuit-breaker.ts`)

```
State tracked in Redis per provider and per key:
- Key: `cb:{provider}:{keyId}` or `cb:{provider}:global`
- Value: { failures: number, lastFailure: timestamp, state: 'closed' | 'open' | 'half-open' }

Function: isOpen(provider, keyId?) → boolean
  - If failures >= 5 within last 5 minutes → state = 'open', return true.
  - After cooldown (10 min) → state = 'half-open', allow 1 probe request.

Function: recordFailure(provider, keyId)
  - INCR failure count in Redis with 5-minute TTL window.
  - If threshold hit → open circuit, log alert.

Function: recordSuccess(provider, keyId)
  - Reset failure counter.
  - If state was 'half-open' → close circuit.
```

### 8.5 Request Logger (`src/services/request-logger.ts`)

Function: `logRequest(data: RequestLogData): void`

```
Writes to request_logs and usage_ledger tables.
- All writes are idempotent (idempotency_key UNIQUE constraint).
- Never stores message content (prompts/completions).
- Only metadata: tokens, cost, latency, model, provider, status.
```

### 8.6 Billing Service (`src/services/billing.ts`)

Function: `createCheckoutSession(userId, amount)`

```
1. Validate amount >= MIN_TOPUP_AMOUNT ($5).
2. Create Stripe Checkout session with:
   - mode: 'payment'
   - metadata: { user_id, idempotency_key: `topup_${userId}_${timestamp}` }
   - success_url, cancel_url
3. Return checkout URL.
```

Function: `handleWebhook(rawBody, signature)`

```
1. Verify Stripe webhook signature (stripe.webhooks.constructEvent).
2. Extract event type.
3. If 'checkout.session.completed':
   a. Extract user_id, amount, idempotency_key from metadata.
   b. PostgreSQL transaction:
      - Check idempotency_key not in usage_ledger.
      - UPDATE users SET balance = balance + amount.
      - INSERT usage_ledger (amount = +amount, type = 'topup').
   c. Return 200 immediately.
4. Ignore other event types gracefully (return 200).
```

File: `src/config/constants.ts`

```ts
export const CONSTANTS = {
  KEY_CREDIT_CAP: 50.00,
  MIN_BALANCE_THRESHOLD: 0.00,     // Reject if balance <= this
  MIN_TOPUP_AMOUNT: 5.00,
  MAX_RETRIES: 3,
  RETRY_BACKOFF_MS: [500, 1500, 4500],
  CIRCUIT_BREAKER_THRESHOLD: 5,    // consecutive failures
  CIRCUIT_BREAKER_COOLDOWN_MS: 10 * 60 * 1000,  // 10 minutes
  STREAM_TIMEOUT_MS: 5 * 60 * 1000,  // 5 minutes
  NON_STREAM_TIMEOUT_MS: 60 * 1000,  // 60 seconds
  IDEMPOTENCY_TTL_SECONDS: 86400,    // 24 hours
  BALANCE_SYNC_INTERVAL_MS: 5 * 60 * 1000,  // 5 minutes
```

---

## 9. Provider Adapter System

### 9.1 Interface (`src/types/provider.ts`)

```ts
export interface ProviderAdapter {
  provider: string;                   // e.g., 'openrouter', 'together', 'openai'
  baseUrl: string;                    // e.g., 'https://openrouter.ai/api/v1'

  normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest;
  denormalizeResponse(response: ProviderNativeResponse): OpenAIChatResponse;
  denormalizeStreamChunk(chunk: string): OpenAIStreamChunk | null;
  mapError(statusCode: number, body: unknown): OpenAIError;
  supportsModel(model: string): boolean;
  estimateCost(model: string, inputTokens: number, outputTokens: number): number;
}
```

### 9.2 Base Adapter (`src/providers/base-adapter.ts`)

Abstract class implementing shared logic:

- Default `normalizeRequest`: pass through as-is (works for OpenAI-compatible providers like OpenRouter, Together, Groq).
- Default `denormalizeResponse`: pass through (already OpenAI format).
- Default `denormalizeStreamChunk`: parse `data: {...}` SSE lines, pass through.
- Default `mapError`: map common HTTP codes (429→rate_limit, 5xx→server_error, 401→auth_error).
- Override only what differs per provider.

### 9.3 Provider-Specific Adapters

| Provider | File | Key Overrides |
|----------|------|---------------|
| OpenRouter | `openrouter.ts` | `baseUrl`, add `HTTP-Referer` and `X-Title` headers |
| Together AI | `together.ts` | `baseUrl` only (already OpenAI-compatible) |
| Groq | `groq.ts` | `baseUrl` only |
| OpenAI | `openai.ts` | `baseUrl` only (native format) |
| Anthropic | `anthropic.ts` | **Full override** — different message format, system prompt handling, `x-api-key` header instead of `Bearer`, different streaming chunk format, `max_tokens` required |
| Gemini | `gemini.ts` | **Full override** — different endpoint structure, message format, `maxOutputTokens`, different streaming format |

### 9.4 Provider Registry (`src/providers/registry.ts`)

```ts
// Map of provider name → adapter instance
const registry: Map<string, ProviderAdapter> = new Map([
  ['openrouter', new OpenRouterAdapter()],
  ['together', new TogetherAdapter()],
  ['groq', new GroqAdapter()],
  ['openai', new OpenAIAdapter()],
  ['anthropic', new AnthropicAdapter()],
  ['gemini', new GeminiAdapter()],
]);

export function getAdapter(provider: string): ProviderAdapter {
  const adapter = registry.get(provider);
  if (!adapter) throw new Error(`No adapter registered for provider: ${provider}`);
  return adapter;
}
```

---

## 10. Route Implementations

### 10.1 Health Check (`src/routes/health.ts`)

```
GET /health
→ 200 { status: 'ok', uptime: process.uptime(), timestamp: Date.now() }
No auth required.
```

### 10.2 Chat Completions (`src/routes/v1/chat-completions.ts`)

**This is the critical path — the core of the entire gateway.**

```
POST /v1/chat/completions
Middleware: [authenticateUser, rateLimiter]

Handler Flow:
1. VALIDATE request body with Zod (OpenAIChatRequestSchema).
   - Required: model, messages
   - Optional: stream (default false), temperature, max_tokens, top_p, etc.
   - Reject unknown fields.

2. RESOLVE MODEL
   - Call modelMapper.resolveModel(body.model).
   - If null → 404 model_not_found error.

3. CHECK BALANCE
   - Call creditTracker.checkBalance(user.id).
   - If false → 402 Payment Required.

4. ACQUIRE PROVIDER KEY
   - Call keyPool.acquireKey(mapping.provider).
   - If none → 503 Service Unavailable.

5. CHECK CIRCUIT BREAKER
   - Call circuitBreaker.isOpen(mapping.provider, providerKey.id).
   - If open → release key, try next key (up to MAX_RETRIES).

6. GET ADAPTER
   - Call getAdapter(mapping.provider).

7. NORMALIZE REQUEST
   - Call adapter.normalizeRequest(body) with provider_model_id.

8. DISPATCH UPSTREAM REQUEST
   - Create AbortController.
   - Set timeout (STREAM_TIMEOUT or NON_STREAM_TIMEOUT).
   - Listen for client disconnect → abort upstream.
   - Make fetch() to provider baseUrl with decrypted key.
   - Record start time for latency.

9. HANDLE RESPONSE
   If non-streaming:
     a. Parse response JSON.
     b. adapter.denormalizeResponse() → OpenAI format.
     c. Extract usage (input/output tokens).
     d. deductCredits() → record billing.
     e. releaseKey() with upstream cost.
     f. circuitBreaker.recordSuccess().
     g. Return OpenAI JSON response.

   If streaming:
     a. Set response headers: Content-Type: text/event-stream, Cache-Control: no-cache.
     b. Pipe upstream response through Transform stream:
        - Parse each SSE line.
        - adapter.denormalizeStreamChunk() → OpenAI delta chunk.
        - Track token count from chunks.
        - Periodically check user balance (every N chunks).
        - If balance depleted → abort + send error SSE + close.
        - Write normalized chunk to client.
     c. On stream end ([DONE]):
        - Finalize token count.
        - deductCredits() with final totals.
        - releaseKey() with upstream cost.
        - circuitBreaker.recordSuccess().
        - Send `data: [DONE]` to client.
        - Close response.

10. ERROR HANDLING (per-request)
    - If upstream returns 4xx/5xx:
      a. adapter.mapError() → OpenAI error format.
      b. If retryable (429, 5xx, timeout):
         - markKeyUnhealthy() or just circuit breaker.
         - Retry with next key (up to MAX_RETRIES with backoff).
      c. If non-retryable (400, 401, 403):
         - Return error to client immediately.
    - If all retries exhausted → 502 Bad Gateway.
```

### 10.3 User Dashboard API (`src/routes/api/user/`)

All routes protected by `authenticateSession` middleware (JWT session).

| Route | Method | Handler |
|-------|--------|---------|
| `/api/user/me` | GET | Return current user profile, balance, status |
| `/api/user/usage` | GET | Aggregated usage by day/month for charts (query params: `period`, `model`) |
| `/api/user/usage/:requestId` | GET | Single request metadata (tokens, cost, latency — no content) |
| `/api/user/ledger` | GET | Personal `usage_ledger` entries (paginated) |
| `/api/user/api-keys` | GET | List user’s API keys (masked — name + last4 only) |
| `/api/user/api-keys` | POST | Generate new API key: `sk_live_${nanoid(32)}`, HMAC hash, return raw key **once** |
| `/api/user/api-keys/:id` | DELETE | Revoke key (set status = 'revoked') |
| `/api/user/top-up` | POST | Body: `{ amount }`. Validate >= $5. Create Stripe Checkout session. Return checkout URL. |
| `/api/user/invoices` | GET | Billing history / invoice list from Stripe |

### 10.4 Webhook Routes (`src/routes/webhooks/`)

No session auth — protected by signature verification.

**Stripe Webhook** (`stripe.ts`):
```
POST /webhooks/stripe
1. Fastify must NOT parse body (raw Buffer for signature verification).
2. Verify Stripe webhook signature (stripe.webhooks.constructEvent).
3. If 'checkout.session.completed':
   a. Extract user_id, amount, idempotency_key from metadata.
   b. PostgreSQL transaction:
      - Check idempotency_key not in usage_ledger.
      - UPDATE users SET balance = balance + amount.
      - INSERT usage_ledger (amount = +amount, type = 'topup').
   c. Return 200 immediately.
4. Ignore other event types gracefully (return 200).
```

**Clerk Webhook** (`clerk.ts`):
```
POST /webhooks/clerk
1. Verify Clerk webhook signature (svix).
2. If 'user.created':
   a. Extract email, clerkUserId from payload.
   b. INSERT into users (email, balance = 0.00, status = 'active', clerk_id).
   c. Return 200.
3. If 'user.deleted':
   a. Set user status = 'deleted'.
   b. Revoke all API keys.
   c. Return 200.
```

### 10.5 Admin Routes (`src/routes/admin/`)

All protected by `authenticateAdmin` middleware.

| Route | Method | Handler |
|-------|--------|---------|
| `/admin/provider-keys` | POST | Add new encrypted key to pool |
| `/admin/provider-keys` | GET | List all keys (masked, never raw) |
| `/admin/provider-keys/:id/rotate` | PATCH | Archive old key, provision new |
| `/admin/provider-keys/:id/status` | PATCH | Set ACTIVE/ERROR/EXHAUSTED |
| `/admin/provider-keys/:id` | DELETE | Soft delete (archive) |
| `/admin/model-mappings` | POST | Add model alias → provider mapping |
| `/admin/model-mappings` | GET | List all mappings |
| `/admin/model-mappings/:id` | PATCH | Update pricing, provider_model_id, status |
| `/admin/model-mappings/:id` | DELETE | Remove mapping |
| `/admin/users` | GET | List users with balance + status |
| `/admin/users/:id/suspend` | PATCH | Set status = 'suspended' |
| `/admin/users/:id/unsuspend` | PATCH | Set status = 'active' |
| `/admin/users/:id/usage` | GET | Query request_logs for user |
| `/admin/margins` | GET | Query: `?period=daily\|weekly\|monthly` |
| `/admin/ledgers` | GET | Full ledger browser: `?user_id=xxx&limit=100` |
| `/admin/balance-reconciliations` | GET | Balance sync discrepancy reports |
| `/admin/health/providers` | GET | Provider status + latency |
| `/admin/health/keys` | GET | Key pool stats per provider |
| `/admin/health/queues` | GET | BullMQ queue depths |
| `/admin/emergency/drain-provider` | POST | Set all keys for provider → ROTATING |
| `/admin/emergency/rotate-all-keys` | POST | Force archive + replace all keys |

---

## 11. Streaming Implementation (`src/utils/streaming.ts`)

```ts
// SSE Transform stream factory:
// createStreamTransform(adapter, abortController, onChunk)
//
// 1. Receives raw upstream SSE bytes.
// 2. Splits on newlines, buffers partial lines.
// 3. For each complete `data: ...` line:
//    a. If `data: [DONE]` → push [DONE], end stream.
//    b. Parse JSON.
//    c. Call adapter.denormalizeStreamChunk(parsed).
//    d. Call onChunk(normalized) for token tracking.
//    e. Write `data: ${JSON.stringify(normalized)}\n\n` to output.
// 4. If AbortController signals → destroy stream gracefully.
```

**Client disconnect handling:**
```ts
// In the route handler:
request.raw.on('close', () => {
  abortController.abort();
  // Stream transform will detect abort and clean up.
});
```

---

## 12. Crypto Utilities

### 12.1 Encryption (`src/crypto/encryption.ts`)

```
AES-256-GCM for provider keys.

encrypt(plaintext: string, masterKey: Buffer): Buffer
1. Generate random 16-byte IV.
2. Derive per-key DEK from masterKey using HKDF.
3. Create cipher: crypto.createCipheriv('aes-256-gcm', dek, iv).
4. Encrypt plaintext.
5. Get auth tag (16 bytes).
6. Return: Buffer.concat([iv, authTag, ciphertext]).

decrypt(encrypted: Buffer, masterKey: Buffer): string
1. Extract iv (first 16 bytes), authTag (next 16), ciphertext (rest).
2. Derive DEK from masterKey using HKDF.
3. Create decipher with iv and authTag.
4. Decrypt and return plaintext.
5. Overwrite plaintext buffer with zeros after use (best effort).
```

### 12.2 HMAC (`src/crypto/hmac.ts`)

```
hashApiKey(rawKey: string, pepper: string): string
1. Return crypto.createHmac('sha256', pepper).update(rawKey).digest('hex').

verifyApiKey(rawKey: string, storedHash: string, pepper: string): boolean
1. Compute hash of rawKey.
2. Use crypto.timingSafeEqual to compare (prevents timing attacks).
```

---

## 13. Background Workers (`src/workers/`)

All workers use BullMQ with the shared Redis connection.

### 13.1 Worker Bootstrap (`src/workers/index.ts`)

```
1. Create BullMQ queues:
   - 'health-check'    (repeat: every 60s)
   - 'balance-sync'    (repeat: every 5 min)
   - 'key-cleanup'     (repeat: every 10 min)
   - 'analytics'       (repeat: every 15 min)
   - 'margin-report'   (repeat: daily at 00:00 UTC)
   - 'data-retention'  (repeat: daily at 02:00 UTC)
2. Create Worker instances for each queue.
3. Handle graceful shutdown (worker.close()).
```

### 13.2 Health Checker (`health-checker.ts`)

```
Every 60 seconds:
1. For each active provider in model_mappings:
   a. Send lightweight test request (e.g., list models endpoint or minimal chat).
   b. Record latency.
   c. If failure → circuitBreaker.recordFailure().
   d. If success → circuitBreaker.recordSuccess().
2. Store results in Redis: `health:{provider}` with TTL 120s.
```

### 13.3 Balance Reconciler (`balance-reconciler.ts`)

```
Every 5 minutes:
1. For each active provider key:
   a. If provider has a balance-check API → call it.
   b. Compare reported balance vs. internal remaining_credits.
   c. If discrepancy > 1% → log WARNING, update internal credits.
2. For each user:
   a. Compare users.balance vs SUM(usage_ledger.amount).
   b. If mismatch → log CRITICAL, create 'adjustment' ledger entry.
```

### 13.4 Key Cleaner (`key-cleaner.ts`)

```
Every 10 minutes:
1. Query provider_keys WHERE remaining_credits <= 0 AND status != 'EXHAUSTED'.
2. Set status = 'EXHAUSTED', archived_at = NOW().
3. Log archived key count.
```

### 13.5 Analytics Aggregator (`analytics-aggregator.ts`)

```
Every 15 minutes:
1. Roll up per-user/per-model stats into time-series summary.
2. Pre-compute dashboard chart data (token burn, latency percentiles, model breakdown).
3. Store in Redis or a reports table for fast dashboard reads.
```

### 13.6 Margin Reporter (`margin-reporter.ts`)

```
Daily at 00:00 UTC:
1. Query request_logs for the past period.
2. Aggregate: total_upstream_cost, total_user_charges, total_margin.
3. Group by provider, model.
4. Store report (could be in a reports table or just structured log).
```

### 13.7 Data Retention Enforcer (`data-retention.ts`)

```
Daily at 02:00 UTC:
1. DELETE FROM request_logs WHERE created_at < NOW() - INTERVAL '90 days'
   AND idempotency_key NOT IN (usage_ledger references).
   (Metadata-only logs purged after 90 days.)
2. Purge any opt-in content logs older than 30 days.
3. Archive immutable ledger entries older than 7 years to cold storage.
4. Log purge counts.
```

---

## 14. Error Handling (`src/utils/errors.ts`)

All errors returned to clients MUST be in OpenAI-compatible format:

```ts
// Error response structure:
{
  error: {
    message: string,
    type: 'invalid_request_error' | 'authentication_error' | 'rate_limit_error'
         | 'billing_error' | 'server_error' | 'not_found_error',
    code: string | null,     // e.g., 'model_not_found', 'insufficient_balance'
    param: string | null     // e.g., 'model', 'messages'
  }
}

// HTTP status code mapping:
400 → invalid_request_error
401 → authentication_error
402 → billing_error (insufficient balance)
403 → authentication_error (suspended)
404 → not_found_error
429 → rate_limit_error
500 → server_error
502 → server_error (upstream failure)
503 → server_error (no keys available)
```

Fastify global error handler (`setErrorHandler`) catches all uncaught errors and normalizes them.

---

## 15. Types (`src/types/`)

### `openai.ts`
```ts
// Define Zod schemas + inferred types for:
OpenAIChatRequest {
  model: string
  messages: Array<{ role: 'system'|'user'|'assistant', content: string }>
  stream?: boolean
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string | string[]
}

OpenAIChatResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{ index, message: { role, content }, finish_reason }>
  usage: { prompt_tokens, completion_tokens, total_tokens }
}

OpenAIStreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{ index, delta: { role?, content? }, finish_reason }>
}
```

### `common.ts`
```ts
RequestContext {
  requestId: string
  user: { id, email, balance }
  apiKey: { id, rate_limit_rpm, rate_limit_tokens_day }
  startTime: number   // performance.now()
}
```

---

## 16. Deployment

### Dockerfile (API — `apps/api/Dockerfile`)

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # tsc → dist/

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### docker-compose.yml (Local Dev — root)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fluxai
      POSTGRES_USER: fluxai
      POSTGRES_PASSWORD: local_dev_password
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### NPM Scripts (Root `package.json`)

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "db:generate": "turbo db:generate --filter=api",
    "db:migrate": "turbo db:migrate --filter=api"
  }
}
```

### NPM Scripts (API — `apps/api/package.json`)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "workers": "tsx src/workers/index.ts",
    "lint": "eslint src/",
    "test": "vitest"
  }
}
```

### NPM Scripts (Web — `apps/web/package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 17. Key Dependencies

### API (`apps/api`)

```json
{
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "^10.0.0",
    "@fastify/helmet": "^12.0.0",
    "drizzle-orm": "^0.35.0",
    "pg": "^8.13.0",
    "ioredis": "^5.4.0",
    "bullmq": "^5.0.0",
    "zod": "^3.23.0",
    "pino": "^9.0.0",
    "stripe": "^17.0.0",
    "nanoid": "^5.0.0",
    "@clerk/backend": "^1.0.0",
    "svix": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.0.0",
    "drizzle-kit": "^0.27.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.0.0"
  }
}
```

### Web (`apps/web`)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@clerk/nextjs": "^6.0.0",
    "@tanstack/react-query": "^5.0.0",
    "recharts": "^2.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.400.0"
  }
}
```

### Root

```json
{
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

---

## 18. Implementation Order

Build in this exact sequence to ensure each layer has its dependencies ready:

### Phase 1–3: Backend Core

| Step | Files (`apps/api/src/`) | Depends On |
|------|------------------------|------------|
| 1 | `config/env.ts`, `config/constants.ts` | Nothing |
| 2 | `db/schema.ts`, `db/client.ts`, migrations | Step 1 |
| 3 | `redis/client.ts` | Step 1 |
| 4 | `crypto/encryption.ts`, `crypto/hmac.ts` | Step 1 |
| 5 | `types/openai.ts`, `types/provider.ts`, `types/common.ts` | Nothing |
| 6 | `utils/errors.ts`, `utils/id.ts`, `utils/cost.ts` | Step 5 |
| 7 | `middleware/*` (request-id, auth, session-auth, admin-auth, rate-limiter) | Steps 2-4 |
| 8 | `providers/base-adapter.ts`, all provider adapters, `providers/registry.ts` | Step 5 |
| 9 | `services/provider-mapper.ts`, `services/key-pool.ts`, `services/circuit-breaker.ts` | Steps 2, 3, 4, 8 |
| 10 | `services/balance.ts`, `services/ledger.ts` | Steps 2, 3 |
| 11 | `utils/streaming.ts`, `services/stream-proxy.ts` | Steps 5, 8 |
| 12 | `routes/health.ts` | Nothing |
| 13 | `routes/v1/chat-completions.ts` | Steps 7-11 (the critical path) |
| 14 | `routes/api/user/*` (dashboard API) | Steps 2, 4, 7 |
| 15 | `routes/webhooks/*` (Stripe, Clerk) | Steps 2, 7 |
| 16 | `services/billing.ts` | Steps 2, 7 |
| 17 | `routes/admin/*` | Steps 2, 7, 9, 10 |
| 18 | `workers/*` | Steps 2, 3, 9, 10 |
| 19 | `app.ts`, `index.ts` | Everything |

### Phase 4: Frontend (after backend API is stable)

| Step | Files (`apps/web/`) | Depends On |
|------|---------------------|------------|
| 20 | Monorepo setup: `turbo.json`, root `package.json`, `packages/shared/` | Nothing |
| 21 | Next.js scaffold, Tailwind + shadcn/ui setup, Clerk integration | Step 20 |
| 22 | `(marketing)/*` — Landing, Pricing, Models, Status pages | Step 21 |
| 23 | `(auth)/*` — Login, Register, Verify, Reset pages | Step 21 |
| 24 | `(docs)/*` — Docs home, Quickstart, API Reference, SDKs | Step 21 |
| 25 | `dashboard/*` — Overview, Usage, Billing, API Keys pages | Steps 14, 21 |
| 26 | `settings/*` — Profile, Security, Notifications | Steps 14, 21 |
| 27 | `help/*` — Support, Contact, Debug logging | Step 21 |
| 28 | `admin/*` — Full admin dashboard (all 11 pages) | Steps 17, 21 |

---

## 19. Testing Strategy

| Layer | Tool | What to Test |
|-------|------|-------------|
| Unit | Vitest | Provider adapters (normalize/denormalize), cost calculations, HMAC/encryption, error formatting |
| Integration | Vitest + Testcontainers | DB operations, Redis operations, full request lifecycle with mocked upstream |
| E2E | Vitest + real local stack | Full `/v1/chat/completions` flow, auth, billing, rate limiting |
| Load | k6 or autocannon | Target 500 concurrent connections, measure p99 latency, verify no memory leaks |

---

## 20. Critical Design Decisions

1. **No ORM query caching** — Drizzle executes raw SQL. Cache hot paths (model mappings, rate limits) explicitly in Redis.
2. **Stateless API servers** — All state lives in PostgreSQL + Redis. Any server instance can handle any request. Enables horizontal scaling.
3. **Credits in Redis + PostgreSQL** — Redis for fast atomic decrements during requests. PostgreSQL as source of truth. Background reconciliation ensures consistency.
4. **No pre-flight cost estimation** — Only check `balance > 0`. Deduct actual cost after response. Terminate streams if balance depletes mid-stream.
5. **Provider keys decrypted only in-memory** — Never logged, never cached in Redis. Decrypt → use → zero-fill.
6. **Immutable ledgers** — `request_logs` and `usage_ledger` are append-only. No UPDATEs or DELETEs. Financial audit trail.
7. **Dual auth system** — API key auth (`sk_live_xxx` via HMAC) for programmatic `/v1/*` access. Session auth (Clerk JWT) for dashboard `/api/user/*` access. Completely separate auth paths.
8. **Monorepo with Turborepo** — `apps/api` (Fastify) and `apps/web` (Next.js) share types and schemas via `packages/shared`. Parallel builds and dev servers.
9. **Frontend SSE for real-time** — Dashboard uses `/api/user/events` SSE endpoint for live balance updates and usage notifications instead of WebSocket.

---

## 21. Route Summary

| Surface | Count |
|---------|-------|
| Public Inference API (`/v1/*`) | 1 |
| User Dashboard API (`/api/user/*`) | 9 |
| Admin API (`/admin/*`) | 21 |
| Webhooks (`/webhooks/*`) | 2 |
| Health | 1 |
| **Backend Total** | **34** |
| Marketing / Public Pages | 9 |
| Auth Pages | 5 |
| User Dashboard Pages | 10 |
| User Settings Pages | 5 |
| Help Center Pages | 3 |
| Admin Dashboard Pages | 11 |
| **Frontend Total** | **43** |
| **Grand Total** | **77 routes/endpoints** |

