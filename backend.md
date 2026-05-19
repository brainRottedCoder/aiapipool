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
| Auth | NextAuth.js (Auth.js v5) | OAuth (Google, GitHub) + Credentials, JWT sessions with database strategy, instant revocation |
| API Client | tRPC or typed REST client | Type-safe calls to Fastify backend |

### 1.3 Infrastructure

| Layer | Technology |
|-------|------------|
| Reverse Proxy / Edge | Cloudflare (WAF, DDoS, SSL, DNS) |
| API Hosting | Azure Container Apps (Docker) |
| Secrets | Azure Key Vault |
| Frontend Hosting | Vercel (Next.js) |
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
│   │   │   │   │       ├── events.ts    # GET /api/user/events (SSE stream)
│   │   │   │   │       ├── api-keys.ts  # GET/POST/DELETE /api/user/api-keys
│   │   │   │   │       ├── top-up.ts    # POST /api/user/top-up
│   │   │   │   │       └── invoices.ts  # GET /api/user/invoices
│   │   │   │   ├── webhooks/
│   │   │   │   │   └── stripe.ts        # POST /webhooks/stripe
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

**Azure Key Vault Integration (Production):**
If `AZURE_KEY_VAULT_URL` is set, the app must fetch `MASTER_ENCRYPTION_KEY` from Azure Key Vault at startup using `@azure/identity` (`DefaultAzureCredential`) before Zod validation. Fallback to env var for local development.

```ts
// src/config/env.ts
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

  // Auth (NextAuth)
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Azure
  AZURE_KEY_VAULT_URL: z.string().url().optional(),

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
| `users` | `id` (UUID PK), `email` (unique), `password_hash` (TEXT, nullable), `emailVerified` (TIMESTAMP, nullable), `balance` (decimal 12,4), `status`, `role` (enum: user, admin, default: 'user'), `created_at` | Balance is the source of truth for credit checks. `password_hash` for Credentials provider. `emailVerified` required by NextAuth adapter. First admin must be promoted manually via SQL. |
| `apiKeys` | `id` (UUID PK), `userId` (FK→users), `hashed_key`, `key_prefix` (varchar(12)), `name`, `rate_limit_rpm`, `rate_limit_tokens_day`, `status`, `created_at` | Store HMAC hash only. `key_prefix` stores first 12 chars (e.g. `sk_live_abcd...`) for dashboard display. Full raw key shown **once** at creation. |
| `providerKeys` | `id` (UUID PK), `provider`, `api_key_encrypted` (bytea), `initial_credits`, `remaining_credits`, `status` (ACTIVE/EXHAUSTED/ERROR/ROTATING), `is_emergency_reserve`, `last_used`, `created_at`, `archived_at` | Encrypted with AES-256-GCM |
| `modelMappings` | `id` (UUID PK), `model_alias` (unique), `provider`, `provider_model_id`, `pricing_input`, `pricing_output`, `capabilities` (jsonb), `status`, `created_at` | 1:1 mapping, no priority/fallback |
| `requestLogs` | `id` (UUID PK), `user_id`, `api_key_id`, `provider_key_id`, `provider`, `model`, `tokens_input`, `tokens_output`, `upstream_cost`, `user_charge`, `margin`, `latency_ms`, `status`, `idempotency_key` (unique), `created_at` | Immutable. Indexed on `(user_id, created_at DESC)` and `idempotency_key` |
| `usageLedger` | `id` (UUID PK), `user_id`, `request_log_id`, `amount`, `balance_after`, `type` (api_usage/topup/refund/adjustment), `idempotency_key` (unique), `created_at` | Immutable financial ledger. Indexed on `(user_id, created_at DESC)` |
| `accounts` | `id` (UUID PK), `userId` (FK→users), `type`, `provider`, `providerAccountId` (unique composite with `provider`), `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state` | NextAuth OAuth account linking. Composite unique: (`provider`, `providerAccountId`) |
| `sessions` | `id` (UUID PK), `sessionToken` (unique), `userId` (FK→users), `expires` | NextAuth database session strategy |
| `verificationTokens` | `identifier`, `token`, `expires` | NextAuth email/password verification. Composite PK: (`identifier`, `token`) |

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
//    - trustProxy: true (required behind Cloudflare + Azure Container Apps ingress)
//    - bodyLimit: 2MB (prevent payload abuse; large prompts with many messages may exceed 1MB)
//    - requestIdHeader: 'x-request-id'
// 2. Register plugins:
//    - @fastify/cors (origin: process.env.NEXTAUTH_URL, credentials: true, allowedHeaders: ['Authorization', 'X-Admin-Key', 'X-Request-ID', 'Content-Type'])
//    - @fastify/helmet (security headers)
// 3. Register global hooks:
//    - onRequest: attach requestId to logger context
// 4. Register route modules:
//    - /health
//    - /v1/* (chat completions — API key auth)
//    - /api/user/* (dashboard API — session auth)
//    - /webhooks/* (Stripe — signature verification)
//    - /admin/* (all admin routes, guarded by admin-auth)
// Note: Node.js 20+ native fetch() is used for all upstream HTTP requests.
// No additional HTTP client (axios, node-fetch) is required.
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
1. Extract session token from:
   a. `Cookie: next-auth.session-token` header (same-domain / subdomain setup)
   b. `Authorization: Bearer <token>` header (cross-domain: Vercel → Azure)
   c. If neither present → 401
2. Query sessions table WHERE sessionToken = token AND expires > NOW().
3. If not found or expired → 401 { error: { message: "Invalid or expired session", type: "authentication_error" } }
4. Extract userId from session record.
5. Query users table to get user record.
6. If user.status !== 'active' → 403 { error: { message: "Account suspended" } }
7. Attach { user } to request context.
```

**Cross-Domain Note:**
When frontend (Vercel) and API (Azure) are on different domains, cookies are not sent automatically. The frontend must pass the session token in the `Authorization: Bearer <token>` header. The `@fastify/cors` plugin must be configured with `credentials: true` and `origin: process.env.NEXTAUTH_URL` to allow cookie-based auth for local development or shared-domain deployments.

### 7.4 Admin Auth (`src/middleware/admin-auth.ts`)

Function: `authenticateAdmin` — Fastify `preHandler` for `/admin/*`.

```
Steps:
1. Read X-Admin-Key header OR validate NextAuth session with isAdmin role.
2. If X-Admin-Key: constant-time compare against env.ADMIN_API_KEY (use crypto.timingSafeEqual).
3. If session auth: call authenticateSession(), then check user.role === 'admin'.
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

**Token-Per-Day Limits:**
RPM and concurrent limits are enforced **pre-flight** (before upstream request). The `tokens/day` limit is checked **asynchronously after request completion** by accumulating `tokens_input + tokens_output` in Redis (`rl:tpd:{apiKeyId}`). If the limit is exceeded, subsequent requests are blocked until the daily window resets.

---

## 8. Core Services

### 8.1 Provider Mapper (`src/services/provider-mapper.ts`)

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

### 8.3 Balance Service (`src/services/balance.ts`)

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

### 8.5 Ledger Service (`src/services/ledger.ts`)

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

### 8.7 Concurrency & Safety Model

- **Request reservations:** Before dispatching upstream, estimate the token cost and reserve/deduct it from the user's balance in Redis. If the request fails or uses fewer tokens, refund the difference.
- **Distributed Locks:** Use Redlock (Redis) during provider key rotation to prevent race conditions where multiple requests try to rotate the same exhausted key simultaneously.
- **Serializable Transactions:** PostgreSQL transactions for ledger writes (`usage_ledger` and `request_logs`) must use `SERIALIZABLE` isolation level to prevent race conditions during billing updates.

### 8.8 PRD Service Mapping Notes

- `RateLimitService` is implemented entirely within middleware (`src/middleware/rate-limiter.ts`).
- `EncryptionService` is implemented as utility functions (`src/crypto/encryption.ts`).
- `StripeWebhookService` is handled within the Billing Service (`src/services/billing.ts`).

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
};
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
| `/api/user/events` | GET | SSE stream for live balance updates & usage notifications |
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

### 10.6 User Events SSE (`src/routes/api/user/events.ts`)

`GET /api/user/events`
Middleware: `[authenticateSession]`

Handler Flow:
1. Validate session via `authenticateSession`.
2. Set response headers: `Content-Type: text/event-stream; charset=utf-8`, `Cache-Control: no-cache`, `Connection: keep-alive`.
3. Subscribe to Redis pub/sub channel: `user_events:{userId}`.
4. On message received:
   - Parse JSON event payload.
   - Write `data: ${JSON.stringify(event)}\n\n` to response stream.
5. Send heartbeat: `data: {"type":"heartbeat"}\n\n` every 30 seconds.
6. On client disconnect (`request.raw.on('close')`):
   - Unsubscribe from Redis channel.
   - End response stream gracefully.

**Event Types:**
- `balance_update` — Triggered after Stripe top-up or usage deduction
- `key_rotation` — Triggered when provider key is rotated
- `outage_alert` — Triggered by circuit breaker when provider fails

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
    volumes: [redisdata:/data]

volumes:
  pgdata:
  redisdata:
```

### Azure Deployment (Production)

**API Hosting: Azure Container Apps**

```yaml
# azure/containerapp.yaml (Bicep/ARM equivalent)
apiVersion: 2023-05-01
kind: ContainerApp
properties:
  configuration:
    ingress:
      external: true
      targetPort: 3000
      transport: auto
    secrets:
      - name: master-encryption-key
        keyVaultUrl: https://<vault>.vault.azure.net/secrets/master-encryption-key
        identity: system
      - name: database-url
        keyVaultUrl: https://<vault>.vault.azure.net/secrets/database-url
        identity: system
      - name: redis-url
        keyVaultUrl: https://<vault>.vault.azure.net/secrets/redis-url
        identity: system
  template:
    containers:
      - name: fluxai-api
        image: <acr>.azurecr.io/fluxai-api:latest
        env:
          - name: NODE_ENV
            value: production
          - name: DATABASE_URL
            secretRef: database-url
          - name: REDIS_URL
            secretRef: redis-url
          - name: MASTER_ENCRYPTION_KEY
            secretRef: master-encryption-key
        resources:
          cpu: 1.0
          memory: 2.0Gi
    scale:
      minReplicas: 2
      maxReplicas: 10
```

**Secrets: Azure Key Vault**

- `MASTER_ENCRYPTION_KEY` — AES-256-GCM master key
- `API_KEY_PEPPER` — HMAC-SHA256 pepper
- `ADMIN_API_KEY` — Static admin API key
- `DATABASE_URL` — Azure Database for PostgreSQL Flexible Server connection string
- `REDIS_URL` — Azure Cache for Redis connection string
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`

**Managed Data Services**
- **PostgreSQL**: Azure Database for PostgreSQL Flexible Server (v16)
- **Redis**: Azure Cache for Redis Enterprise (for BullMQ + rate limiting)

**CI/CD Pipeline**
1. GitHub Actions builds Docker image
2. Push to Azure Container Registry (ACR)
3. Azure Container Apps pulls latest image
4. Zero-downtime rolling deployment via revision management

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
    "db:studio": "drizzle-kit studio",  # Interactive GUI for local DB exploration
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
    "bcryptjs": "^2.4.3",
    "next-auth": "^5.0.0",
    "@auth/drizzle-adapter": "^1.0.0",
    "@azure/identity": "^4.0.0",
    "@azure/keyvault-secrets": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsx": "^4.0.0",
    "drizzle-kit": "^0.27.0",
    "vitest": "^2.0.0",
    "eslint": "^9.0.0",
    "@types/node": "^22.0.0",
    "@types/pg": "^8.0.0",
    "@types/bcryptjs": "^2.4.6"
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
    "next-auth": "^5.0.0",
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

## 18. Backend Implementation — 10 Phases

> **Architecture Principle:** Build bottom-up. Each phase is a **vertical slice** that can be tested in isolation before the next phase begins. No phase depends on a later phase. This minimizes integration risk and allows parallel workstreams once contracts are established.

---

### Phase 1: Monorepo & Foundation Layer

**Goal:** Establish the codebase skeleton, validate environment, and define shared contracts.

**Files:**
- `apps/api/package.json` — dependencies, scripts, Docker base
- `packages/shared/src/schemas.ts` — shared Zod schemas (API request/response)
- `packages/shared/src/types.ts` — shared TypeScript types
- `apps/api/src/config/env.ts` — Zod-validated environment variables
- `apps/api/src/config/constants.ts` — app-wide constants (timeouts, retry limits)
- `apps/api/src/types/openai.ts` — OpenAI request/response/chunk Zod schemas
- `apps/api/src/types/provider.ts` — `ProviderAdapter` interface
- `apps/api/src/types/common.ts` — `RequestContext`, shared types
- `apps/api/src/utils/errors.ts` — OpenAI-compatible error factory
- `apps/api/src/utils/id.ts` — nanoid / UUID generators
- `apps/api/src/utils/cost.ts` — token cost calculation helpers

**Senior Engineer Notes:**
- Use `strict: true` TypeScript from day one. Fixing types later is exponentially more expensive.
- Zod schemas in `packages/shared` are consumed by BOTH backend and frontend. This is your API contract.
- `env.ts` must exit with a clear error on startup if any required variable is missing. Never allow the server to boot with a partial config.
- Constants should be environment-overridable where it makes sense (e.g., `STREAM_TIMEOUT_MS` for local testing).

**Deliverable:** `pnpm dev` in the API package starts without errors and validates all env vars.

---

### Phase 2: Database Layer (Schema + Client + Migrations)

**Goal:** Define the data model and establish a working PostgreSQL connection.

**Files:**
- `apps/api/src/db/schema.ts` — All Drizzle table definitions
- `apps/api/src/db/client.ts` — `node-postgres` pool + Drizzle wrapper
- `apps/api/drizzle.config.ts` — Drizzle Kit configuration
- `apps/api/migrations/` — Initial migration files

**Tables to implement:**
- `users`, `apiKeys`, `providerKeys`, `modelMappings`
- `requestLogs`, `usageLedger`
- `accounts`, `sessions`, `verificationTokens` (NextAuth adapter tables)

**Senior Engineer Notes:**
- Use Drizzle's relational query API for joins when possible — it generates optimal SQL and is type-safe.
- Set `pool.max = 20` in `client.ts`. Tune based on Azure PostgreSQL's `max_connections` (default 100). With 2-10 API replicas, 20 per instance is safe.
- Create indexes in the same migration as table creation. Adding indexes to large tables later requires downtime or `CONCURRENTLY` locks.
- Use `decimal` (not `float`) for all monetary fields. Financial precision is non-negotiable.
- The NextAuth tables (`accounts`, `sessions`, `verificationTokens`) must follow `@auth/drizzle-adapter`'s exact column naming conventions or the adapter will fail silently.

**Deliverable:** `pnpm db:migrate` creates all tables successfully. `pnpm db:studio` shows the schema visually.

---

### Phase 3: External Infrastructure (Redis + Key Vault + BullMQ Skeleton)

**Goal:** Establish connections to all external infrastructure before any business logic depends on them.

**Files:**
- `apps/api/src/redis/client.ts` — ioredis singleton + health check
- `apps/api/src/config/keyvault.ts` — Azure Key Vault secret fetcher (optional, production only)
- `apps/api/src/workers/index.ts` — BullMQ queue and worker bootstrap skeleton

**Senior Engineer Notes:**
- Create TWO Redis connections: one for normal operations (`redis`), one for pub/sub (`subscriberRedis`) if using SSE events. ioredis connections cannot be shared between command mode and subscriber mode.
- Redis `on('error')` must log but NOT crash the process. Redis is a cache/coordination layer, not the primary data store. A Redis blip should not take down the API.
- Azure Key Vault: Use `DefaultAzureCredential` which tries Managed Identity first (for Container Apps), then falls back to env vars. This allows the same code to work locally (via Azure CLI auth) and in production.
- BullMQ queues should be created in `workers/index.ts` but worker handlers are stubbed (empty). This validates the queue infrastructure without running business logic.

**Deliverable:** Redis ping succeeds. BullMQ queues are created and visible in Redis. Key Vault fetches a test secret (if `AZURE_KEY_VAULT_URL` is set).

---

### Phase 4: Cryptography & Security Primitives

**Goal:** Implement the security primitives that every sensitive operation will use.

**Files:**
- `apps/api/src/crypto/encryption.ts` — AES-256-GCM encrypt/decrypt for provider keys
- `apps/api/src/crypto/hmac.ts` — HMAC-SHA256 for user API key hashing

**Senior Engineer Notes:**
- **Never** log the plaintext of a decrypted provider key, even in error traces. Use Pino's redaction feature: `redact: ['req.providerKeyPlaintext']`.
- The `encrypt()` function should return a single Buffer that embeds IV + authTag + ciphertext. The decrypt function extracts these. This avoids separate column storage.
- For HMAC, always use `crypto.timingSafeEqual()` when comparing hashes. A standard `===` comparison is vulnerable to timing attacks.
- Zero-fill decrypted buffers after use. In Node.js this is best-effort (`buffer.fill(0)`), but it signals intent and may help with heap dumps.
- Unit test every encrypt/decrypt roundtrip with known vectors. Crypto bugs are catastrophic and hard to debug in production.

**Deliverable:** All crypto unit tests pass. Encrypt → decrypt roundtrip produces original plaintext. HMAC verification rejects invalid keys.

---

### Phase 5: Middleware Stack (Request ID + Auth + Rate Limiting)

**Goal:** Build the security perimeter. Every incoming request passes through this layer.

**Files:**
- `apps/api/src/middleware/request-id.ts` — Trace ID injection
- `apps/api/src/middleware/auth.ts` — Bearer API key validation (HMAC lookup)
- `apps/api/src/middleware/session-auth.ts` — NextAuth session validation
- `apps/api/src/middleware/admin-auth.ts` — Admin key or role check
- `apps/api/src/middleware/rate-limiter.ts` — Redis sliding-window rate limiting

**Senior Engineer Notes:**
- **Order matters.** Register middleware in this sequence: `request-id` → `rate-limiter` → `auth/session-auth` → `admin-auth`. You want rate limiting to apply even to unauthenticated requests (pre-auth DDoS protection).
- The `auth.ts` middleware must run a DB query for every request. Use a prepared statement or Drizzle's query builder to avoid SQL injection. This is the most frequently executed query in the entire system.
- Session auth: Support BOTH cookie (`next-auth.session-token`) and `Authorization: Bearer <token>` header. In cross-domain Vercel→Azure, cookies won't flow. Document this clearly for the frontend team.
- Rate limiter: Use Redis `INCR` with `EXPIRE` for the sliding window. Do NOT use `MULTI/EXEC` — it's unnecessary for this use case and adds latency.
- For concurrent request limits, use Redis `INCR` on request start and `DECR` in a `onResponse` hook. If the process crashes mid-request, the counter leaks. Accept this; the alternative (Redis TTL + Lua script) adds complexity for a minor edge case.

**Deliverable:** All middleware integration tests pass. Rate limits trigger 429s. Invalid API keys return 401s. Expired sessions return 401s. Admin routes reject non-admin access.

---

### Phase 6: Provider Adapter Framework

**Goal:** Build the pluggable provider normalization layer. This is the gateway's core abstraction.

**Files:**
- `apps/api/src/providers/base-adapter.ts` — Abstract class with default pass-through behavior
- `apps/api/src/providers/registry.ts` — `Map<string, ProviderAdapter>` registry + `getAdapter()`
- `apps/api/src/providers/openrouter.ts`
- `apps/api/src/providers/together.ts`
- `apps/api/src/providers/openai.ts`
- `apps/api/src/providers/anthropic.ts`
- `apps/api/src/providers/groq.ts`
- `apps/api/src/providers/gemini.ts`

**Senior Engineer Notes:**
- The base adapter should implement `normalizeRequest`, `denormalizeResponse`, and `denormalizeStreamChunk` as **identity functions** (pass-through). This means OpenAI-compatible providers (OpenRouter, Together, Groq, OpenAI) need almost no code.
- Anthropic and Gemini require full overrides. Build Anthropic first — it is the most different from OpenAI format (system prompt location, `x-api-key` header, `max_tokens` required).
- Each adapter should expose a `test()` method that sends a minimal request (e.g., `"hello"` with `max_tokens: 1`) to the provider. This is used by the health checker worker.
- Do NOT hardcode API keys in adapters. The adapter receives the key as a parameter at request time from the Key Pool Service.
- Unit tests should mock the upstream HTTP response. Use a fake HTTP server (MSW or nock) to test normalize/denormalize without hitting real APIs.

**Deliverable:** All adapter unit tests pass. Anthropic normalization produces valid Anthropic request bodies. Stream chunk denormalization produces valid OpenAI SSE deltas.

---

### Phase 7: Core Business Services

**Goal:** Build the engine of the gateway — model resolution, key management, credit tracking, and streaming.

**Files:**
- `apps/api/src/services/provider-mapper.ts` — Model alias → provider lookup (with Redis cache)
- `apps/api/src/services/key-pool.ts` — Key selection, rotation, exhaustion logic
- `apps/api/src/services/circuit-breaker.ts` — Per-provider/key failure tracking in Redis
- `apps/api/src/services/balance.ts` — Atomic balance checks + mid-stream monitoring
- `apps/api/src/services/ledger.ts` — Immutable `request_logs` + `usage_ledger` writes
- `apps/api/src/services/stream-proxy.ts` — AbortController, SSE proxying, disconnect handling
- `apps/api/src/services/billing.ts` — Stripe checkout + webhook processing
- `apps/api/src/utils/streaming.ts` — SSE Transform stream factory

**Senior Engineer Notes:**
- **Provider Mapper:** Cache model mappings in Redis with a 60s TTL. A cache miss hits PostgreSQL. Model mappings change rarely (admin operation), so 60s is safe. Use `SETEX` for atomic set+TTL.
- **Key Pool:** The `acquireKey` query should be a single SQL query: `SELECT ... WHERE provider = $1 AND status = 'ACTIVE' AND is_emergency_reserve = false AND remaining_credits > 1.00 ORDER BY remaining_credits DESC LIMIT 1`. Don't fetch all keys and filter in JavaScript — that's an N-scaling problem.
- **Balance Service:** The `deductCredits` function is the most critical financial transaction. It MUST use a PostgreSQL `SERIALIZABLE` transaction:
  1. `SELECT balance FROM users WHERE id = $1 FOR UPDATE` (row lock)
  2. Check balance >= charge
  3. `UPDATE users SET balance = balance - $2 WHERE id = $1`
  4. `INSERT INTO usage_ledger ...`
  5. `INSERT INTO request_logs ...`
  If step 2 fails, rollback and return 402.
- **Ledger Service:** All writes carry an `idempotency_key`. Check for existence (`SELECT 1 FROM usage_ledger WHERE idempotency_key = $1`) before the transaction. This prevents double-billing on network retries.
- **Stream Proxy:** Use Fastify's `reply.raw` for zero-copy SSE proxying. Pipe the upstream response through a Node.js `Transform` stream that applies `adapter.denormalizeStreamChunk()` to each chunk. This keeps memory usage flat regardless of stream length.
- **Circuit Breaker:** Track state in Redis (not in-memory). With 2-10 container replicas, an in-memory circuit breaker would only protect one instance. Use Redis `INCR` with a 5-minute TTL window.

**Deliverable:** Service integration tests pass. Key pool rotates exhausted keys. Balance deductions are atomic. Stream proxy handles 10MB+ streams without memory spikes.

---

### Phase 8: Critical Path Route — Chat Completions

**Goal:** Implement the single route that generates 100% of revenue: `POST /v1/chat/completions`.

**Files:**
- `apps/api/src/routes/v1/chat-completions.ts` — The core inference endpoint
- `apps/api/src/routes/health.ts` — Public liveness check (can be built in parallel)

**Senior Engineer Notes:**
- This route is the **integration point** for Phases 1-7. It should be thin — delegate to services. The handler's job is orchestration, not business logic.
- **Handler flow (non-streaming):**
  1. `authenticateUser` → `rateLimiter`
  2. `resolveModel()` → 404 if not found
  3. `checkBalance()` → 402 if <= $0
  4. `acquireKey()` → 503 if no keys
  5. `isOpen()` on circuit breaker → retry with next key if open
  6. `getAdapter()` → `normalizeRequest()`
  7. `fetch()` upstream with `AbortController`
  8. `denormalizeResponse()` → `deductCredits()` → `releaseKey()` → `recordSuccess()`
  9. Return OpenAI JSON
- **Handler flow (streaming):**
  1. Steps 1-6 same as non-streaming
  2. Set `Content-Type: text/event-stream`
  3. Pipe upstream through `Transform` stream
  4. Each chunk: `denormalizeStreamChunk()` → write to client
  5. Every N chunks (e.g., 10): check user balance in Redis. If <= 0, abort upstream, send `[DONE]` with error SSE, close.
  6. On stream end: finalize token count, `deductCredits()`, `releaseKey()`, send `data: [DONE]\n\n`
- **Retries:** Only retry on 5xx, 429, or timeout. Do NOT retry on 4xx client errors. Exponential backoff: 500ms, 1500ms, 4500ms. Max 3 retries.
- **Client disconnect:** `request.raw.on('close', () => abortController.abort())`. This prevents orphaned upstream connections that burn provider credits.
- **Error handling:** All errors (including upstream provider errors) must be returned in OpenAI-compatible format. Use the `mapError()` adapter method.

**Deliverable:** End-to-end test passes: mock upstream → request → response. Streaming test passes with 1000 chunks. Balance exhaustion mid-stream terminates gracefully.

---

### Phase 9: Supporting API Routes & Webhooks

**Goal:** Build the dashboard API, admin API, and payment webhooks. Lower risk than chat completions because they don't touch upstream providers.

**Files:**
- `apps/api/src/routes/api/user/me.ts`
- `apps/api/src/routes/api/user/usage.ts`
- `apps/api/src/routes/api/user/ledger.ts`
- `apps/api/src/routes/api/user/events.ts` — SSE stream for live updates
- `apps/api/src/routes/api/user/api-keys.ts`
- `apps/api/src/routes/api/user/top-up.ts`
- `apps/api/src/routes/api/user/invoices.ts`
- `apps/api/src/routes/webhooks/stripe.ts`
- `apps/api/src/routes/admin/provider-keys.ts`
- `apps/api/src/routes/admin/model-mappings.ts`
- `apps/api/src/routes/admin/users.ts`
- `apps/api/src/routes/admin/health.ts`
- `apps/api/src/routes/admin/margins.ts`
- `apps/api/src/routes/admin/ledgers.ts`
- `apps/api/src/routes/admin/emergency.ts`

**Senior Engineer Notes:**
- Dashboard routes use `authenticateSession`. They should never expose raw provider keys or message content (prompts/completions).
- `/api/user/api-keys` POST: Generate `sk_live_${nanoid(32)}`, hash with HMAC, store hash. Return the raw key **once** in the response body. The user must copy it immediately. There is no "reveal" functionality.
- `/api/user/events` SSE: Subscribe to Redis pub/sub channel `user_events:{userId}`. Use a separate `subscriberRedis` connection. Send heartbeats every 30s to prevent proxy timeouts (Cloudflare drops idle connections at 100s).
- Stripe webhook: Raw body MUST NOT be parsed by Fastify. Register the route with `{ config: { rawBody: true } }` or use `onRequest` hook to capture the raw Buffer before parsing. Signature verification requires the exact bytes Stripe sent.
- Admin routes use `authenticateAdmin`. The `X-Admin-Key` check should use `crypto.timingSafeEqual()` even for static key comparison. Defense in depth.
- Admin `/emergency/drain-provider`: This is a nuclear option. Set all keys for a provider to `ROTATING` status, which prevents `acquireKey` from selecting them. Log at `CRITICAL` level. Require confirmation in the admin UI.

**Deliverable:** All dashboard routes return correct data. Stripe webhook top-up updates balance atomically. Admin emergency controls take effect within 1 second (no caching of provider key status).

---

### Phase 10: App Bootstrap, Workers & Production Readiness

**Goal:** Wire everything together, add background automation, and harden for production.

**Files:**
- `apps/api/src/app.ts` — Fastify app factory (plugins, routes, hooks)
- `apps/api/src/index.ts` — Entry point, env validation, graceful shutdown
- `apps/api/src/workers/health-checker.ts`
- `apps/api/src/workers/balance-reconciler.ts`
- `apps/api/src/workers/key-cleaner.ts`
- `apps/api/src/workers/analytics-aggregator.ts`
- `apps/api/src/workers/margin-reporter.ts`
- `apps/api/src/workers/data-retention.ts`
- `apps/api/Dockerfile` — Multi-stage production build
- `docker-compose.yml` — Local dev stack (already exists)

**Senior Engineer Notes:**
- **App factory (`app.ts`):** Register plugins first (`cors`, `helmet`), then global hooks (`request-id`), then route modules. Use Fastify's plugin encapsulation — each route module is a plugin that can have its own prefix and hooks.
- **Graceful shutdown (`index.ts`):** On `SIGTERM`/`SIGINT`:
  1. Stop accepting new HTTP connections (`server.close()`)
  2. Wait for in-flight requests to complete (Fastify does this automatically with `close()`)
  3. Close BullMQ workers (`worker.close()`)
  4. Close Redis connections (`redis.quit()`)
  5. Close DB pool (`pool.end()`)
  6. Exit process
  Azure Container Apps sends `SIGTERM` 30s before `SIGKILL`. Use that window.
- **Workers:** Each worker should be a separate process OR run in the same process with separate BullMQ `Worker` instances. For MVP, running workers in the same process as the API server is acceptable (BullMQ uses Redis for coordination, so multiple replicas will distribute jobs). For scale, split workers to a separate Container Apps revision.
- **Health Checker:** Send a lightweight test request to each provider every 60s. If >5 failures in 5 minutes, call `circuitBreaker.recordFailure()`. Store latency in Redis `health:{provider}` with 120s TTL.
- **Balance Reconciler:** Every 5 minutes, compare `users.balance` against `SUM(usage_ledger.amount)`. If discrepancy > $0.01, log `CRITICAL` and create an `adjustment` ledger entry. This is your financial safety net.
- **Dockerfile:** Use `node:20-alpine` for both builder and runner stages. The runner stage should only contain `dist/`, `node_modules/`, and `package.json`. No source code. Set `NODE_ENV=production`. `EXPOSE 3000`.
- **Secrets in production:** If `AZURE_KEY_VAULT_URL` is set, fetch `MASTER_ENCRYPTION_KEY` at startup BEFORE Zod validation. If Key Vault is unreachable, the server should crash-loop (Kubernetes/Container Apps will retry). This is safer than falling back to a hardcoded key.

**Deliverable:** `docker-compose up` starts the full stack (API + Postgres + Redis). Health check returns 200. Workers run on their scheduled intervals. `docker build` produces a <150MB image.

---

### Phase Ordering Summary

| Phase | Layer | Unlocks |
|-------|-------|---------|
| 1 | Foundation | Shared types, env validation, constants |
| 2 | Database | All data access |
| 3 | Infrastructure | Redis, queues, Key Vault |
| 4 | Crypto | Secure storage and hashing |
| 5 | Middleware | Request security perimeter |
| 6 | Adapters | Provider normalization |
| 7 | Services | Business logic engine |
| 8 | Critical Route | Revenue endpoint |
| 9 | Supporting Routes | Dashboard, admin, payments |
| 10 | Bootstrap | Production-ready deployment |

---

## 19. Testing Strategy

| Layer | Tool | What to Test |
|-------|------|-------------|
| Unit (Backend) | Vitest | Provider adapters (normalize/denormalize), cost calculations, HMAC/encryption, error formatting |
| Integration | Vitest + Testcontainers | DB operations, Redis operations, full request lifecycle with mocked upstream |
| E2E (Backend) | Vitest + real local stack | Full `/v1/chat/completions` flow, auth, billing, rate limiting |
| Load | k6 or autocannon | Target 500 concurrent connections, measure p99 latency, verify no memory leaks |
| Component (Web) | Vitest + React Testing Library | Dashboard components, forms, tanstack query hooks |
| E2E (Web) | Playwright | Full signup → top-up → API key creation → chat completion flow |
| Visual (Web) | Chromatic | UI regression for marketing and dashboard pages |

---

## 20. Critical Design Decisions

1. **No ORM query caching** — Drizzle executes raw SQL. Cache hot paths (model mappings, rate limits) explicitly in Redis.
2. **Stateless API servers** — All state lives in PostgreSQL + Redis. Any server instance can handle any request. Enables horizontal scaling.
3. **Credits in Redis + PostgreSQL** — Redis for fast atomic decrements during requests. PostgreSQL as source of truth. Background reconciliation ensures consistency.
4. **No pre-flight cost estimation** — Only check `balance > 0`. Deduct actual cost after response. Terminate streams if balance depletes mid-stream.
5. **Provider keys decrypted only in-memory** — Never logged, never cached in Redis. Decrypt → use → zero-fill.
6. **Immutable ledger** — `usage_ledger` is strictly append-only (no UPDATEs or DELETEs) and acts as the **permanent financial audit trail** (retained for 7 years). `request_logs` stores request metadata and is append-only during its 90-day retention window, after which it is pruned by the data retention worker.
7. **Dual auth system** — API key auth (`sk_live_xxx` via HMAC) for programmatic `/v1/*` access. Session auth (NextAuth database strategy) for dashboard `/api/user/*` access. Completely separate auth paths.
8. **Monorepo with Turborepo** — `apps/api` (Fastify) and `apps/web` (Next.js) share types and schemas via `packages/shared`. Parallel builds and dev servers.
9. **Frontend SSE for real-time** — Dashboard uses `/api/user/events` SSE endpoint for live balance updates and usage notifications instead of WebSocket.
10. **Admin CLI (Future)** — A companion CLI tool (`fluxai-admin`) wrapping the Admin API may be built in a future phase. Not required for MVP.

---

## 21. Route Summary

| Surface | Count |
|---------|-------|
| Public Inference API (`/v1/*`) | 1 |
| User Dashboard API (`/api/user/*`) | 10 |
| Admin API (`/admin/*`) | 21 |
| Webhooks (`/webhooks/*`) | 1 |
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

---

## 22. NextAuth Frontend Integration

File: `apps/web/auth.ts` (Auth.js v5 configuration)

```ts
import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google,
    GitHub,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials against users table
        const user = await db.select().from(users).where(eq(users.email, credentials.email)).limit(1)
        if (!user[0] || !user[0].password_hash) return null
        const valid = await bcrypt.compare(credentials.password, user[0].password_hash)
        return valid ? { id: user[0].id, email: user[0].email } : null
      }
    })
  ],
  session: { strategy: "database" },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax", // Use "none" + secure for cross-domain production
        secure: process.env.NODE_ENV === "production",
      }
    }
  }
})
```

**Dashboard API Calls:**
```ts
// For same-domain / local dev (cookies sent automatically)
fetch(`${API_URL}/api/user/me`, { credentials: "include" })

// For cross-domain (Vercel → Azure): pass session token explicitly
const session = await auth()
fetch(`${API_URL}/api/user/me`, {
  headers: { "Authorization": `Bearer ${session?.sessionToken}` }
})
```

**Registration Flow:**
1. User submits email + password on `/register`.
2. Server hashes password with `bcrypt.hash(password, 12)`.
3. Inserts into `users` table with `email`, `password_hash`, `balance = 0.00`, `status = 'active'`.
4. NextAuth automatically creates a `sessions` record on first login.

---

## 23. Production Robustness, Resilience & Scalability Guide

> **Engineering Philosophy:** Reliability is not a feature you add later — it is a property of the system you build from day one. Every component must assume the failure of every other component and degrade gracefully. This section provides concrete patterns, configuration values, and architectural decisions that make FluxAI Gateway suitable for production traffic.

---

### 23.1 Database Resilience & Performance

#### Connection Pool Management (`src/db/client.ts`)

```ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Max connections per API instance
  min: 5,                     // Keep warm connections ready
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable
  statement_timeout: 30000,   // Kill queries running >30s (protects against runaway queries)
  query_timeout: 25000,       // Client-side query timeout
});

// Event listeners for resilience
pool.on('error', (err) => {
  // Log but DO NOT crash — pg pool will auto-reconnect on next query
  logger.error({ err }, 'PostgreSQL pool error');
});

pool.on('connect', () => {
  logger.info('PostgreSQL connection established');
});

export const db = drizzle(pool);
```

**Senior Engineer Notes:**
- **Pool size formula:** `max = (DB_max_connections - reserved_for_admin) / container_replicas`. If Azure PostgreSQL has 100 max connections and you run 4 replicas, each pool should be `max: 20` (leaving 20 for admin/background workers).
- **`statement_timeout`:** This is your safety net. A hung query can exhaust the pool. 30s is generous for chat completions (which should return in <10s). For analytics queries in workers, override per-query.
- **Idle connections:** Azure PostgreSQL charges per connection-hour. Set `idleTimeoutMillis: 30000` to avoid holding idle connections indefinitely.
- **Connection failures:** If `connectionTimeoutMillis` is exceeded, the query throws. Wrap ALL db calls in try/catch and return `503 Service Unavailable` with a clear error. Never let a DB timeout bubble up as a 500.

#### Query Retry & Circuit Breaker for Database

```ts
// src/db/resilient-query.ts
import { circuitBreaker } from '../services/circuit-breaker';

export async function resilientQuery<T>(
  queryFn: () => Promise<T>,
  options = { maxRetries: 3, retryDelayMs: 100 }
): Promise<T> {
  if (await circuitBreaker.isOpen('database')) {
    throw new Error('Database circuit breaker is open');
  }

  let lastError;
  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      const result = await queryFn();
      circuitBreaker.recordSuccess('database');
      return result;
    } catch (err) {
      lastError = err;
      if (attempt < options.maxRetries - 1) {
        await new Promise(r => setTimeout(r, options.retryDelayMs * Math.pow(2, attempt)));
      }
    }
  }

  circuitBreaker.recordFailure('database');
  throw lastError;
}
```

**When to retry:**
- **Retry:** `ECONNRESET`, `ETIMEDOUT`, `08006` (connection failure), `40001` (serialization failure)
- **Do NOT retry:** `23505` (unique violation — idempotency key exists), `23503` (foreign key violation), syntax errors

#### Read Replica Strategy (Future Scale)

At >500 req/s, dashboard read queries (usage analytics, ledgers) will contend with write-heavy billing transactions.

```ts
// Connection routing
const writePool = new Pool({ connectionString: process.env.DATABASE_URL });
const readPool = new Pool({ connectionString: process.env.DATABASE_REPLICA_URL });

export const dbWrite = drizzle(writePool);
export const dbRead = drizzle(readPool);

// Usage:
// dbWrite for: balance updates, ledger writes, key status changes
// dbRead for: usage queries, admin reports, dashboard analytics
```

**Implementation order:**
1. All code uses `db` singleton initially
2. Refactor to `dbWrite` / `dbRead` when read load justifies it
3. Azure PostgreSQL Flexible Server supports read replicas with ~1s replication lag — acceptable for analytics, UNACCEPTABLE for real-time balance checks

---

### 23.2 Redis Resilience & High Availability

#### Connection Resilience (`src/redis/client.ts`)

```ts
import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6380'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? {} : undefined, // Azure Redis requires TLS
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false, // CRITICAL: fail fast if Redis is down
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    // Only reconnect on READONLY errors (Azure Redis failover)
    const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED'];
    return targetErrors.some(e => err.message.includes(e));
  }
};

export const redis = new Redis(redisConfig);
export const subscriberRedis = new Redis(redisConfig); // Separate for pub/sub

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
  // Do NOT crash — API can degrade to DB-only mode for some operations
});

redis.on('reconnecting', () => {
  logger.warn('Redis reconnecting...');
});
```

**Senior Engineer Notes:**
- **`enableOfflineQueue: false`:** This is the most important flag. When Redis is unreachable, ioredis will immediately throw instead of queuing commands indefinitely. Queued commands can cause memory leaks and cascading failures when Redis recovers.
- **TLS:** Azure Cache for Redis **requires** TLS on the default port (6380). Non-TLS connections are rejected.
- **Separate pub/sub connection:** Redis clients in subscriber mode cannot issue regular commands. Always create a dedicated `subscriberRedis` for SSE event streams.
- **Failover handling:** Azure Redis uses Redis Sentinel under the hood. During failover, the master becomes read-only briefly. `reconnectOnError` catches `READONLY` and forces a reconnect, which resolves to the new master.

#### Redis Circuit Breaker

```ts
// If Redis is down, critical paths must degrade:
// - Rate limiting: Allow traffic (risky but better than total outage)
// - Session auth: Fall back to DB query (slower but functional)
// - Model mapping cache: Always query PostgreSQL (slight latency increase)

const REDIS_DOWN_BYPASS = {
  rateLimit: false,     // STRICT: never bypass — risk of abuse
  sessionAuth: true,    // BYPASS OK: query DB instead
  modelCache: true,       // BYPASS OK: DB has the data
  balanceCheck: false,   // STRICT: financial correctness requires Redis atomicity
};
```

---

### 23.3 Observability, Metrics & Alerting

#### Structured Logging with Pino

```ts
// src/config/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: 'fluxai-gateway',
    version: process.env.GIT_SHA || 'unknown',
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers["x-admin-key"]',
      'res.providerKeyPlaintext',
      '*.password_hash',
      '*.api_key_encrypted',
    ],
    remove: true,
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // In production, output JSON for log aggregation (Azure Monitor, Datadog)
  // In dev, use pino-pretty for human-readable output
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
```

**Mandatory log fields for every request:**
```json
{
  "level": "info",
  "time": "2024-01-15T10:23:45.123Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "uuid",
  "apiKeyId": "uuid",
  "model": "gpt-4o",
  "provider": "openrouter",
  "providerKeyId": "uuid",
  "method": "POST",
  "path": "/v1/chat/completions",
  "statusCode": 200,
  "latencyMs": 2345,
  "tokensInput": 150,
  "tokensOutput": 450,
  "upstreamCost": 0.0123,
  "userCharge": 0.0150,
  "stream": true,
  "retryCount": 0,
  "errorCode": null,
  "msg": "Request completed"
}
```

#### Metrics Export (Prometheus)

```ts
// src/metrics/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const registry = new Registry();

export const httpRequestsTotal = new Counter({
  name: 'fluxai_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status_code'],
  registers: [registry],
});

export const requestDuration = new Histogram({
  name: 'fluxai_request_duration_seconds',
  help: 'Request latency',
  labelNames: ['path', 'provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120, 300],
  registers: [registry],
});

export const activeConnections = new Gauge({
  name: 'fluxai_active_connections',
  help: 'Currently active SSE streams',
  registers: [registry],
});

export const providerKeyCredits = new Gauge({
  name: 'fluxai_provider_key_credits',
  help: 'Remaining credits per provider key',
  labelNames: ['provider', 'key_id'],
  registers: [registry],
});

// Expose at GET /metrics (unauthenticated, internal network only)
```

**Critical Alerts (Grafana/BetterStack):**

| Alert | Threshold | Severity |
|-------|-----------|----------|
| `fluxai_request_duration_seconds{p95} > 60s` | Any provider | P1 |
| `fluxai_http_requests_total{status_code=5xx} > 10/min` | Any route | P1 |
| `fluxai_provider_key_credits < 5` | Any emergency key | P0 |
| `fluxai_active_connections > 500` | Global | P2 |
| `users.balance` != `SUM(usage_ledger.amount)` | Any user | P0 (financial integrity) |
| Redis connection failures > 5/min | Global | P1 |
| PostgreSQL connection pool saturation > 80% | Global | P1 |

#### Distributed Tracing (OpenTelemetry — Future)

```ts
// Future enhancement: trace requests across Fastify → PostgreSQL → Redis → upstream provider
// Use @opentelemetry/auto-instrumentations-node for zero-code setup
// Trace ID propagates via `x-request-id` header
```

---

### 23.4 API Gateway Patterns

#### Request Coalescing (Thundering Herd Protection)

When 100 users request the same model mapping simultaneously (cache miss), 100 identical DB queries are fired.

```ts
// src/services/coalescing-cache.ts
const inFlightRequests = new Map<string, Promise<any>>();

export async function coalescedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  const promise = fetchFn().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

// Usage in provider-mapper.ts:
const mapping = await coalescedFetch(
  `model_resolve:${alias}`,
  () => db.select().from(modelMappings).where(eq(modelMappings.modelAlias, alias)).limit(1)
);
```

#### Response Caching (Idempotent Safe Queries)

```ts
// Cache model mappings in Redis with 60s TTL (already in spec)
// Cache health check results with 120s TTL (already in spec)
// Cache pricing lookups with 300s TTL (pricing changes rarely)

// NEVER cache:
// - Balance checks (must be real-time)
// - API key lookups (security critical)
// - Request logs (must be accurate)
```

#### Connection Keep-Alive for Upstream Providers

```ts
// Reuse TCP connections to upstream providers instead of creating a new one per request
// Node.js native fetch() uses undici which has connection pooling built-in
// But we should configure it:

const upstreamAgent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50, // Per provider
  maxTotalSockets: 200, // Global limit
});

// Pass agent to fetch:
fetch(providerUrl, { agent: upstreamAgent, ... });
```

**Why this matters:** Creating a new TCP+TLS connection for every request adds 100-300ms latency (TLS handshake). With keep-alive, subsequent requests to the same provider reuse the connection, reducing latency to network round-trip (~20-50ms).

---

### 23.5 Security Hardening

#### Input Validation & Sanitization

```ts
// Zod schemas must reject unknown fields to prevent injection
const OpenAIChatRequestSchema = z.object({
  model: z.string().min(1).max(100),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().max(100000), // 100KB max per message
  })).max(1000), // Max 1000 messages
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().int().positive().max(32000).optional(),
  top_p: z.number().min(0).max(1).optional(),
}).strict(); // Reject unknown fields — prevents parameter injection
```

**Additional hardening:**
- **Message content length:** Reject requests with total content > 1MB. This prevents abuse and protects upstream providers.
- **Rate limiting by IP:** Even before API key validation, apply a lenient IP-based rate limit (e.g., 10 req/min per IP) to prevent enumeration attacks.
- **Admin API IP allowlist:** In production, restrict `/admin/*` to known IP ranges (office VPN, CI/CD runners).
- **Stripe webhook replay protection:** Store processed `event.id` in Redis with 24h TTL to prevent replay attacks even if idempotency key logic is bypassed.

#### Secret Rotation Strategy

| Secret | Rotation Frequency | Zero-Downtime Method |
|--------|-------------------|---------------------|
| `MASTER_ENCRYPTION_KEY` | Annually (or on suspicion of breach) | Dual-key encryption: encrypt new keys with new master, decrypt old keys with old master |
| `API_KEY_PEPPER` | Annually | Re-hash all `api_keys` entries in background worker |
| `ADMIN_API_KEY` | Quarterly | Rotate via Azure Key Vault, restart containers |
| `NEXTAUTH_SECRET` | Annually | Rotate, old sessions expire naturally |
| Provider API Keys | On exhaustion (automatic) | Key pool manager handles this natively |

---

### 23.6 Performance Optimizations

#### Response Compression

```ts
// Register @fastify/compress for responses > 1KB
// Disable compression for SSE streams (already compressed text, adds CPU overhead)
app.register(compress, {
  threshold: 1024,
  global: false, // Enable per-route
});

// Enable for: dashboard API responses, admin reports
// Disable for: /v1/chat/completions (stream), /api/user/events (SSE)
```

#### Memory Management for Streaming

```ts
// Problem: Long-running streams (5 minutes) can accumulate data in Node.js event loop
// Solution: Use backpressure properly

reply.raw.write(chunk); // Fastify's raw response
if (!reply.raw.write(chunk)) {
  // Backpressure — upstream is faster than client
  upstreamResponse.pause();
  reply.raw.once('drain', () => upstreamResponse.resume());
}
```

**Monitoring:** Use `node --heapsnapshot-near-heap-limit` in production to capture heap dumps before OOM crashes. Azure Container Apps supports this via startup command customization.

#### JSON Serialization

```ts
// Fastify uses JSON.stringify by default
// For high-throughput routes, consider fast-json-stringify (Fastify built-in)
// or compile schemas ahead of time:

const stringifyResponse = fastJson({
  type: 'object',
  properties: {
    id: { type: 'string' },
    choices: { type: 'array', items: { /* ... */ } },
  },
});

// This is 10-20x faster than JSON.stringify for large objects
```

---

### 23.7 Error Handling & Resilience Patterns

#### Bulkhead Pattern (Isolate Failure Domains)

```ts
// Separate connection pools per provider to prevent one failing provider
// from exhausting global connection limits

const providerAgents = new Map<string, Agent>();

function getProviderAgent(provider: string): Agent {
  if (!providerAgents.has(provider)) {
    providerAgents.set(provider, new Agent({
      maxSockets: 20,
      keepAlive: true,
    }));
  }
  return providerAgents.get(provider)!;
}

// If Anthropic is slow, its agent queues requests. Other providers are unaffected.
```

#### Fallback & Degradation

```ts
// Graceful degradation hierarchy:
// 1. Primary: Use provider-specific optimized endpoint
// 2. Secondary: Use OpenRouter as universal fallback (if primary fails)
// 3. Tertiary: Return 503 with clear error (no keys available)

// Note: Per PRD, there is NO automatic model fallback to a different provider.
// But within the same provider, retry with different keys.
```

#### Timeout Hierarchy

| Layer | Timeout | Action on Timeout |
|-------|---------|-------------------|
| Client → Gateway (Azure LB) | 60s (non-stream) / 300s (stream) | Azure LB returns 504 |
| Gateway → Upstream Provider | 55s (non-stream) / 295s (stream) | Abort, retry with next key |
| Gateway → Database | 5s | Return 503, log CRITICAL |
| Gateway → Redis | 1s | Degrade to DB query |
| Upstream Provider Internal | Varies | Their responsibility |

**Rule:** Every external call MUST have a timeout. Unbounded waits are the #1 cause of cascading failures.

---

### 23.8 Horizontal Scaling & Load Distribution

#### Stateless Architecture Checklist

✅ No in-memory session storage (use NextAuth DB sessions)
✅ No local filesystem writes (logs go to stdout)
✅ No in-memory caching of business data (use Redis)
✅ Circuit breaker state in Redis (not memory)
✅ Idempotency keys in Redis (not memory)

**Result:** Any container can handle any request. Azure Container Apps can scale from 2 to 100 replicas automatically.

#### Load Balancer Health Probes

```ts
// GET /health (existing) — Azure Container Apps health probe
// Return 200 ONLY if:
// - PostgreSQL connection pool has available connections
// - Redis is connected (or degraded mode is acceptable)
// - Critical workers are running

app.get('/health', async (req, res) => {
  const dbHealthy = await checkDbConnection();
  const redisHealthy = await checkRedisConnection();

  if (!dbHealthy) {
    return res.status(503).send({ status: 'unhealthy', reason: 'database' });
  }

  // Redis degradation is acceptable for some routes
  res.status(200).send({
    status: 'ok',
    degraded: !redisHealthy,
    uptime: process.uptime(),
  });
});
```

**Azure Container Apps configuration:**
- **Liveness probe:** `/health`, interval 10s, failureThreshold 3 → container restarts
- **Readiness probe:** `/health`, interval 5s, failureThreshold 1 → removed from load balancer

#### Scaling Triggers

```yaml
# Azure Container Apps scaling rules
scale:
  minReplicas: 2      # Always run 2 for HA
  maxReplicas: 50
  rules:
    - name: http-scaling
      custom:
        type: http
        metadata:
          concurrentRequests: "100"  # Scale out when >100 concurrent requests per replica
    - name: cpu-scaling
      custom:
        type: cpu
        metadata:
          type: Utilization
          value: "70"  # Scale out when CPU >70%
```

---

### 23.9 Disaster Recovery & Business Continuity

#### PostgreSQL Backup Strategy

| Backup Type | Frequency | Retention | Recovery Point Objective (RPO) |
|-------------|-----------|-----------|-------------------------------|
| Automated backups (Azure) | Daily | 7-35 days | 24 hours |
| Continuous backups (WAL) | Real-time | 7 days | ~5 minutes |
| Cross-region replica | Async | N/A | ~1 hour |
| Manual export (ledger) | Monthly | 7 years | N/A |

**Recovery Time Objective (RTO):** < 30 minutes for automated failover to read replica.

#### Redis Data Loss Acceptance

Redis is NOT the source of truth. Data loss in Redis means:
- Rate limit counters reset → temporarily lenient (acceptable)
- Circuit breaker state resets → temporary blind retries (acceptable)
- Session cache evicted → falls back to DB query (acceptable)
- Model mapping cache evicted → DB query (acceptable)

**Action:** On Redis restart, run the analytics aggregator worker immediately to rebuild time-series caches.

#### Multi-Region Architecture (Future)

```
Primary Region (East US):
  - API containers (active)
  - PostgreSQL (read-write)
  - Redis (master)

Secondary Region (West Europe):
  - API containers (standby, 0 replicas, scales to 2 on failover)
  - PostgreSQL (read replica)
  - Redis (replica)

Failover trigger: Primary region health probe fails for >2 minutes
  → DNS failover to secondary
  → Promote PostgreSQL read replica to write
  → Scale secondary API containers to 2+ replicas
```

---

### 23.10 Deployment & Release Safety

#### Blue-Green Deployment with Azure Container Apps

```yaml
# Instead of rolling update (which mixes old/new code during transition),
# use Azure Container Apps revision management:

# 1. Deploy new revision with 0% traffic
# 2. Run smoke tests against new revision
# 3. Shift 10% traffic (canary)
# 4. Monitor error rate for 5 minutes
# 5. Shift 100% traffic
# 6. Deactivate old revision after 1 hour (instant rollback if needed)
```

**Deployment Safety Checklist:**
- [ ] Database migrations are backward-compatible (e.g., add column as nullable first)
- [ ] New code handles old schema gracefully (feature flags)
- [ ] Old code handles new schema gracefully (nullable columns)
- [ ] Worker processes are drained before shutdown (BullMQ `worker.close()`)
- [ ] Secrets are validated before traffic shift

#### Feature Flags for Gradual Rollout

```ts
// src/config/features.ts
export const FEATURES = {
  // Percentage-based rollout for new providers
  anthropicAdapterV2: (userId: string) => {
    // Hash userId to deterministic percentage 0-99
    const hash = crypto.createHash('md5').update(userId).digest('hex');
    const bucket = parseInt(hash.slice(0, 2), 16) % 100;
    return bucket < 10; // 10% of users
  },

  // Boolean flags for emergency controls
  emergencyDrainProvider: (provider: string) => {
    // Check Redis flag set by admin emergency endpoint
    return redis.get(`emergency:drain:${provider}`).then(Boolean);
  },
};
```

---

### 23.11 Checklist: Production Readiness

Before accepting real traffic:

**Infrastructure:**
- [ ] PostgreSQL `max_connections` > (pool.max × replica_count + 20 buffer)
- [ ] Redis TLS enabled, `enableOfflineQueue: false`
- [ ] Azure Key Vault access configured with Managed Identity
- [ ] Container Apps health probes configured (liveness + readiness)
- [ ] Auto-scaling rules set (HTTP concurrent requests + CPU)
- [ ] Minimum 2 replicas for HA

**Security:**
- [ ] All secrets rotated from development values
- [ ] `ADMIN_API_KEY` is cryptographically random (≥32 bytes)
- [ ] Stripe webhook endpoint verified with signature check
- [ ] CORS origin restricted to `NEXTAUTH_URL` (not `*`)
- [ ] Rate limits tested at 2× expected peak load

**Observability:**
- [ ] Pino redaction rules configured for all sensitive fields
- [ ] Prometheus `/metrics` endpoint exposed (internal network only)
- [ ] Alert rules configured for P0/P1/P2 thresholds
- [ ] Log aggregation pipeline tested (Azure Monitor / Datadog)

**Resilience:**
- [ ] Database circuit breaker tested (simulate connection failure)
- [ ] Redis circuit breaker tested (simulate connection failure)
- [ ] Upstream provider failure tested (all 6 adapters)
- [ ] Graceful shutdown tested (`SIGTERM` → 30s → `SIGKILL`)
- [ ] Load test passed: 500 concurrent connections, 0% error rate, p99 < 5s

**Financial Integrity:**
- [ ] Balance reconciliation worker tested: `users.balance` == `SUM(usage_ledger.amount)`
- [ ] Idempotency key deduplication tested (replay same Stripe webhook 10×)
- [ ] Mid-stream balance exhaustion tested (stream terminates with 402)
- [ ] Key rotation audit trail verified (every key change logged)

---

> **Final Note:** This document is a living specification. As the system scales from 100 users to 10,000 users, revisit each section quarterly. What was "future scale" (read replicas, multi-region) becomes "this quarter" faster than you expect. Monitor the metrics, trust the alerts, and never skip the resilience testing.
