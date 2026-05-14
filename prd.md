# PRD — AI API Gateway & Key Pool Platform

## Product Name

**FluxAI Gateway** (Universal OpenAI-Compatible Multi-Key AI API Gateway)

---

# 1. Product Overview

FluxAI Gateway is a universal, OpenAI-compatible API platform that routes user AI requests to any upstream AI provider and any model through a fully managed key pool.

Users interact only with FluxAI Gateway APIs. The platform internally maintains a pool of upstream provider API keys, automatically selects healthy keys, tracks credit usage, switches exhausted keys, balances traffic, and normalizes all responses into a single OpenAI-compatible format.

---

# 2. Core Objective

Build a lightweight, scalable AI inference gateway that:

- aggregates **any** upstream AI provider and **any** model
- exposes OpenAI-compatible APIs
- manages a dynamic pool of upstream provider keys
- automatically rotates exhausted keys
- minimizes downtime through failover
- allows rapid monetization with minimal infrastructure cost

---

# 3. Problem Statement

Many AI providers:

- impose per-key credit caps
- throttle requests
- have inconsistent uptime
- expose different, incompatible APIs

Managing multiple keys, formats, and endpoints manually becomes operationally inefficient.

FluxAI Gateway solves this by:

- abstracting providers via a universal adapter layer
- centralizing routing
- automating key switching (for managed pools)
- exposing one stable, model-agnostic API interface

---

# 4. Target Users

## Primary Users

### Indie Developers

Need:

- cheaper AI APIs
- OpenAI-compatible endpoints
- simple integration

---

### AI SaaS Builders

Need:

- unified inference layer
- multiple models from multiple providers
- failover reliability
- consolidated billing

---

### Students / Hackathon Builders

Need:

- low-cost model access
- coding models
- quick experimentation

---

# 5. Core Features

# 5.1 OpenAI-Compatible API

## Endpoint

```http
POST /v1/chat/completions
```

Supports:

- streaming
- system prompts
- temperature
- max_tokens
- tool calling (future)
- **any model name** passthrough

**Model Agnosticism:**
The gateway accepts any model identifier string in the `model` field. It looks up the model in the mapping table to determine the target provider. If the model is not explicitly mapped, it returns a clear `404`-style OpenAI-compatible error. There is no dynamic routing or fallback mechanism.

---

# 5.2 API Key Authentication

Users receive:

```text
sk_live_xxxxxxxxx
```

Platform validates:

- existence
- expiration
- quota
- rate limits

---

# 5.3 Key Pool Management

System maintains a managed pool of upstream provider API keys that all user traffic flows through.

**Key Economics:**

- Each provider API key is pre-loaded with a **$50 credit cap** (or equivalent).
- Keys are acquired at **discounted rates** vs. retail pricing.
- When a key exhausts its $50, it is retired and replaced with a fresh key.

**Key State:**

```ts
type ProviderKey = {
    id: string;
    provider: string;
    apiKey: string;            // encrypted
    initialCredits: number;      // 50.00
    remainingCredits: number;    // real-time tracked
    status: "ACTIVE" | "EXHAUSTED" | "ERROR" | "ROTATING";
    lastUsed: Date;
    createdAt: Date;
};
```

**Pool Behavior:**

- Keys are provisioned dynamically and on-demand.
- No upper bound on total keys in the pool.
- Exhausted keys are archived (not deleted) for audit and cost analysis.
- **Emergency Key Reserve:** A small buffer of high-availability keys is kept in reserve and only consumed when the main active pool is entirely exhausted or rate-limited.

---

# 5.4 Automatic Key Rotation

If:

- key quota exhausted
- provider failure
- timeout
- rate limit exceeded

System automatically:

- disables key temporarily/permanently
- selects next available key from the managed pool
- retries the request

No user interruption.

---

# 5.5 Multi-Provider Mapping & Universal Provider Adapter

Supported providers (extensible to any):

- OpenRouter
- Together AI
- Groq
- Fireworks
- DeepInfra
- OpenAI
- Anthropic
- Google Vertex AI / Gemini
- Any custom provider via adapter

**Provider Adapter Layer:**
A pluggable adapter system normalizes requests and responses between the OpenAI-compatible gateway format and each provider's native API.

```ts
interface ProviderAdapter {
  provider: string;
  
  // Convert OpenAI request body to provider-native format
  normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest;
  
  // Convert provider-native response to OpenAI format
  denormalizeResponse(response: ProviderNativeResponse): OpenAIChatResponse;
  
  // Convert provider-native SSE chunks to OpenAI SSE chunks
  denormalizeStreamChunk(chunk: ProviderNativeChunk): OpenAIStreamChunk;
  
  // Map provider-specific errors to OpenAI-compatible error codes
  mapError(error: ProviderError): OpenAIError;
  
  // Check if provider supports a given model
  supportsModel(model: string): boolean;
  
  // Estimate cost for a request (input + output tokens)
  estimateCost(model: string, inputTokens: number, outputTokens: number): number;
}
```

**Model-to-Provider Mapping Table:**

```sql
CREATE TABLE model_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_alias TEXT NOT NULL,        -- e.g., "gpt-4o", "llama-3-70b"
  provider TEXT NOT NULL,
  provider_model_id TEXT NOT NULL,  -- actual model ID used in upstream request
  pricing_input DECIMAL(12, 6) NOT NULL,   -- per 1M tokens
  pricing_output DECIMAL(12, 6) NOT NULL,  -- per 1M tokens
  capabilities JSONB NOT NULL DEFAULT '{}', -- {tools: true, json_mode: true, ...}
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Mapping engine determines:

- exact provider selection based on model alias match
- if the mapped provider is unavailable, it fails fast

---

# 5.6 Streaming Support

Supports:

- Server Sent Events (SSE)
- token streaming
- OpenAI-compatible chunk format

Mandatory for:

- Cursor
- OpenWebUI
- VSCode extensions

**Connection & Stream Management:**

- Upstream requests use `AbortController` with configurable timeouts.
- If the client disconnects (`req.on('close')`), the upstream request is cancelled immediately to prevent resource leakage.
- Maximum streaming duration limit enforced (e.g., 5 minutes).
- Connection pool sizing per provider to prevent upstream overload.
- Fastify's streaming response API is used for zero-copy SSE proxying where possible.

---

# 5.7 Real-Time Usage & Credit Tracking

**Per-Request Tracking:**

- request count
- token usage (input / output)
- response latency
- provider cost (actual upstream cost)
- user charge (marked-up price)
- model name
- provider name
- key ID used
- timestamp

**Strict Real-Time Credit Tracking:**

- If the user's balance is at or below $0.00 before the request begins, return `402 Payment Required`.
- There is **no pre-flight cost estimation based on `max_tokens`**. The system relies purely on actual token consumption.
- For non-streaming requests: Deduct upstream cost from `provider_keys.remainingCredits` and user charge from `users.balance` immediately after the response.
- For streaming requests: Deduct credits continuously as chunks are delivered. If the user's balance is exhausted mid-stream, the stream is immediately terminated and a `402 Payment Required` error is returned in the stream.

**Idempotency:**

All billing events carry an `idempotency_key` (e.g., `req_${requestId}_deduction`).
- Prevents double-spending on network retries or webhook replays.
- Idempotency keys are stored in Redis with a TTL of 24 hours.

**Atomic Operations:**

- All credit updates use Redis atomic counters + PostgreSQL ACID transactions.
- No possibility of double-spending or race-condition overdrafts.

**Usage Ledger:**

Every single API call is recorded as an immutable ledger entry for audit, billing, and margin analysis.

---

# 5.8 Rate Limiting

Per-user:

- requests/minute
- tokens/day
- concurrent requests

Protects:

- margins
- infrastructure
- abuse

---

# 5.9 Health Monitoring

Background workers (via BullMQ):

- test provider availability
- check latency
- validate keys
- sync balances

**Real-Time Balance Sync:**

- Poll upstream providers for actual credit balances where API allows.
- Reconcile provider-reported balances against internal ledger every 5 minutes.
- Alert on any discrepancy > 1%.

**Circuit Breaker:**

- If a provider or specific key fails repeatedly (>5 consecutive errors or 429s within 5 minutes), it is temporarily disabled for a cooldown period (e.g., 10 minutes).
- Prevents cascading failures and protects the emergency key reserve.

---

# 5.10 Logging & Analytics

Store:

- request logs (metadata only — no message content by default)
- provider selected
- failure reasons
- costs
- latency

**Data Retention & Privacy:**

- Request logs store **metadata only** (tokens, cost, latency, model, status) by default.
- Message content (prompts and completions) is **never persisted** unless explicitly enabled for debugging via a user toggle.
- If content logging is enabled, PII is redacted via automated masking rules.
- Logs are retained for **90 days**, then automatically purged or archived to cold storage.
- Immutable ledgers (`request_logs`, `usage_ledger`) are retained for **7 years** for financial audit compliance.

---

# 6. Non-Goals (MVP)

The following are intentionally excluded initially:

- ~~frontend dashboard (CLI / Admin API only)~~ — **Now in scope for Phase 4–5. Full user dashboard and admin dashboard UI are required as part of the full-stack application.**
- subscriptions / prepaid plans (pay-as-you-go only)
- organization/team support
- fine-tuning
- image generation
- embeddings
- RAG tooling

---

# 7. System Architecture

# High-Level Architecture

```text
Clients
   ↓
Cloudflare / Nginx
   ↓
Fastify API Gateway
   ↓
Auth Middleware
   ↓
Rate Limiter (Redis)
   ↓
Key Pool Manager (Managed Pool)
   ↓
Provider Mapper (Model Mapping Table)
   ↓
Provider Adapter (Request/Response Normalization)
   ↓
Stream Proxy & Connection Manager
   ↓
AI Provider APIs
```

**Background Services (BullMQ):**

```text
BullMQ Workers:
├── Provider Health Checker
├── Balance Sync Reconciler
├── Expired Key Cleaner
├── Usage Analytics Aggregator
└── Margin Report Generator
```

**Admin Interface:**

```text
Admin API (REST)  →  Secure CLI / Future Dashboard
```

---

# 8. Technical Stack

## Backend

- Node.js
- TypeScript
- Fastify

Reason:

- lightweight
- fast streaming
- low RAM usage

**Additional Libraries:**

- **Zod** — Runtime request/response validation and OpenAI-compatible schema enforcement.
- **Drizzle ORM** — Type-safe SQL query builder for PostgreSQL (lighter than Prisma, ideal for gateway workloads).
- **Pino** — High-performance structured logging with trace ID propagation.
- **BullMQ** — Redis-backed job queue for background tasks (health checks, reconciliation, analytics, retries).

---

# Database

- PostgreSQL

Stores:

- users
- API keys
- provider keys
- model mappings
- logs
- usage metrics
- ledgers

---

# Cache / Coordination

- Redis

Used for:

- rate limiting
- distributed locks
- temporary counters
- hot key cache
- idempotency key storage (TTL 24h)
- BullMQ job queues

---

# Deployment

## Recommended

- Railway or
- Hetzner VPS

---

# Reverse Proxy

- Cloudflare or
- Nginx

---

# 9. Database Design

# users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  balance DECIMAL(12, 4) NOT NULL DEFAULT 0.00,  -- USD, real-time
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# api_keys

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hashed_key TEXT NOT NULL,         -- HMAC-SHA256 with server pepper
  name TEXT,                        -- user-friendly label
  rate_limit_rpm INT DEFAULT 60,
  rate_limit_tokens_day INT DEFAULT 100000,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# provider_keys

```sql
CREATE TABLE provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  api_key_encrypted BYTEA NOT NULL, -- AES-256-GCM ciphertext
  initial_credits DECIMAL(10, 4) NOT NULL DEFAULT 50.00,
  remaining_credits DECIMAL(10, 4) NOT NULL DEFAULT 50.00,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  is_emergency_reserve BOOLEAN NOT NULL DEFAULT FALSE,
  last_used TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMP             -- set when EXHAUSTED
);
```

---

# model_mappings

```sql
CREATE TABLE model_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_alias TEXT NOT NULL UNIQUE,        -- user-facing model name
  provider TEXT NOT NULL,
  provider_model_id TEXT NOT NULL,         -- actual upstream model ID
  pricing_input DECIMAL(12, 6) NOT NULL,    -- per 1M tokens
  pricing_output DECIMAL(12, 6) NOT NULL,    -- per 1M tokens
  capabilities JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# request_logs (Immutable Ledger)

```sql
CREATE TABLE request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  provider_key_id UUID REFERENCES provider_keys(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INT NOT NULL,
  tokens_output INT NOT NULL,
  upstream_cost DECIMAL(12, 6) NOT NULL,   -- what we paid
  user_charge DECIMAL(12, 6) NOT NULL,     -- what user paid
  margin DECIMAL(12, 6) NOT NULL,          -- user_charge - upstream_cost
  latency_ms INT NOT NULL,
  status TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,    -- prevents double billing
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_request_logs_user_created ON request_logs(user_id, created_at DESC);
CREATE INDEX idx_request_logs_idempotency ON request_logs(idempotency_key);
```

---

# usage_ledger (Real-Time Balance Events)

```sql
CREATE TABLE usage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  request_log_id UUID REFERENCES request_logs(id),
  amount DECIMAL(12, 6) NOT NULL,     -- negative = charge, positive = top-up
  balance_after DECIMAL(12, 4) NOT NULL,
  type TEXT NOT NULL,                 -- 'api_usage', 'topup', 'refund', 'adjustment'
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for fast balance lookups
CREATE INDEX idx_usage_ledger_user_created ON usage_ledger(user_id, created_at DESC);
```

---

# 10. API Specification

# Chat Completion

## Request

```http
POST /v1/chat/completions
```

---

## Headers

```http
Authorization: Bearer sk_live_xxx
```

---

## Body

```json
{
    "model": "gpt-4o",
    "messages": [
        {
            "role": "user",
            "content": "hello"
        }
    ],
    "stream": true,
    "max_tokens": 150
}
```

---

## Response

OpenAI-compatible JSON or SSE stream.

---

# 11. Provider Adapter Layer

The gateway is **model-agnostic and provider-agnostic** through a pluggable adapter architecture.

**Adapter Responsibilities:**

1. **Request Normalization:** Convert the OpenAI `chat.completions` request body into the provider's native format. Handle differences in:
   - message structure (e.g., Anthropic's `system` prompt location)
   - parameter names (e.g., `max_tokens` vs. `maxOutputTokens`)
   - tool calling formats
   - streaming flag handling

2. **Response Denormalization:** Convert the provider's native response back into the OpenAI `ChatCompletion` object format, including:
   - `choices`, `message`, `role`, `content`
   - `usage` block (`prompt_tokens`, `completion_tokens`, `total_tokens`)
   - `finish_reason` mapping

3. **Stream Chunk Denormalization:** Convert provider-native SSE chunks into OpenAI-compatible `delta` chunks.

4. **Error Mapping:** Map provider-specific HTTP status codes and error bodies into OpenAI-compatible error objects (`type`, `code`, `message`, `param`).

5. **Cost Estimation:** Compute expected upstream cost based on token counts and provider pricing.

**Adding a New Provider:**

Create a new file implementing `ProviderAdapter`, register it in the provider registry, and add rows to `model_mappings`. No core gateway code changes required.

---

# 12. Mapping Logic

# Model Mapping

The gateway looks up the `model` parameter in the `model_mappings` table.

**Exact Match:**

```ts
// User requests "gpt-4o"
// Gateway queries model_mappings WHERE model_alias = 'gpt-4o'
// Routes to provider_model_id = 'gpt-4o' on the matched provider
```

**Behavior:**

- If exact alias not found, return OpenAI-compatible `404` error: `{"error": {"message": "Model 'xyz' not found", "type": "invalid_request_error", "code": "model_not_found"}}`
- If the matched provider is unhealthy or out of keys, return `503 Service Unavailable` with a clear error message.
- There is **no dynamic routing or fallback** to other providers for the same model.

**Selection Rules:**

For the explicitly mapped provider, prefer:

- active keys
- highest remaining credits (managed pool)

---

# 13. Failure Handling

# Provider Failures

Detect:

- 429
- 5xx
- timeout
- quota exceeded

Actions:

- mark key unhealthy
- retry with alternate key (up to 3 retries)
- log failure

**Retry Policy:**

- Exponential backoff between retries (500ms, 1500ms, 4500ms).
- Retry only on idempotent-safe failures (5xx, 429, timeout). Do not retry on 4xx client errors.

---

# Circuit Breaker

If repeated failures from a provider or key:

- disable provider/key temporarily (cooldown: 10 minutes)
- alert operator via log/admin event
- route traffic to next available provider/key

---

# Emergency Key Reserve

A small, dedicated pool of provider keys is maintained with `is_emergency_reserve = TRUE`.

- These keys are **never** used for normal traffic.
- They are only consumed when all non-reserve keys for a provider are exhausted, rate-limited, or in cooldown.
- Triggering an emergency reserve logs a `CRITICAL` level event and notifies the operator.
- Emergency reserves are replenished automatically via the admin provisioning flow.

---

# 14. Connection & Stream Management

**Upstream Request Lifecycle:**

1. Gateway creates an `AbortController` for every upstream request.
2. Timeout is set based on model/provider SLA (default: 60s non-streaming, 300s streaming).
3. If the client disconnects mid-request, the `AbortController` signals cancellation, terminating the upstream connection immediately.
4. If the upstream completes before the client, the response is flushed and closed normally.

**Streaming Proxy:**

- Fastify's `reply.raw` is used for zero-copy SSE proxying.
- Each provider adapter's `denormalizeStreamChunk` is applied in a Transform stream before writing to the client.
- Connection pool sizing is enforced per provider to prevent upstream overload.

---

# 15. Concurrency Strategy

Problem: Multiple simultaneous requests may:

- overload same key
- exceed quota unexpectedly

Solution:

- Redis atomic counters for provider key credits
- Request reservations (reserve estimated cost in Redis for the duration of the request, release/reconcile on completion)
- Distributed locks for critical key rotation events
- Idempotency keys for all billing events

---

# 16. Security Requirements

## Security by Design: Two Tiers

The gateway handles two highly sensitive asset classes: **upstream provider keys** (our supply) and **user API keys** (our demand). A breach of either is existential.

Security is split into **MVP** and **Production** tiers to enable rapid shipping without compromising the core threat model.

### MVP Tier (Phase 1-3)

| Layer | Control |
|-------|---------|
| **Storage** | Provider keys encrypted at rest in PostgreSQL using AES-256-GCM. Keys never stored in env vars or config files. |
| **Encryption** | Master key loaded from a single environment variable or Railway secret at runtime. Unique DEK (Data Encryption Key) per provider key derived from the master key. |
| **Memory** | Keys decrypted only in-memory for the duration of the upstream request. Overwritten with zeros after use (best effort in Node.js). |
| **Access** | Gateway process only. No logging of key values. |
| **User Keys** | User API keys (`sk_live_xxx`) stored as **HMAC-SHA256 hashes** with a server-side pepper. Raw keys are never stored or logged. |
| **Transport** | TLS 1.3 for all client and upstream traffic. |
| **Rate Limiting** | Per-user, per-IP, per-model limits enforced via Redis. |
| **Input Validation** | Zod schema validation on all request bodies. Max payload size enforced. |

### Production Tier (Phase 4-5)

| Layer | Control |
|-------|---------|
| **KMS** | Master key moved to external KMS (e.g., AWS KMS / HashiCorp Vault). |
| **Internal mTLS** | mTLS between gateway, database, and Redis. |
| **Request Signing** | Optional HMAC request signing for admin endpoints. |
| **IP Allowlisting** | Optional per-user API key IP restrictions. |
| **Zero-Trust Network** | Every internal call authenticated and authorized via service mesh. |
| **WAF** | Cloudflare or AWS WAF with OWASP Top-10 rulesets. |
| **DDoS Protection** | Edge-level DDoS protection and anomaly detection. |
| **No SSH** | Immutable container deployment only. Secrets injected at runtime by orchestrator. |
| **Dependency Scanning** | Automated Snyk / Dependabot scanning on every build. |

### Abuse & Fraud Prevention (MVP + Production)

- Rate limiting per user, per IP, per model.
- Anomaly detection: flag sudden token burn spikes, unusual model usage patterns, or geographic impossibilities.
- Input/output logging disabled by default; if enabled for debugging, PII is redacted.
- Circuit breaker on suspicious users: auto-suspend if usage pattern suggests key theft or scraping.

---

# 17. Admin Dashboard & Admin API

An **Admin REST API** is provided for operational management. A lightweight web dashboard may be built in a future phase, but the API must exist from Phase 2.

## Admin API Endpoints

All endpoints require a separate `ADMIN_API_KEY` header (`X-Admin-Key`).

### Provider Key Management

```http
POST /admin/provider-keys
GET    /admin/provider-keys
PATCH  /admin/provider-keys/:id/rotate
PATCH  /admin/provider-keys/:id/status
DELETE /admin/provider-keys/:id
```

### Model Mapping Management

```http
POST   /admin/model-mappings
GET    /admin/model-mappings
PATCH  /admin/model-mappings/:id
DELETE /admin/model-mappings/:id
```

### User Management

```http
GET    /admin/users
PATCH  /admin/users/:id/suspend
PATCH  /admin/users/:id/unsuspend
GET    /admin/users/:id/usage
```

### Financial & Margin Analytics

```http
GET /admin/margins?period=daily|weekly|monthly
GET /admin/ledgers?user_id=xxx&limit=100
GET /admin/balance-reconciliations
```

### System Health

```http
GET /admin/health/providers
GET /admin/health/keys
GET /admin/health/queues
```

### Emergency Operations

```http
POST /admin/emergency/drain-provider   -- Move all traffic away from a provider
POST /admin/emergency/rotate-all-keys  -- Force rotate all keys for a provider
```

**Admin CLI:**
A companion CLI tool (`fluxai-admin`) wraps the Admin API for scripting and automation.

---

# 18. Compliance & Provider Relations

### Legal Basis

Key pooling, rotation, and automated failover are **fully legal** under standard API provider Terms of Service when executed as an authorized end-user or via legitimate account structures. FluxAI Gateway operates as a standard API consumer and proxy layer. There is **no restriction** on aggregating multiple API keys for load balancing, failover, or credit management purposes, provided usage remains within standard rate limits and account agreements.

### Managed Key Pool Operations

- Keys are provisioned through standard provider accounts and are used exclusively for proxying end-user AI requests.
- The platform tracks provenance, credit allocation, and usage for audit and cost analysis.
- All key rotation, pooling, and failover occurs transparently behind the unified API endpoint.

---

# 19. Data Retention & Privacy

### Request Content Logging

- **Default:** Message content (prompts and completions) is **never persisted**.
- **Metadata only:** `request_logs` stores tokens, cost, latency, model, status, and error codes.
- **Opt-in Debug Logging:** Users or admins may enable content logging for debugging. If enabled:
  - PII is redacted via automated regex/NER masking.
  - Content is retained for **30 days** maximum.
  - Requires explicit user/admin consent.

### Retention Schedule

| Data Type | Retention | Action After Retention |
|-----------|-----------|------------------------|
| Request metadata | 90 days | Purged automatically |
| Request content (if logged) | 30 days | Purged automatically |
| Immutable ledger (`request_logs`, `usage_ledger`) | 7 years | Archived to cold storage |
| Provider key audit history | 7 years | Archived to cold storage |
| Rate limit counters (Redis) | 24 hours | TTL expiry |
| Idempotency keys (Redis) | 24 hours | TTL expiry |

### Privacy Compliance

- GDPR/CCPA data deletion requests: User metadata can be anonymized; ledger entries are immutable for financial compliance but PII is minimized.
- No training data is collected from user requests.
- All data is stored in the user's chosen region (future feature; MVP defaults to primary deployment region).

---

# 20. Financial Compliance & Billing

### Payment Flow (Stripe)

1. User initiates top-up via Stripe Checkout.
2. On `checkout.session.completed` or `payment_intent.succeeded` webhook:
   - Validate webhook signature.
   - Extract `idempotency_key` from `metadata`.
   - Insert `usage_ledger` row with type `topup`.
   - Update `users.balance` atomically.
   - Return `200 OK` to Stripe immediately.
3. Webhook handler is idempotent: duplicate webhooks with the same `idempotency_key` are silently deduplicated.

### User Balance System

```ts
type User = {
    id: string;
    email: string;
    balance: number;           // USD, real-time tracked
    billingAddress?: string;
    createdAt: Date;
};
```

- Users **pre-fund** their account (minimum $5).
- Every request deducts from `balance` in real-time.
- When `balance` drops below $1, all requests return `402 Payment Required`.
- Users can top up via Stripe (automated). Crypto / bank transfer supported manually for MVP.

### Margin Economics

- Upstream keys purchased at **discounted rates**.
- Platform adds a **fixed percentage markup** on every token.
- Real-time margin per request = user charge − upstream cost.
- Daily / weekly margin reports generated automatically via BullMQ worker.

### Example Pricing (Illustrative)

| Model | Upstream Cost (per 1M tokens) | User Price (per 1M tokens) | Platform Margin |
|-------|-------------------------------|----------------------------|-----------------|
| gpt-4o | $2.50 input / $10.00 output | $3.00 input / $12.00 output | ~20% |
| llama-3-70b | $0.90 input / $0.90 output | $1.10 input / $1.10 output | ~22% |

Prices are dynamic and adjusted based on provider discount tiers.

### Financial Audit

- All ledger entries are immutable.
- Daily reconciliation job compares `users.balance` against the sum of `usage_ledger` entries.
- Monthly margin reports are exported for tax/accounting purposes.

---

# 21. Monitoring

Track:

- active requests
- provider health
- token burn
- error rates
- average latency
- queue depths (BullMQ)
- emergency reserve usage

Tools:

- Prometheus
- Grafana
- BetterStack
- Pino structured logs

---

# 22. Scalability

Initial target:

- 100–500 users
- 10k–50k requests/day

Horizontal scaling:

- stateless API servers
- shared Redis/Postgres
- BullMQ workers can scale independently

---

# 23. Monetization — Pay-As-You-Go

**Pricing Model:** Users are charged **per API call** based on actual token usage, with a transparent markup over upstream cost.

### Pricing Formula

```
User Charge = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

Where:

- **Input / Output Price** = upstream provider cost + platform markup (e.g., 15–30% margin).
- Prices are published per-model and updated as upstream costs change.

---

# 24. Development Approach

Timeline is **not a constraint**. Priority is correctness, security, and reliability over speed.

**Phase 1 — Foundation**

- Chat completion endpoint (`/v1/chat/completions`)
- Streaming support (SSE) with connection management
- Provider Adapter framework + 2 initial providers (OpenRouter, Together AI)
- Basic auth + user API key generation
- Zod validation + Pino logging

**Phase 2 — Key Pool & Routing**

- Unlimited managed key pool architecture ($50/key cap)
- Model Mapping table
- Real-time credit tracking per key
- Automatic key rotation on exhaustion
- Key-level failover within the same provider
- Circuit breaker + emergency key reserve
- BullMQ background workers

**Phase 3 — Billing & Security**

- Pay-as-you-go balance system
- Stripe integration + idempotent webhook handling
- Real-time usage ledger
- Strict real-time credit tracking
- AES-256-GCM provider key encryption
- HMAC user key storage
- Rate limiting + abuse detection

**Phase 4 — Admin & Hardening**

- Admin API (REST) for operator management
- **User dashboard UI** (usage, billing, API keys, settings)
- **Admin dashboard UI** (provider keys, model mappings, user management, margin analytics, emergency controls)
- Health monitoring + margin analytics
- Load testing (target: 10k–50k requests/day)
- Security audit (penetration test, dependency scan)
- Production deployment with WAF + DDoS protection
- Data retention automation

**Phase 5 — Scale**

- Horizontal scaling (stateless nodes + shared Redis/Postgres)
- Additional providers via adapter plugins
- Additional endpoints (embeddings, images — if demand exists)
- Landing page, docs site, status page polish

---

# 25. Success Metrics

Track:

- successful request %
- average latency
- monthly profit
- token margin
- retention
- API uptime
- emergency reserve trigger frequency
- billing discrepancy rate

---

# 26. Biggest Risks & Mitigations

## Operational Risks

| Risk | Mitigation |
|------|------------|
| Provider outages | Multi-provider pool; automatic failover within <1s. Circuit breaker protects reserve. |
| Thin profit margins | Managed pool uses discounted keys + dynamic markup; margin tracked per-request. |
| API abuse / key theft | Rate limits, anomaly detection, IP allowlists, instant key revocation. |
| Provider key leakage | AES-256-GCM at rest, memory-only decryption, zero-logging policy. Rotation on any exposure. |
| Unexpected token burn | Real-time balance caps. Stream termination upon exhaustion. |
| User chargebacks / fraud | Pre-paid balance only. No post-paid billing to eliminate chargeback risk. Stripe fraud rules. |

## Security Risks

- **Database breach**: Provider keys are encrypted; master key is in external KMS (Production tier).
- **Insider threat**: No human has access to raw provider keys; all access is logged.
- **DDoS / L7 attacks**: Cloudflare WAF + rate limiting + anomaly detection.
- **Supply-side risk**: Provider API changes or account limits. Mitigation: Distribute managed pool across 5+ providers. No single point of failure.

---

# 27. Long-Term Expansion (Optional)

Possible future features:

- image generation
- embeddings
- AI workflows
- admin dashboard UI
- analytics UI
- team billing
- SDKs
- inference optimization
- additional deployment regions

---

# 28. Final Product Positioning

FluxAI Gateway is:

- an AI inference orchestration layer
- OpenAI-compatible
- provider-agnostic and model-agnostic
- quota-aware
- compliant and security-first
- optimized for rapid deployment and monetization

It is NOT:

- a GPU hosting platform
- a foundation model company
- a training platform
- a provider key reseller

---

# 29. Full-Stack Architecture

The FluxAI Gateway is built as a modern full-stack application with three distinct surfaces: a **public marketing/docs site**, a **user dashboard** for account and API management, and an **admin dashboard** for operator control — all backed by a unified Fastify API layer.

## 29.1 Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | **Next.js 15** (App Router) | SSR/SSG for landing/docs; SPA behavior for dashboard; co-hosts webhook handlers if needed |
| **Language** | TypeScript | End-to-end type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Rapid, consistent dashboard UI |
| **State / Data** | TanStack Query (React Query) | Server-state caching for usage, billing, logs |
| **Charts** | Recharts | Token burn, latency, margin visualizations |
| **Auth** | Clerk (or NextAuth.js) | Email/password + OAuth (Google/GitHub), JWT sessions, MFA-ready |
| **Payments** | Stripe Elements / Checkout | Hosted checkout for balance top-ups |
| **API Client** | tRPC or typed REST client | Type-safe calls to Fastify backend |

## 29.2 Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20+ LTS | Streaming-native, AI SDK ecosystem |
| **Framework** | Fastify | 2–3x faster than Express; native SSE; low memory |
| **Validation** | Zod | Runtime OpenAI schema enforcement |
| **ORM** | Drizzle ORM | Type-safe, lightweight SQL builder for gateway workloads |
| **Database** | PostgreSQL 15+ | ACID ledgers, JSONB capabilities, concurrent connections |
| **Cache / Queues** | Redis 7 + BullMQ | Rate limits, locks, idempotency, background workers |
| **Logging** | Pino | Structured, high-performance, trace ID propagation |
| **Crypto** | Node.js `crypto` (native) | AES-256-GCM, HMAC-SHA256 |

## 29.3 Infrastructure

| Layer | Technology |
|-------|-----------|
| **Reverse Proxy / Edge** | Cloudflare (WAF, DDoS, SSL, DNS) |
| **API Hosting** | Railway or Hetzner VPS (Docker) |
| **Frontend Hosting** | Vercel or Railway (Next.js) |
| **Monitoring** | Prometheus + Grafana + BetterStack + Sentry |
| **Process Manager** | PM2 (VPS mode) |

---

# 30. User Interface

The user-facing web application gives customers self-service access to usage analytics, billing, API key management, and support. All dashboard routes require authentication (Clerk/NextAuth session).

## 30.1 Marketing & Public Pages (No Auth)

| Route | Page | Description |
|-------|------|-------------|
| `GET /` | **Landing Page** | Hero, value prop, live provider latency ticker, CTA to signup |
| `GET /pricing` | **Pricing** | Per-model token pricing calculator, pay-as-you-go explanation |
| `GET /models` | **Model Directory** | Supported models table, provider badges, capabilities, pricing per 1M tokens |
| `GET /docs` | **Documentation Home** | Overview, integration guides, code snippets |
| `GET /docs/quickstart` | **Quickstart** | Copy-paste `curl` example with `sk_live_xxx` |
| `GET /docs/api-reference` | **API Reference** | Full OpenAI-compatible endpoint spec, request/response schemas |
| `GET /docs/sdks` | **SDKs** | Python, Node.js, Go integration examples |
| `GET /changelog` | **Changelog** | Product updates, new model announcements |
| `GET /status` | **System Status** | Public read-only provider health status page |

## 30.2 Authentication

| Route | Page | Description |
|-------|------|-------------|
| `GET /login` | **Sign In** | Email/password or magic link |
| `GET /register` | **Sign Up** | Account creation, email verification prompt |
| `GET /verify-email` | **Verify Email** | Token handler (`?token=xxx`) |
| `GET /forgot-password` | **Forgot Password** | Reset request form |
| `GET /reset-password` | **Reset Password** | New password form (`?token=xxx`) |

## 30.3 User Dashboard (Requires Auth)

| Route | Page | Backend Data Source |
|-------|------|---------------------|
| `GET /dashboard` | **Overview** | Balance, requests today, tokens burned, active keys, quick links, recent activity |
| `GET /dashboard/usage` | **Usage Analytics** | Token burn charts, request volume, latency percentiles, model breakdown, date filtering |
| `GET /dashboard/usage/[id]` | **Request Detail** | Single request metadata (tokens, cost, latency, status, provider, key ID). **Message content is never displayed by default.** |
| `GET /dashboard/billing` | **Billing & Balance** | Current balance, top-up CTA, Stripe Checkout redirect, transaction history (ledger), invoices |
| `GET /dashboard/billing/top-up` | **Top Up** | Stripe Checkout redirect or embedded Stripe Elements |
| `GET /dashboard/billing/payment-methods` | **Payment Methods** | Stripe Customer Portal iframe or managed card list |
| `GET /dashboard/api-keys` | **API Keys** | List of `sk_live_xxx` keys (masked), names, created dates, usage per key |
| `GET /dashboard/api-keys/create` | **Create Key** | Generate new key with optional name/label (raw key shown **once**) |
| `GET /dashboard/api-keys/[id]` | **Key Detail** | Per-key usage stats, edit label, revoke/rotate button |

## 30.4 User Settings (Requires Auth)

| Route | Page | Description |
|-------|------|-------------|
| `GET /settings` | **Settings Hub** | Redirects to profile |
| `GET /settings/profile` | **Profile** | Display name, email, timezone, avatar |
| `GET /settings/security` | **Security** | Change password, 2FA toggle, login history, active sessions, IP allowlist per API key |
| `GET /settings/notifications` | **Notifications** | Balance alerts (<$1), outage alerts, monthly usage report email toggle |
| `GET /settings/billing-address` | **Billing Address** | Invoice details, tax/VAT info for receipts |

## 30.5 Help Center

| Route | Page | Description |
|-------|------|-------------|
| `GET /help` | **Support Center** | Searchable knowledge base, FAQ |
| `GET /help/contact` | **Contact Support** | Ticket form or support email link |
| `GET /help/debug` | **Debug Logging** | Toggle opt-in request content logging for troubleshooting. Shows PII warning and 30-day retention notice. |

---

# 31. Admin Interface

The admin dashboard is a protected web surface for operators. Access is gated by an `isAdmin` role flag on the user or a separate admin identity provider.

| Route | Page | Description |
|-------|------|-------------|
| `GET /admin` | **Admin Overview** | KPIs: active users, daily revenue, system health, recent critical alerts, emergency reserve status |
| `GET /admin/users` | **User Management** | Paginated user list, search by email, status badges (active/suspended), quick suspend action |
| `GET /admin/users/[id]` | **User Detail** | Full profile, usage history, personal ledger, suspend/unsuspend controls, impersonate (read-only) |
| `GET /admin/provider-keys` | **Provider Key Pool** | All keys table: provider, status, remaining credits, emergency reserve badges, health indicators |
| `GET /admin/provider-keys/create` | **Add Provider Key** | Form to submit new upstream key (encrypted at rest immediately) |
| `GET /admin/model-mappings` | **Model Mappings** | Model alias → provider mapping table, inline pricing editor, status toggle |
| `GET /admin/model-mappings/create` | **Add Model** | Form to map a new model alias to a provider with pricing |
| `GET /admin/ledgers` | **Usage Ledger** | Immutable ledger browser, filter by user/date/type, read-only view |
| `GET /admin/margins` | **Margin Analytics** | Revenue charts, per-model margin breakdown, daily/weekly/monthly report export |
| `GET /admin/health` | **System Health** | Provider status grids, key pool health, BullMQ queue depth charts, circuit breaker states |
| `GET /admin/emergency` | **Emergency Controls** | Critical operations with confirmation modals: Drain Provider, Force Rotate All Keys, Global Rate Limit Override |

---

# 32. Backend Services & Architecture

## 32.1 Request Lifecycle (Inference Path)

```text
User Request (sk_live_xxx in Authorization header)
    ↓
Cloudflare (WAF, TLS termination, DDoS scrubbing)
    ↓
Fastify Gateway
    ↓
Auth Middleware (HMAC-SHA256 hash lookup of API key)
    ↓
Rate Limiter (Redis sliding window — per user, per IP, per model)
    ↓
Balance Check (Redis atomic read: if balance <= $0 → 402 Payment Required)
    ↓
Provider Mapper (PostgreSQL: SELECT provider FROM model_mappings WHERE model_alias = $1)
    ↓
Key Pool Manager (Redis: select ACTIVE key with highest remainingCredits for mapped provider)
    ↓
Provider Adapter (normalize OpenAI request → provider-native format)
    ↓
Stream Proxy & Connection Manager (AbortController, 60s/300s timeout)
    ↓
Upstream AI Provider API
    ↓
Provider Adapter (denormalize response → OpenAI format)
    ↓
Credit Deduction (Redis atomic decr provider credit + atomic decr user balance)
    ↓
Ledger Write (PostgreSQL INSERT INTO request_logs + usage_ledger, idempotency_key guarded)
    ↓
Response to User (JSON ChatCompletion or SSE data: ... stream)
```

## 32.2 Background Workers (BullMQ)

| Worker | Schedule | Responsibility |
|--------|----------|----------------|
| **Provider Health Checker** | Every 60s | Ping provider endpoints, update `provider_keys.status`, trigger circuit breaker if >5 failures in 5m |
| **Balance Sync Reconciler** | Every 5m | Poll upstream providers for actual credit balances (where API allows). Reconcile against internal ledger. Alert on discrepancy >1%. |
| **Expired Key Cleaner** | Every 10m | Archive EXHAUSTED keys, trigger pool replenishment alert if active pool < threshold |
| **Usage Analytics Aggregator** | Every 15m | Roll up per-user/per-model stats into time-series tables for dashboard charts |
| **Margin Report Generator** | Daily at 00:00 UTC | Generate daily/weekly/monthly margin reports, export for accounting |
| **Data Retention Enforcer** | Daily at 02:00 UTC | Purge request metadata >90 days, purge content logs >30 days, archive ledgers to cold storage after 7 years |

## 32.3 Service Layers

| Service | File/Module | Responsibility |
|---------|-------------|----------------|
| `AuthService` | `services/auth.ts` | API key HMAC validation, user session validation (dashboard), admin role checks |
| `RateLimitService` | `services/rate-limit.ts` | Redis-based sliding windows: RPM, tokens/day, concurrent request slots |
| `BalanceService` | `services/balance.ts` | Atomic balance checks, mid-stream balance exhaustion monitoring, top-up ledger entries |
| `KeyPoolService` | `services/key-pool.ts` | Key selection (highest remaining credits), rotation logic, emergency reserve fallback, circuit breaker state |
| `ProviderMapperService` | `services/provider-mapper.ts` | Model alias → provider lookup from PostgreSQL. Returns 404 if no exact match. |
| `ProviderAdapterService` | `services/provider-adapter.ts` | Registry of provider adapters. Delegates normalization, denormalization, stream chunk conversion, error mapping. |
| `StreamProxyService` | `services/stream-proxy.ts` | AbortController lifecycle, SSE zero-copy proxying via `reply.raw`, connection pool sizing, client disconnect handling |
| `LedgerService` | `services/ledger.ts` | Immutable `request_logs` + `usage_ledger` writes. Idempotency key deduplication via Redis TTL. |
| `EncryptionService` | `services/encryption.ts` | AES-256-GCM encrypt/decrypt for provider keys. Master key loaded from env/KMS. |
| `StripeWebhookService` | `services/stripe-webhook.ts` | Signature verification, idempotent top-up ledger entries, balance atomic update |

## 32.4 Concurrency & Safety Model

- **Redis atomic counters** (`DECR`) for provider key credits and user balances.
- **Request reservations**: Estimated cost is reserved in Redis for the duration of the request; released and reconciled with actual usage on completion.
- **Distributed locks** (Redis Redlock) for critical key rotation events (preventing double-rotation of the same exhausted key).
- **Idempotency keys**: All billing events carry `idempotency_key` stored in Redis with 24h TTL. Prevents double-spending on retries or Stripe webhook replays.
- **PostgreSQL ACID transactions**: Ledger writes use serializable transactions where provider state, user balance, and request log must all update atomically.

---

# 33. Complete Consolidated Route Reference

## 33.1 Public Inference API (OpenAI-Compatible)

**Base:** `https://api.fluxai.gateway`
**Auth:** `Authorization: Bearer sk_live_xxx`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/chat/completions` | Chat completion. Accepts `model`, `messages`, `stream`, `temperature`, `max_tokens`. Returns JSON or SSE. |

## 33.2 User Dashboard API (REST)

**Base:** `https://api.fluxai.gateway/api/user` (or `/api/user` via Next.js BFF)
**Auth:** Clerk/NextAuth JWT session cookie + CSRF token

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/user/me` | Current user profile, balance, status |
| `GET` | `/api/user/usage` | Aggregated usage by day/month for charts |
| `GET` | `/api/user/usage/:requestId` | Single request metadata (no content by default) |
| `GET` | `/api/user/ledger` | Personal `usage_ledger` entries |
| `GET` | `/api/user/api-keys` | List user's API keys (masked) |
| `POST` | `/api/user/api-keys` | Generate new API key (returns raw key **once**) |
| `DELETE` | `/api/user/api-keys/:id` | Revoke an API key |
| `POST` | `/api/user/top-up` | Create Stripe Checkout session |
| `GET` | `/api/user/invoices` | Billing history / invoice list |

## 33.3 Admin API (REST)

**Base:** `https://api.fluxai.gateway/admin`
**Auth:** `X-Admin-Key: <secret>` (or Admin JWT session with `isAdmin` role)

### Provider Keys
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/provider-keys` | Add new encrypted upstream key |
| `GET` | `/admin/provider-keys` | List all keys |
| `PATCH` | `/admin/provider-keys/:id/rotate` | Manually rotate key |
| `PATCH` | `/admin/provider-keys/:id/status` | Update key status |
| `DELETE` | `/admin/provider-keys/:id` | Archive key |

### Model Mappings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/model-mappings` | Create model alias mapping |
| `GET` | `/admin/model-mappings` | List mappings |
| `PATCH` | `/admin/model-mappings/:id` | Update pricing or provider model ID |
| `DELETE` | `/admin/model-mappings/:id` | Remove mapping |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | List all users |
| `PATCH` | `/admin/users/:id/suspend` | Suspend user |
| `PATCH` | `/admin/users/:id/unsuspend` | Unsuspend user |
| `GET` | `/admin/users/:id/usage` | Full usage for a user |

### Financials
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/margins?period=daily\|weekly\|monthly` | Margin reports |
| `GET` | `/admin/ledgers?user_id=xxx&limit=100` | Full ledger browser |
| `GET` | `/admin/balance-reconciliations` | Balance sync discrepancies |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/health/providers` | Provider uptime/latency |
| `GET` | `/admin/health/keys` | Key pool status |
| `GET` | `/admin/health/queues` | BullMQ queue depths |

### Emergency
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/emergency/drain-provider` | Disable all traffic to provider |
| `POST` | `/admin/emergency/rotate-all-keys` | Force rotate all keys for provider |

## 33.4 Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/webhooks/stripe` | Stripe Checkout / PaymentIntent webhooks. Idempotent top-up processing. |

## 33.5 Route Summary by Surface

| Surface | Count |
|---------|-------|
| Public Inference API | 1 |
| User Dashboard API | 9 |
| Admin API | 18 |
| Webhooks | 1 |
| **Backend Total** | **29** |
| Marketing / Public Pages | 9 |
| Auth Pages | 5 |
| User Dashboard Pages | 10 |
| User Settings Pages | 5 |
| Help Center Pages | 3 |
| Admin Dashboard Pages | 11 |
| **Frontend Total** | **43** |
| **Grand Total** | **72 routes/endpoints** |

---

# 34. Frontend-to-Backend Integration Notes

## 34.1 API Client Strategy

- The Next.js frontend uses a **typed API client** (generated from Zod schemas or OpenAPI spec) to communicate with the Fastify backend.
- **Public pages** (`/`, `/pricing`, `/models`, `/docs`, `/status`) may fetch static data at build time (SSG) or call lightweight public API endpoints for dynamic pricing/status.
- **Dashboard pages** use TanStack Query with **stale-while-revalidate** for usage charts and ledger data. Mutations (create API key, revoke, top-up) invalidate relevant query keys.
- **Server Components** (Next.js App Router) are used for initial data fetch on dashboard routes to reduce client-side waterfall requests.

## 34.2 Auth Flow

1. User signs up via Clerk/NextAuth (`/register`).
2. Clerk creates user in PostgreSQL `users` table via webhook (`POST /webhooks/clerk/user.created`) or NextAuth adapter.
3. User receives dashboard session cookie.
4. Dashboard API calls include session cookie; Fastify `AuthService` validates JWT and extracts `userId`.
5. **API key auth** (`sk_live_xxx`) remains entirely separate from session auth. API keys are for programmatic access; sessions are for dashboard access.

## 34.3 Stripe Integration

1. User clicks **Top Up** in dashboard.
2. Frontend calls `POST /api/user/top-up` with amount.
3. Backend creates Stripe Checkout Session with `idempotency_key` in metadata.
4. Frontend redirects to Stripe hosted checkout.
5. On success, Stripe redirects to `/dashboard/billing?success=1`.
6. Stripe webhook `POST /webhooks/stripe` fires asynchronously, atomically updating `users.balance` and `usage_ledger`.
7. Dashboard polls `/api/user/me` or uses Stripe webhook-to-SSE to reflect new balance in real-time.

## 34.4 WebSocket / Real-Time (Optional)

- For live balance updates and streaming usage charts, a lightweight **Server-Sent Events (SSE)** endpoint `/api/user/events` can stream account events (balance changes, key rotations, outage alerts) to the dashboard without maintaining persistent WebSocket connections.

---

*End of Updated PRD*
