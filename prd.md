# PRD — AI API Gateway & Key Pool Platform

## Product Name

**FluxAI Gateway** (OpenAI-Compatible Multi-Key AI API Gateway)

---

# 1. Product Overview

FluxAI Gateway is an OpenAI-compatible API platform that routes user AI requests
through a managed pool of upstream provider API keys.

The system automatically:

- selects healthy keys
- tracks credit usage
- switches exhausted keys
- balances traffic
- provides unified AI access through a single endpoint

Users interact only with FluxAI Gateway APIs, while the platform internally
manages upstream providers and key orchestration.

---

# 2. Core Objective

Build a lightweight, scalable AI inference gateway that:

- aggregates multiple upstream AI providers
- exposes OpenAI-compatible APIs
- automatically rotates exhausted paid keys
- minimizes downtime through failover
- allows rapid monetization with minimal infrastructure cost

---

# 3. Problem Statement

Many AI providers:

- impose per-key credit caps
- throttle requests
- have inconsistent uptime
- expose different APIs

Managing multiple keys manually becomes operationally inefficient.

FluxAI Gateway solves this by:

- abstracting providers
- centralizing routing
- automating key switching
- exposing one stable API interface

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
- multiple models
- failover reliability

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

System maintains an **unlimited pool** of upstream provider keys.

**Key Economics:**

- Each provider API key is pre-loaded with a **$50 credit cap**.
- Keys are acquired at **discounted rates** vs. retail pricing.
- When a key exhausts its $50, it is retired and replaced with a fresh key.

**Key State:**

```ts
type ProviderKey = {
    id: string;
    provider: string;
    apiKey: string;
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

---

# 5.4 Automatic Key Rotation

If:

- key quota exhausted
- provider failure
- timeout
- rate limit exceeded

System automatically:

- disables key temporarily/permanently
- selects next available key

No user interruption.

---

# 5.5 Multi-Provider Routing

Supported providers:

- OpenRouter
- Together AI
- Groq
- Fireworks
- DeepInfra

Routing engine determines:

- provider selection
- fallback order
- cheapest available inference path

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

**Real-Time Credit Deduction:**

- Deduct upstream cost from `provider_keys.remainingCredits` immediately after response.
- Deduct user charge from `users.balance` immediately after response.
- If streaming, deduct estimated cost upfront; reconcile on final chunk.

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

Background workers:

- test provider availability
- check latency
- validate keys
- sync balances

**Real-Time Balance Sync:**

- Poll upstream providers for actual credit balances where API allows.
- Reconcile provider-reported balances against internal ledger every 5 minutes.
- Alert on any discrepancy > 1%.

---

# 5.10 Logging & Analytics

Store:

- request logs
- provider selected
- failure reasons
- costs
- latency

---

# 6. Non-Goals (MVP)

The following are intentionally excluded initially:

- frontend dashboard (CLI / API only)
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
Rate Limiter
   ↓
Key Pool Manager
   ↓
Provider Router
   ↓
Provider Adapter
   ↓
AI Provider APIs
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

---

# Database

- PostgreSQL

Stores:

- users
- API keys
- provider keys
- logs
- usage metrics

---

# Cache / Coordination

- Redis

Used for:

- rate limiting
- distributed locks
- temporary counters
- hot key cache

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
  last_used TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMP             -- set when EXHAUSTED
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
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
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
    "stream": true
}
```

---

## Response

OpenAI-compatible JSON.

---

# 11. Routing Logic

# Model Routing

The gateway routes the **exact model name** provided in the `model` parameter to the appropriate upstream provider. No model substitution is performed.

Example:

```ts
// User requests gpt-4o
// Gateway routes to provider that supports "gpt-4o"
// The upstream request uses model: "gpt-4o"
```

Supported models depend entirely on provider availability.

---

# Provider Selection Priority

```text
Primary
   ↓
Fallback
   ↓
Backup
```

---

# Selection Rules

Prefer:

- active keys
- highest remaining credits
- lowest latency
- lowest current load

---

# 12. Failure Handling

# Provider Failures

Detect:

- 429
- 5xx
- timeout
- quota exceeded

Actions:

- mark key unhealthy
- retry with alternate key
- log failure

---

# Circuit Breaker

If repeated failures:

- disable provider temporarily

---

# 13. Concurrency Strategy

Problem: Multiple simultaneous requests may:

- overload same key
- exceed quota unexpectedly

Solution:

- Redis atomic counters
- request reservations
- locking

---

# 14. Security Requirements

## Architecture: Secure by Design

The gateway handles two highly sensitive asset classes: **upstream provider keys** (our supply) and **user API keys** (our demand). A breach of either is existential.

### Provider Key Protection

| Layer | Control |
|-------|---------|
| Storage | AES-256-GCM encryption at rest in PostgreSQL. Keys never stored in env vars or config files. |
| Encryption | Unique DEK per key, wrapped by a master key in a KMS (e.g., AWS KMS / HashiCorp Vault). |
| Memory | Keys decrypted only in-memory for the duration of the upstream request, then zeroed. |
| Access | Gateway process only. No human access. No logging of key values. |
| Rotation | If a key is ever exposed in a log or error trace, it is instantly revoked and replaced. |

### User Key Protection

- User API keys (`sk_live_xxx`) are stored as **HMAC-SHA256 hashes** with a server-side pepper.
- Only the gateway can validate a key; raw keys are never stored or logged.
- Keys are generated with 256-bit entropy.

### Runtime Security

- All traffic over **TLS 1.3** only.
- **mTLS** between internal services (gateway ↔ database ↔ Redis).
- **Request signing** and payload validation (max size, allowed fields, regex sanitization).
- **IP allowlisting** optional per-user API key.
- **Zero-trust network**: every internal call authenticated and authorized.

### Abuse & Fraud Prevention

- Rate limiting per user, per IP, per model.
- Anomaly detection: flag sudden token burn spikes, unusual model usage patterns, or geographic impossibilities.
- Input/output logging disabled by default; if enabled for debugging, PII is redacted.
- Circuit breaker on suspicious users: auto-suspend if usage pattern suggests key theft or scraping.

### Operational Security

- No SSH access to production nodes; deployment via immutable containers only.
- Secrets injected at runtime by orchestrator (Kubernetes / Railway), never in Git.
- Automated dependency scanning (Snyk / Dependabot) on every build.
- WAF (Cloudflare / AWS WAF) with OWASP Top-10 rulesets.
- DDoS protection at edge.

---

# 15. Monitoring

Track:

- active requests
- provider health
- token burn
- error rates
- average latency

Tools:

- Prometheus
- Grafana
- BetterStack

---

# 16. Scalability

Initial target:

- 100–500 users
- 10k–50k requests/day

Horizontal scaling:

- stateless API servers
- shared Redis/Postgres

---

# 17. Monetization — Pay-As-You-Go

**Pricing Model:** Users are charged **per API call** based on actual token usage, with a transparent markup over upstream cost.

### Pricing Formula

```
User Charge = (Input Tokens × Input Price) + (Output Tokens × Output Price)
```

Where:

- **Input / Output Price** = upstream provider cost + platform markup (e.g., 15–30% margin).
- Prices are published per-model and updated as upstream costs change.

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
- Users can top up via Stripe / crypto / bank transfer (manual for MVP).

### Margin Economics

- Upstream keys purchased at **discounted rates**.
- Platform adds a **fixed percentage markup** on every token.
- Real-time margin per request = user charge − upstream cost.
- Daily / weekly margin reports generated automatically.

### Example Pricing (Illustrative)

| Model | Upstream Cost (per 1M tokens) | User Price (per 1M tokens) | Platform Margin |
|-------|-------------------------------|----------------------------|-----------------|
| gpt-4o | $2.50 input / $10.00 output | $3.00 input / $12.00 output | ~20% |
| llama-3-70b | $0.90 input / $0.90 output | $1.10 input / $1.10 output | ~22% |

Prices are dynamic and adjusted based on provider discount tiers.

---

# 18. Development Approach

Timeline is **not a constraint**. Priority is correctness, security, and reliability over speed.

**Phase 1 — Foundation**

- Chat completion endpoint (`/v1/chat/completions`)
- Streaming support (SSE)
- Provider forwarding with exact model passthrough
- Basic auth + user API key generation

**Phase 2 — Key Pool & Routing**

- Unlimited key pool architecture ($50/key cap)
- Real-time credit tracking per key
- Automatic key rotation on exhaustion
- Multi-provider failover logic

**Phase 3 — Billing & Security**

- Pay-as-you-go balance system
- Real-time usage ledger
- AES-256-GCM provider key encryption
- HMAC user key storage
- Rate limiting + abuse detection

**Phase 4 — Hardening**

- Health monitoring + circuit breakers
- Margin analytics + cost reconciliation
- Load testing (target: 10k–50k requests/day)
- Security audit (penetration test, dependency scan)
- Production deployment with WAF + DDoS protection

**Phase 5 — Scale**

- Horizontal scaling (stateless nodes + shared Redis/Postgres)
- Additional providers
- Additional endpoints (embeddings, images — if demand exists)

---

# 19. Success Metrics

Track:

- successful request %
- average latency
- monthly profit
- token margin
- retention
- API uptime

---

# 20. Biggest Risks & Mitigations

## Operational Risks

| Risk | Mitigation |
|------|------------|
| Provider outages | Multi-provider pool; automatic failover within <1s. |
| Thin profit margins | Discounted upstream keys + dynamic markup; margin tracked per-request. |
| API abuse / key theft | Rate limits, anomaly detection, IP allowlists, instant key revocation. |
| Provider key leakage | AES-256-GCM at rest, memory-only decryption, zero-logging policy. |
| Unexpected token burn | Real-time balance caps; pre-flight cost estimation on large requests. |
| User chargebacks / fraud | Pre-paid balance only; no post-paid billing to eliminate chargeback risk. |

## Security Risks

- **Database breach**: Provider keys are encrypted; master key is in external KMS.
- **Insider threat**: No human has access to raw provider keys; all access is logged.
- **DDoS / L7 attacks**: Cloudflare WAF + rate limiting + anomaly detection.
- **Supply-side risk**: Provider bans key-pool behavior. Mitigation: distribute across 5+ providers, no single point of failure.

---

# 21. Long-Term Expansion (Optional)

Possible future features:

- image generation
- embeddings
- AI workflows
- dashboard
- analytics UI
- team billing
- SDKs
- inference optimization

---

# 22. Final Product Positioning

FluxAI Gateway is:

- an AI inference orchestration layer
- OpenAI-compatible
- provider-agnostic
- quota-aware
- optimized for rapid deployment and monetization

It is NOT:

- a GPU hosting platform
- a foundation model company
- a training platform 1`
