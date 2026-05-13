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

System maintains multiple upstream provider keys.

Each key contains:

```ts
type ProviderKey = {
    id: string;
    provider: string;
    apiKey: string;
    remainingCredits: number;
    status: "ACTIVE" | "EXHAUSTED" | "ERROR";
    lastUsed: Date;
};
```

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

# 5.7 Usage Tracking

Track:

- request count
- token usage
- response latency
- provider cost
- user quota

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

- frontend dashboard
- billing automation
- subscriptions
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
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP
);
```

---

# api_keys

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id UUID,
  hashed_key TEXT,
  quota_remaining FLOAT,
  created_at TIMESTAMP
);
```

---

# provider_keys

```sql
CREATE TABLE provider_keys (
  id UUID PRIMARY KEY,
  provider TEXT,
  api_key TEXT,
  remaining_credits FLOAT,
  status TEXT,
  last_used TIMESTAMP
);
```

---

# request_logs

```sql
CREATE TABLE request_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  provider TEXT,
  model TEXT,
  tokens_input INT,
  tokens_output INT,
  cost FLOAT,
  latency_ms INT,
  status TEXT,
  created_at TIMESTAMP
);
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

# Model Mapping

```ts
const MODEL_MAP = {
    "gpt-4o": {
        provider: "openrouter",
        upstreamModel: "deepseek/deepseek-chat-v3",
    },
};
```

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

## Must Have

- HTTPS
- encrypted env vars
- hashed API keys
- server-side provider keys only
- request validation

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

# 17. Monetization

## Pricing Examples

### Starter

```text
$5
```

### Builder

```text
$15
```

### Power

```text
$50
```

---

# 18. MVP Timeline

# Day 1

Build:

- chat endpoint
- provider forwarding
- streaming

---

# Day 2

Add:

- auth
- key pool
- rotation
- usage tracking

---

# Day 3

Add:

- rate limiting
- failover
- logging

---

# Day 4

Deploy + testing.

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

# 20. Biggest Risks

## Operational Risks

- provider outages
- thin profit margins
- API abuse
- key leakage
- unexpected token burn

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
