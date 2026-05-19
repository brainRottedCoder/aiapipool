# FluxAI Gateway — Backend Testing & Verification Guide

> **Purpose:** This document is the authoritative quality gate for the FluxAI Gateway backend. It verifies that every phase of `backend.md` has been implemented correctly, that no bugs or vulnerabilities exist, that code quality standards are met, and that all architectural decisions have been respected. **No phase is complete until all its checks pass.**

---

## 0. How To Use This Document

Each phase below maps directly to `backend.md` Section 18. For every phase:

1. **Run the checklist** — every item must be **☐** or **✅** before advancing.
2. **Run the tests** — each phase has a test command to execute.
3. **Run the lint/vulnerability scan** — automated tools catch what manual review misses.
4. **Sign off** — the phase is not considered complete until a reviewer signs off.

**Scoring Legend:**
- ✅ PASS — meets requirement exactly
- ⚠️ WARN — works but deviates from spec or has a minor issue (document what)
- ❌ FAIL — broken, missing, or violates a security/financial invariant (blocking)

**Gates:** ❌ = cannot proceed to next phase. ⚠️ = note and proceed, must be resolved before production.

---

## Phase-by-Phase Verification

---

### Phase 1: Monorepo & Foundation Layer

**What It Covers:** Project scaffolding, environment validation, shared contracts, types, and utilities.

#### 1.1 File Existence & Structure

| Check | Expected | Result |
|-------|----------|--------|
| `turbo.json` exists at root | Monorepo configured | ☐ |
| `packages/shared/package.json` exists | Shared package exists | ☐ |
| `packages/shared/src/schemas.ts` exists | Shared Zod schemas | ☐ |
| `packages/shared/src/types.ts` exists | Shared TS types | ☐ |
| `apps/api/package.json` exists with all dependencies from Section 17 | Dependencies match spec | ☐ |
| `apps/api/tsconfig.json` exists with `strict: true` | Strict TypeScript | ☐ |
| `apps/api/src/config/env.ts` exists | Env validation | ☐ |
| `apps/api/src/config/constants.ts` exists | Constants file | ☐ |
| `apps/api/src/types/openai.ts` exists | OpenAI types | ☐ |
| `apps/api/src/types/provider.ts` exists | Provider interface | ☐ |
| `apps/api/src/types/common.ts` exists | Common types (RequestContext) | ☐ |
| `apps/api/src/utils/errors.ts` exists | Error factory | ☐ |
| `apps/api/src/utils/id.ts` exists | ID generators | ☐ |
| `apps/api/src/utils/cost.ts` exists | Cost helpers | ☐ |

#### 1.2 Environment Validation

| Check | Test | Result |
|-------|------|--------|
| Missing `DATABASE_URL` crashes with clear error | `DATABASE_URL='' pnpm dev` exits immediately | ☐ |
| Missing `REDIS_URL` crashes with clear error | `REDIS_URL='' pnpm dev` exits immediately | ☐ |
| Missing `NEXTAUTH_SECRET` crashes | `NEXTAUTH_SECRET='' pnpm dev` exits immediately | ☐ |
| `STRIPE_SECRET_KEY` validates prefix (`sk_`) | Pass `sk_test_notreal` → accepted; pass `bad_key` → rejected | ☐ |
| TypeScript compiles with zero errors | `pnpm tsc --noEmit` passes | ☐ |
| All env vars have correct Zod types (string, url, number, enum) | Manual review of `envSchema` | ☐ |
| Zod `.strict()` is used on all Schemas | Manual review of all schema files | ☐ |

#### 1.3 Types & Interfaces

| Check | Expected | Result |
|-------|----------|--------|
| `OpenAIChatRequest` schema validates `model`, `messages` as required | Missing `model` returns 400 | ☐ |
| `OpenAIChatResponse` matches OpenAI spec exactly | Compare to [OpenAI API reference](https://platform.openai.com/docs/api-reference/chat/create) | ☐ |
| `OpenAIStreamChunk` has `delta` (not `message`) in choices | Compare to OpenAI SSE spec | ☐ |
| `ProviderAdapter` interface has all 6 methods | normalizeRequest, denormalizeResponse, denormalizeStreamChunk, mapError, supportsModel, estimateCost | ☐ |
| `RequestContext` has `requestId`, `user`, `apiKey`, `startTime` | Check `common.ts` | ☐ |

#### 1.4 Error Factory

| Check | Expected HTTP → OpenAIType mapping | Result |
|-------|-----------------------------------|--------|
| `400` → `invalid_request_error` | Error factory produces correct `type` | ☐ |
| `401` → `authentication_error` | | ☐ |
| `402` → `billing_error` | | ☐ |
| `404` → `not_found_error` | | ☐ |
| `429` → `rate_limit_error` | | ☐ |
| `500/502/503` → `server_error` | | ☐ |
| Error response has `{ error: { message, type, code, param } }` structure | All fields present | ☐ |

#### 1.5 Automated Checks

```bash
pnpm tsc --noEmit                  # Zero type errors
pnpm lint                          # Zero lint errors
pnpm test -- --run                 # All unit tests pass
cd apps/api && npx vitest run      # Phase 1-specific tests
```

#### 1.6 Security Gate

| Check | Result |
|-------|--------|
| No `.env` or secret files committed to git | ☐ |
| `.env.example` has placeholder values only | ☐ |
| `turbo.json` doesn't expose sensitive env vars | ☐ |

**Phase 1 Sign-off:** __________ Date: __________

---

### Phase 2: Database Layer

**What It Covers:** Drizzle ORM schema, database client, migrations, all 9 tables.

#### 2.1 Schema Completeness

| Table | Verify Columns Match Spec | Result |
|-------|---------------------------|--------|
| `users` | `id`, `email` (unique), `password_hash`, `emailVerified`, `balance` (decimal 12,4), `status`, `role` (enum: user,admin), `created_at` | ☐ |
| `apiKeys` | `id`, `userId` (FK→users), `hashed_key`, `key_prefix` (varchar 12), `name`, `rate_limit_rpm`, `rate_limit_tokens_day`, `status`, `created_at` | ☐ |
| `providerKeys` | `id`, `provider`, `api_key_encrypted` (bytea), `initial_credits`, `remaining_credits`, `status` (ACTIVE/EXHAUSTED/ERROR/ROTATING), `is_emergency_reserve`, `last_used`, `created_at`, `archived_at` | ☐ |
| `modelMappings` | `id`, `model_alias` (unique), `provider`, `provider_model_id`, `pricing_input`, `pricing_output`, `capabilities` (jsonb), `status`, `created_at` | ☐ |
| `requestLogs` | `id`, `user_id`, `api_key_id`, `provider_key_id`, `provider`, `model`, `tokens_input`, `tokens_output`, `upstream_cost`, `user_charge`, `margin`, `latency_ms`, `status`, `idempotency_key` (unique), `created_at` | ☐ |
| `usageLedger` | `id`, `user_id`, `request_log_id`, `amount`, `balance_after`, `type` (api_usage/topup/refund/adjustment), `idempotency_key` (unique), `created_at` | ☐ |
| `accounts` | `id`, `userId` (FK→users), `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state` | ☐ |
| `sessions` | `id`, `sessionToken` (unique), `userId` (FK→users), `expires` | ☐ |
| `verificationTokens` | `identifier`, `token`, `expires` | ☐ |

#### 2.2 Schema Correctness

| Check | Test | Result |
|-------|------|--------|
| `users.role` defaults to `'user'` | Insert without role → defaults to 'user' | ☐ |
| `accounts` has composite unique on (`provider`, `providerAccountId`) | Insert duplicate → unique violation | ☐ |
| `verificationTokens` has composite PK on (`identifier`, `token`) | Check generated SQL | ☐ |
| `providerKeys.remaining_credits` default is 50.00 | Insert without value → defaults to 50.00 | ☐ |
| `modelMappings.capabilities` defaults to `'{}'` | Insert without value → defaults to empty JSON | ☐ |
| All monetary fields use `decimal` (not `float` or `double precision`) | Check column types in PostgreSQL | ☐ |
| `requestLogs.idempotency_key` has UNIQUE constraint | Insert duplicate → unique violation | ☐ |
| `usageLedger.idempotency_key` has UNIQUE constraint | Insert duplicate → unique violation | ☐ |

#### 2.3 Indexes

| Check | Expected Index | Result |
|-------|---------------|--------|
| `request_logs` index on `(user_id, created_at DESC)` | `idx_request_logs_user_created` | ☐ |
| `request_logs` index on `(idempotency_key)` | `idx_request_logs_idempotency` | ☐ |
| `usage_ledger` index on `(user_id, created_at DESC)` | `idx_usage_ledger_user_created` | ☐ |

```sql
-- Verify indexes exist:
SELECT indexname FROM pg_indexes WHERE tablename IN ('request_logs', 'usage_ledger');
```

#### 2.4 Connection Pool

| Check | Test | Result |
|-------|------|--------|
| Pool `max` is configurable (default 20) | Check `db/client.ts` | ☐ |
| Pool has `idleTimeoutMillis` | Connections close after idle | ☐ |
| Pool has `connectionTimeoutMillis` | Fails fast when DB unreachable | ☐ |
| Pool error event logs but does NOT crash | Simulate DB disconnect | ☐ |

#### 2.5 Migration Tests

```bash
pnpm db:generate                  # Generates migration files without errors
pnpm db:migrate                   # Applies all migrations successfully
pnpm db:migrate                   # Second run: "No migrations to apply"
```

| Check | Expected | Result |
|-------|----------|--------|
| `drizzle-kit generate` produces SQL files | Check `migrations/` directory | ☐ |
| `drizzle-kit migrate` applies all tables | All 9 tables exist in PostgreSQL | ☐ |
| Migration is idempotent (running again is a no-op) | Second migration returns "already applied" or equivalent | ☐ |
| `pnpm db:studio` opens Drizzle Studio (local) | Visual schema inspection works | ☐ |

#### 2.6 Security Gate

| Check | Result |
|-------|--------|
| `api_key_encrypted` is `bytea` (not `text` or `varchar`) | ☐ |
| `hashed_key` stores HMAC, not raw API key | ☐ |
| No raw secrets in migration files | ☐ |
| No `DROP TABLE` or destructive statements in migrations | ☐ |

**Phase 2 Sign-off:** __________ Date: __________

---

### Phase 3: External Infrastructure

**What It Covers:** Redis client, Azure Key Vault, BullMQ queue skeleton.

#### 3.1 Redis Client

| Check | Test | Result |
|-------|------|--------|
| ioredis connects successfully | `redis.ping()` returns `PONG` | ☐ |
| `redis` singleton exported | Other modules import same instance | ☐ |
| `subscriberRedis` separate instance exists | Different connection for pub/sub | ☐ |
| `enableOfflineQueue: false` configured | Redis down → immediate error, no queuing | ☐ |
| `reconnectOnError` handles `READONLY` | Azure Redis failover support | ☐ |
| `maxRetriesPerRequest` is set (≤3) | Not unlimited retries | ☐ |
| `retryStrategy` has exponential backoff with cap | Check `redis/client.ts` | ☐ |
| Redis `error` event logs but does NOT crash process | Spawn process, kill Redis, verify API stays up | ☐ |

#### 3.2 Azure Key Vault (if `AZURE_KEY_VAULT_URL` is set)

| Check | Test | Result |
|-------|------|--------|
| `DefaultAzureCredential` used for auth | Managed identity in production, Azure CLI in dev | ☐ |
| `MASTER_ENCRYPTION_KEY` fetched before Zod validation | Startup fails fast if KV unreachable | ☐ |
| Fallback to env var if `AZURE_KEY_VAULT_URL` is not set | Works locally without Azure | ☐ |
| Secret value cached for process lifetime (not re-fetched per request) | No KV API call per request | ☐ |

#### 3.3 BullMQ Skeleton

| Check | Expected | Result |
|-------|----------|--------|
| 6 queues created: `health-check`, `balance-sync`, `key-cleanup`, `analytics`, `margin-report`, `data-retention` | Queue names created in Redis | ☐ |
| Worker instances created (handlers can be stubs) | Workers registered | ☐ |
| `worker.close()` called on graceful shutdown | Workers drain before exit | ☐ |
| Queues visible in Redis (`KEYS bull:*`) | Check Redis CLI | ☐ |

```bash
# Verify queues exist:
redis-cli KEYS "bull:*"
```

#### 3.4 Manual Resilience Test

| Test Scenario | Expected Behavior | Result |
|---------------|-------------------|--------|
| Redis goes down mid-request | API returns 503 on Redis-dependent operations, 200 on Redis-independent | ☐ |
| Redis restarts | `reconnectOnError` triggers, connection restored | ☐ |
| Database goes down | API returns 503, pool reconnects on next query | ☐ |

#### 3.5 Security Gate

| Check | Result |
|-------|--------|
| Redis connection uses TLS in production | ☐ |
| Redis password not logged in plaintext | ☐ |
| Azure Managed Identity used (not hardcoded credentials) | ☐ |

**Phase 3 Sign-off:** __________ Date: __________

---

### Phase 4: Cryptography & Security Primitives

**What It Covers:** AES-256-GCM encryption, HMAC-SHA256 hashing.

#### 4.1 Encryption (`crypto/encryption.ts`)

| Check | Test | Result |
|-------|------|--------|
| `encrypt(plaintext, masterKey)` returns Buffer | Type check | ☐ |
| `decrypt(ciphertext, masterKey)` returns original plaintext | Roundtrip test | ☐ |
| IV is random per encryption | Encrypt same plaintext twice → different ciphertexts | ☐ |
| IV is 16 bytes | Check implementation | ☐ |
| Auth tag is 16 bytes | Check implementation | ☐ |
| Ciphertext cannot be decrypted with wrong key | Negative test | ☐ |
| Tampered ciphertext throws (caught auth tag mismatch) | Flip a byte in ciphertext, decrypt → error | ☐ |
| HKDF used for DEK derivation (not raw master key) | Check `crypto.createHmac` or `crypto.hkdf` | ☐ |
| Decrypted buffer is zero-filled after use | Check `buffer.fill(0)` call | ☐ |

#### 4.2 HMAC (`crypto/hmac.ts`)

| Check | Test | Result |
|-------|------|--------|
| `hashApiKey(rawKey, pepper)` returns hex string | Type and format check | ☐ |
| Hash is deterministic (same input → same output) | Verify twice | ☐ |
| Hash length is SHA-256 (64 hex chars) | Check output length | ☐ |
| `verifyApiKey` uses `crypto.timingSafeEqual` (NOT `===`) | Code review — this is critical | ☐ |
| Wrong key fails verification | Negative test | ☐ |
| Pepper changed → hash totally different | Verifies pepper is used correctly | ☐ |

#### 4.3 Key Management

| Check | Expected | Result |
|-------|----------|--------|
| Master encryption key ≥ 32 bytes and loaded from env/Key Vault | Check `MASTER_ENCRYPTION_KEY` length | ☐ |
| API key pepper ≥ 32 bytes from env | Check `API_KEY_PEPPER` length | ☐ |
| No hardcoded keys in source code (`grep -r "key" src/`) | No matches (except env references) | ☐ |
| Encryption keys never logged (checked via Pino redact) | Check log output for key material | ☐ |

```bash
pnpm test -- crypto/encryption.test.ts
pnpm test -- crypto/hmac.test.ts
```

#### 4.4 Security Gate — CRITICAL

| Check | Result |
|-------|--------|
| **`timingSafeEqual` used in `verifyApiKey`** — timing attack vector if not | ☐ |
| Decrypted plaintext is zero-filled after use | ☐ |
| No key material in test files or snapshots | ☐ |
| No `console.log` of any key or secret | ☐ |

**Phase 4 Sign-off:** __________ Date: __________

---

### Phase 5: Middleware Stack

**What It Covers:** Request ID, API key auth, NextAuth session auth, admin auth, rate limiting.

#### 5.1 Request ID Middleware

| Check | Test | Result |
|-------|------|--------|
| Injects `request.id` on every request | Check Fastify `request.id` | ☐ |
| Reads `x-request-id` header if present | Set header → request.id matches | ☐ |
| Generates UUID if header missing | `request.id` is a valid UUID | ☐ |
| Propagated to Pino child logger | Log output includes `requestId` field | ☐ |

#### 5.2 Bearer API Key Auth (`auth.ts`)

| Check | Test | Result |
|-------|------|--------|
| Missing `Authorization` header → 401 `authentication_error` | `curl /v1/chat/completions -d '{"model":"test"}'` | ☐ |
| Invalid API key → 401 `authentication_error` | `curl -H "Authorization: Bearer invalid"` | ☐ |
| Revoked/inactive key → 401 `authentication_error` | Set `api_keys.status = 'revoked'` → auth fails | ☐ |
| Suspended user → 403 `authentication_error` | Set `users.status = 'suspended'` → auth fails | ☐ |
| Valid key → attaches `{ user, apiKey }` to request | Check `request.user` and `request.apiKey` | ☐ |
| Token comparison NOT vulnerable to timing attacks (uses DB lookup, not string compare) | `hashed_key` lookup is indexed, OK | ☐ |

#### 5.3 Session Auth (`session-auth.ts`) — CRITICAL

| Check | Test | Result |
|-------|------|--------|
| Cookie: `next-auth.session-token` extracted | Send valid cookie → authenticated | ☐ |
| `Authorization: Bearer <token>` extracted (cross-domain) | Send Bearer header → authenticated | ☐ |
| Neither present → 401 | Missing both → 401 | ☐ |
| Expired session token → 401 | Set `sessions.expires` in the past → 401 | ☐ |
| Session not found in DB → 401 | Send random string → 401 | ☐ |
| Suspended user → 403 | Set `users.status = 'suspended'` → 403 | ☐ |

**BUG CHECK:** Does the middleware correctly handle the case where the `Authorization` header is NOT a NextAuth session token (e.g., it's an API key)? The `/api/user/*` routes should NOT accept Bearer API keys — they should ONLY validate session tokens. Verify:
```bash
# This should FAIL (API keys should not grant dashboard access):
curl -H "Authorization: Bearer sk_live_validApiKey123" http://localhost:3000/api/user/me
# Expected: 401
```

| Check | Result |
|-------|--------|
| API key (`sk_live_*`) rejected on `/api/user/*` routes | ☐ |
| Session token accepted on `/api/user/*` routes | ☐ |

#### 5.4 Admin Auth (`admin-auth.ts`)

| Check | Test | Result |
|-------|------|--------|
| Valid `X-Admin-Key` → admin access granted | Send correct header → 200 | ☐ |
| Invalid `X-Admin-Key` → 401 | Send wrong key → 401 | ☐ |
| `X-Admin-Key` comparison uses `crypto.timingSafeEqual` | Code review | ☐ |
| Session with `role: 'admin'` → admin access granted | Send admin session → 200 | ☐ |
| Session with `role: 'user'` → 401 on admin routes | Send user session → 401 | ☐ |
| Neither → 401 | No auth → 401 | ☐ |

#### 5.5 Rate Limiter

| Check | Test | Result |
|-------|------|--------|
| RPM limit enforced (default 60) | Send 61 requests in 60s → 429 | ☐ |
| Concurrent request limit enforced (default 10) | Send 11 concurrent → 429 | ☐ |
| 429 response has `rate_limit_error` type | Check error body | ☐ |
| Rate limit keys are per `apiKeyId` (not global) | Key A exhausted ≠ Key B blocked | ☐ |
| Redis keys have TTL (60s for RPM) | Check `TTL rl:rpm:{id}` in Redis | ☐ |
| `rl:concurrent:{apiKeyId}` is DECR'd on response end | Check Redis after request completes | ☐ |

**BUG CHECK:** If Redis is down, does the rate limiter:
- [ ] Fail open (allow traffic)? → ✅ This is the spec choice (Section 23.2)
- [ ] Fail closed (block all traffic)? → If so, fix it

| Redis-down rate limit behavior | Result |
|--------------------------------|--------|
| Traffic is allowed (not blocked) when Redis is unreachable | ☐ |

#### 5.6 Middleware Ordering

| Check | Expected Order | Result |
|-------|---------------|--------|
| `request-id` runs FIRST (before any auth/rate-limit) | Check `app.ts` registration order | ☐ |
| For `/v1/*`: `authenticateUser` → `rateLimiter` | Check route plugin setup | ☐ |
| For `/api/user/*`: `request-id` → `authenticateSession` | Check route plugin setup | ☐ |
| For `/admin/*`: `request-id` → `authenticateAdmin` | Check route plugin setup | ☐ |

#### 5.7 Automated Checks

```bash
pnpm test -- middleware/auth.test.ts
pnpm test -- middleware/session-auth.test.ts
pnpm test -- middleware/admin-auth.test.ts
pnpm test -- middleware/rate-limiter.test.ts
```

#### 5.8 Security Gate

| Check | Result |
|-------|--------|
| No session token logged in plaintext | ☐ |
| No API key logged in plaintext (check Pino redaction) | ☐ |
| No admin key logged in plaintext | ☐ |
| Rate limiter cannot be bypassed by omitting headers | ☐ |
| Timing attack vector checked on all auth comparisons | ☐ |

**Phase 5 Sign-off:** __________ Date: __________

---

### Phase 6: Provider Adapter Framework

**What It Covers:** Base adapter, registry, 6 provider implementations.

#### 6.1 Base Adapter

| Check | Test | Result |
|-------|------|--------|
| `normalizeRequest` pass-through (OpenAI→OpenAI identity) | Input == Output for OpenAI-compatible | ☐ |
| `denormalizeResponse` pass-through | Input == Output | ☐ |
| `denormalizeStreamChunk` parses SSE `data: {...}` line | Valid SSE → parsed chunk | ☐ |
| `denormalizeStreamChunk` returns null for `data: [DONE]` | [DONE] → null | ☐ |
| `mapError(429, ?)` → rate_limit_error | Status code mapping | ☐ |
| `mapError(5xx, ?)` → server_error | Status code mapping | ☐ |
| `mapError(401, ?)` → auth_error | Status code mapping | ☐ |

#### 6.2 Provider Registry

| Check | Test | Result |
|-------|------|--------|
| All 6 providers registered | `openrouter`, `together`, `groq`, `openai`, `anthropic`, `gemini` | ☐ |
| `getAdapter('openrouter')` returns adapter | Registry lookup works | ☐ |
| `getAdapter('unknown')` throws with clear error | Unknown provider → error | ☐ |

#### 6.3 Individual Adapter Tests

**OpenRouter:**
| Check | Result |
|-------|--------|
| Adds `HTTP-Referer` header | ☐ |
| Adds `X-Title` header | ☐ |
| normalizeRequest passes through body correctly | ☐ |

**OpenAI, Together, Groq (pass-through):**
| Check | Result |
|-------|--------|
| `normalizeRequest` identity function | ☐ |
| `denormalizeResponse` identity function | ☐ |
| Base URL is correct for each provider | ☐ |

**Anthropic (full override):**
| Check | Test Data | Result |
|-------|-----------|--------|
| System message moved to top-level `system` field | `[{role:"system",content:"You are..."},{role:"user",content:"Hi"}]` → `{system:"You are...",messages:[{role:"user",content:"Hi"}]}` | ☐ |
| `Authorization` uses `x-api-key` header (not `Bearer`) | Header check | ☐ |
| `max_tokens` is included in request (required by Anthropic) | Request body includes `max_tokens` | ☐ |
| Streaming: Anthropic SSE format → OpenAI delta chunks | Feed real Anthropic SSE from test fixture → OpenAI delta output | ☐ |
| Non-streaming: Anthropic response → OpenAI `ChatCompletion` | Feed Anthropic response fixture → OpenAI format | ☐ |

**Gemini (full override):**
| Check | Test Data | Result |
|-------|-----------|--------|
| Messages converted to Gemini `contents` format | OpenAI messages → Gemini contents array | ☐ |
| `maxOutputTokens` used (not `max_tokens`) | Request body field name | ☐ |
| Streaming: Gemini SSE format → OpenAI delta chunks | Feed Gemini SSE fixture → OpenAI delta output | ☐ |
| Non-streaming: Gemini response → OpenAI `ChatCompletion` | Feed Gemini response fixture → OpenAI format | ☐ |

#### 6.3 Adapter Error Mapping

| Provider Error Code | OpenAI Type Expected | Result |
|---------------------|---------------------|--------|
| 429 (any provider) | `rate_limit_error` | ☐ |
| 5xx (any provider) | `server_error` | ☐ |
| Anthropic 400 (invalid_request) | `invalid_request_error` | ☐ |
| Gemini 403 (permission denied) | `authentication_error` | ☐ |
| Network timeout | `server_error` | ☐ |

#### 6.4 Automated Checks

```bash
pnpm test -- providers/
```

#### 6.5 Bug & Vulnerability Scan

| Check | Finding | Result |
|-------|---------|--------|
| Do any adapters log the raw API key? | `grep -r "apiKey" providers/` → should NOT appear in log calls | ☐ |
| Does normalizeRequest mutate the input? | Should return new object, not modify input | ☐ |
| Does stream chunk denormalization handle partial/malformed JSON? | Send broken SSE → error, not crash | ☐ |
| Are all adapters stateless (no instance variables holding request data)? | Code review — adapters must be reusable across requests | ☐ |

**Phase 6 Sign-off:** __________ Date: __________

---

### Phase 7: Core Business Services

**What It Covers:** Provider mapper, key pool, circuit breaker, balance, ledger, stream proxy, billing.

#### 7.1 Provider Mapper

| Check | Test | Result |
|-------|------|--------|
| `resolveModel("gpt-4o")` finds mapping in DB | Mocked DB query → returns mapping | ☐ |
| Unknown model → returns `null` (does NOT throw) | `resolveModel("nonexistent")` → null | ☐ |
| Redis cache hit bypasses DB | Cache populated → no DB query on second call | ☐ |
| Redis cache TTL is 60s | Check `SETEX model:alias ... 60` call | ☐ |
| Only returns `status = 'ACTIVE'` mappings | Inactive mapping → not returned | ☐ |

#### 7.2 Key Pool Manager

| Check | Test | Result |
|-------|------|--------|
| `acquireKey("openrouter")` returns key with highest `remaining_credits` | Multiple ACTIVE keys → highest credits selected | ☐ |
| Exhausted keys (`remaining_credits <= 1.00`) are excluded | Key with 0.50 credits → not returned | ☐ |
| Emergency reserve keys NOT returned for normal traffic | `is_emergency_reserve = true` → not returned unless no normal keys | ☐ |
| Emergency reserve returned when no normal keys → logs CRITICAL | All normal keys exhausted → emergency key returned + log | ☐ |
| No keys at all → throws 503 | No keys in DB → 503 error | ☐ |
| `releaseKey(keyId, 0.50)` decrements Redis counter | Counter drops by 0.50 | ☐ |
| `releaseKey` marks `EXHAUSTED` when credits reach 0 | decrement below 0 → status = 'EXHAUSTED' | ☐ |
| `markKeyUnhealthy(keyId, "timeout")` sets ERROR status + feeds circuit breaker | Status updated + `recordFailure` called | ☐ |

**BUG CHECK:** Concurrent `acquireKey` calls must not return the same key (unless that's acceptable). The spec says "select highest remaining credits" — if two requests arrive at the same instant, they'll both get the same key. Is this OK?
- [ ] YES — Redis can handle the credit deduction atomically (with Redis `DECR`)
- [ ] NO — implement distributed lock with Redis Redlock

| Concurrency behavior documented and acceptable | Result |
|------------------------------------------------|--------|
| Decision documented in code comments | ☐ |

#### 7.3 Balance Service — CRITICAL (Financial Integrity)

| Check | Test | Result |
|-------|------|--------|
| `checkBalance(userId)` returns `true` when balance > $0.00 | Balance $5.00 → true | ☐ |
| `checkBalance(userId)` returns `false` when balance = $0.00 | Balance $0.00 → false | ☐ |
| `checkBalance(userId)` returns `false` when balance < $0.00 | Balance -$1.00 → false (should never happen, but gate it) | ☐ |
| `deductCredits` calculates correct charge from `pricing_input` and `pricing_output` | 100 input + 200 output at $3/$12 per 1M → $0.0027 | ☐ |
| **`deductCredits` uses `SELECT ... FOR UPDATE` row lock** | Concurrent deductions from same user → serialized | ☐ |
| **`deductCredits` uses SERIALIZABLE isolation level** | Postgres transaction isolation | ☐ |
| Deduction WITH `balance >= charge` check succeeds | Balance $10, charge $5 → success | ☐ |
| Deduction WITH insufficient balance → returns error (not 402 exception) | Balance $3, charge $5 → error "insufficient balance" | ☐ |
| Idempotency key prevents double-deduction | Send same `idempotency_key` twice → second call is no-op | ☐ |
| `deductStreamingCredits` accumulates token chunks in Redis | 5 chunks → total = sum of all chunks | ☐ |
| Mid-stream balance exhaust → SSE error sent, upstream aborted | Start balance ≤ $0 mid-stream → stream terminates | ☐ |

**FINANCIAL AUDIT TEST:**
```sql
-- After running the test suite, this query must return 0 rows:
SELECT u.id, u.balance, SUM(ul.amount) as ledger_total
FROM users u
LEFT JOIN usage_ledger ul ON ul.user_id = u.id
GROUP BY u.id, u.balance
HAVING u.balance != COALESCE(SUM(ul.amount), 0);
```

| `users.balance` == `SUM(usage_ledger.amount)` for ALL users | Result |
|--------------------------------------------------------------|--------|
| Zero discrepancies | ☐ |

#### 7.4 Circuit Breaker

| Check | Test | Result |
|-------|------|--------|
| State stored in Redis (NOT in-memory) | Check: state survives container restart | ☐ |
| `isOpen(provider, keyId)` returns `false` when failures < 5 | 0-4 failures → false | ☐ |
| `isOpen(provider, keyId)` returns `true` when failures >= 5 in 5min | 5 failures in window → true (open) | ☐ |
| After cooldown (10min) → `half-open` state | Wait 10 min → state = half-open | ☐ |
| `half-open` allows 1 probe request | First request after cooldown → goes through | ☐ |
| `recordSuccess` in half-open → closes circuit | Probe succeeds → state = closed, counter reset | ☐ |
| `recordFailure` in half-open → re-opens circuit | Probe fails → state = open | ☐ |
| Failure counter has 5-minute TTL in Redis | Check `TTL cb:{provider}:{keyId}:failures` | ☐ |

#### 7.5 Ledger Service

| Check | Test | Result |
|-------|------|--------|
| `logRequest` writes to BOTH `request_logs` AND `usage_ledger` | Transaction contains both inserts | ☐ |
| Idempotency key deduplicated (same key → only first write succeeds) | Two `logRequest` calls with same idempotency key → one row | ☐ |
| Message content (prompts/completions) NEVER stored | Check `request_logs` columns — no content column | ☐ |
| Only metadata stored: tokens, cost, latency, model, provider, status | Verify column list | ☐ |
| Both writes in same PostgreSQL transaction | Atomic insert into both tables | ☐ |

#### 7.6 Stream Proxy

| Check | Test | Result |
|-------|------|--------|
| `AbortController` created for every upstream request | Check: `new AbortController()` in stream proxy | ☐ |
| Timeout set per request type (60s non-stream / 300s stream) | Timeout matches constants | ☐ |
| Client disconnect aborts upstream | `request.raw.emit('close')` → `abortController.signal.aborted === true` | ☐ |
| SSE `[DONE]` sent on stream completion | Final event in stream | ☐ |
| Memory usage stable for 10MB+ streams (no accumulation) | Memory profiler test | ☐ |
| Backpressure: upstream paused when client is slow | `reply.raw.write()` returns false → upstream paused | ☐ |

#### 7.7 Billing Service

| Check | Test | Result |
|-------|------|--------|
| `createCheckoutSession` validates amount >= $5 | Amount $4 → rejected | ☐ |
| Metadata includes `user_id` and `idempotency_key` | Check Stripe session metadata | ☐ |
| `success_url` and `cancel_url` set | URLs are valid and point to frontend | ☐ |
| `handleWebhook` verifies Stripe signature (`constructEvent`) | Invalid signature → rejected | ☐ |
| Webhook handler is idempotent (same event twice → one top-up) | Duplicate webhook → balance only increases once | ☐ |
| Only `checkout.session.completed` event processed | Other events → 200, no DB write | ☐ |

#### 7.8 Automated Checks

```bash
pnpm test -- services/
```

#### 7.9 Financial Security Gate — CRITICAL

| Check | Result |
|-------|--------|
| **`deductCredits` uses `FOR UPDATE` row lock** — prevents race conditions | ☐ |
| **`deductCredits` uses `SERIALIZABLE` isolation** | ☐ |
| **No `float`/`double` for money** — all `decimal` | ☐ |
| **Idempotency keys prevent double-billing** — verified with concurrent test | ☐ |
| **Mid-stream balance exhaustion terminates stream** — user never goes negative | ☐ |
| **Ledger entries are append-only** — no UPDATE or DELETE on `usage_ledger` | ☐ |

**Phase 7 Sign-off:** __________ Date: __________

---

### Phase 8: Critical Path Route — Chat Completions

**What It Covers:** `POST /v1/chat/completions` (streaming + non-streaming), health check.

#### 8.1 Request Validation

| Check | Test | Result |
|-------|------|--------|
| Missing `model` → 400 `invalid_request_error` | `{"messages":["hi"]}` → 400 | ☐ |
| Missing `messages` → 400 `invalid_request_error` | `{"model":"gpt-4o"}` → 400 | ☐ |
| Unknown field → rejected (`.strict()` on Zod schema) | `{"model":"gpt-4o","messages":["hi"],"foo":"bar"}` → 400 | ☐ |
| `messages` array with >1000 entries → rejected | 1001 messages → 400 | ☐ |
| Message content >100KB → rejected | 101KB message → 400 | ☐ |
| `temperature` outside 0-2 → rejected | temperature: 3 → 400 | ☐ |
| `max_tokens` negative or >32000 → rejected | max_tokens: -1 → 400 | ☐ |

#### 8.2 Non-Streaming Flow

| Check | Test | Result |
|-------|------|--------|
| Unknown model → 404 `model_not_found` | `{"model":"nonexistent","messages":["hi"]}` → 404 | ☐ |
| Zero balance → 402 `billing_error` | Balance = $0.00, request → 402 | ☐ |
| No available provider keys → 503 `server_error` | All keys exhausted → 503 | ☐ |
| Successful flow: auth → model resolve → key acquire → upstream → bill → response | Full happy path | ☐ |
| Response is valid OpenAI `ChatCompletion` object | Parse response → matches OpenAI schema | ☐ |
| `usage` block present (prompt_tokens, completion_tokens, total_tokens) | Check response body | ☐ |
| Billing deducted exactly `user_charge` | Check `usage_ledger` after request | ☐ |
| `request_logs` row created with all metadata | Verify DB row | ☐ |

#### 8.3 Streaming Flow

| Check | Test | Result |
|-------|------|--------|
| `Content-Type: text/event-stream` header set | Response headers check | ☐ |
| `Cache-Control: no-cache` header set | Response headers check | ☐ |
| Each chunk is `data: {...}\n\n` (SSE format) | Parse chunks | ☐ |
| Each chunk is OpenAI `ChatCompletionChunk` with `delta` | Check `choices[0].delta` existence | ☐ |
| Final chunk is `data: [DONE]\n\n` | Last event | ☐ |
| Streamed chunks are normalized from provider format | Anthropic SSE → OpenAI delta chunks | ☐ |
| Token tracking accumulates across chunks | Final deduction matches total tokens | ☐ |
| Mid-stream balance exhaust → stream terminates with error SSE | User balance hits 0 → `{"error":{"type":"billing_error"}}` in stream | ☐ |
| Client disconnect aborts upstream | Close connection mid-stream → no orphaned upstream | ☐ |

#### 8.4 Error Handling & Retries

| Check | Test | Result |
|-------|------|--------|
| Upstream 429 → retry with next key | Mock upstream 429 → retry occurs | ☐ |
| Upstream 5xx → retry with next key | Mock upstream 500 → retry occurs | ☐ |
| Upstream timeout → retry with next key | Mock upstream hang → retry occurs | ☐ |
| Upstream 400 → NO retry (return immediately) | Mock upstream 400 → no retry | ☐ |
| Upstream 401 → NO retry | Mock upstream 401 → no retry | ☐ |
| Max 3 retries enforced | 4 failures → Max retries exhausted → 502 | ☐ |
| Exponential backoff: 500ms → 1500ms → 4500ms | Measure retry intervals | ☐ |
| All retries exhausted → 502 `server_error` | No keys work after 3 retries → 502 | ☐ |
| Circuit breaker `recordSuccess` called on success | After successful request → breaker reset | ☐ |
| Circuit breaker `recordFailure` called on failure | After upstream error → failure recorded | ☐ |
| Marked key unhealthy after repeated failures | 5 failures → `markKeyUnhealthy` called | ☐ |

#### 8.5 Health Check

| Check | Test | Result |
|-------|------|--------|
| `GET /health` returns 200 with `{ status: 'ok', uptime, timestamp }` | No auth required | ☐ |
| DB down → `/health` returns 503 | Disconnect DB → health check fails | ☐ |

#### 8.6 Automated Checks

```bash
pnpm test -- routes/v1/chat-completions.test.ts
pnpm test -- routes/health.test.ts
```

#### 8.7 End-to-End Test

```bash
# Non-streaming:
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer sk_live_TEST123" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}],"stream":false}'

# Streaming:
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer sk_live_TEST123" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","messages":[{"role":"user","content":"Hello"}],"stream":true}' \
  --no-buffer
```

| Full E2E: mock upstream → gateway → client receives valid OpenAI response | Result |
|------------------------------------------------------------------------------|--------|
| Non-streaming E2E passes | ☐ |
| Streaming E2E passes (all chunks received, [DONE] event) | ☐ |
| Billing ledger entry exists after request | ☐ |
| User balance correctly decremented | ☐ |

**Phase 8 Sign-off:** __________ Date: __________

---

### Phase 9: Supporting API Routes & Webhooks

**What It Covers:** Dashboard API, admin API, Stripe webhook, SSE events.

#### 9.1 Dashboard API (`/api/user/*`)

All routes require `authenticateSession`.

| Route | Method | Check | Result |
|-------|--------|-------|--------|
| `/api/user/me` | GET | Returns user profile (email, balance, status). Never exposes `password_hash`. | ☐ |
| `/api/user/usage` | GET | Aggregated usage by period (query params: `period`, `model`). Returns empty array when no data. | ☐ |
| `/api/user/usage/:id` | GET | Single request metadata (tokens, cost, latency). **Never returns message content.** | ☐ |
| `/api/user/ledger` | GET | Paginated ledger entries. Supports `?limit=100&offset=0`. | ☐ |
| `/api/user/api-keys` | GET | Lists keys with NAME + `key_prefix` (last 4 chars masked). **Never returns raw key or full hash.** | ☐ |
| `/api/user/api-keys` | POST | Generates `sk_live_${nanoid(32)}`, HMAC hashes, stores hash. **Returns raw key ONCE. No "reveal" endpoint exists.** | ☐ |
| `/api/user/api-keys/:id` | DELETE | Revokes key (`status = 'revoked'`). Cannot revoke OTHER user's keys. | ☐ |
| `/api/user/top-up` | POST | Validates amount >= $5. Returns Stripe Checkout URL. `idempotency_key` in metadata. | ☐ |
| `/api/user/invoices` | GET | Returns billing history from Stripe API. | ☐ |

**BUG CHECK:** Can a user access another user's API keys, ledger, or usage?
```bash
curl -H "Authorization: Bearer <userA_token>" http://localhost:3000/api/user/api-keys
# Must ONLY return userA's keys
```

| Authorization scoping correct (user can only access own data) | Result |
|---------------------------------------------------------------|--------|
| All dashboard routes scoped to authenticated user's `userId` | ☐ |

#### 9.2 Stripe Webhook

| Check | Test | Result |
|-------|------|--------|
| Fastify does NOT parse body (raw Buffer preserved) | `request.body` is raw Buffer, not parsed JSON | ☐ |
| `stripe.webhooks.constructEvent()` verifies signature | Valid Stripe test signature → processed | ☐ |
| Invalid signature → 400 (not 500) | Invalid sig → rejected | ☐ |
| `checkout.session.completed` → balance + top-up | Send test event → balance increases | ☐ |
| Duplicate `checkout.session.completed` (same `idempotency_key`) → balance only increases once | Send same event 3× → balance increase = 1× | ☐ |
| Webhook returns 200 within 5 seconds (Stripe SLA) | Measure response time | ☐ |
| Other event types (`invoice.paid`, etc.) → 200 (no error) | Non-checkout events don't crash | ☐ |

#### 9.3 Admin API (`/admin/*`)

All routes require `authenticateAdmin`.

| Route | Method | Check | Result |
|-------|--------|-------|--------|
| Provider Keys CRUD | POST/GET/PATCH/DELETE | All 5 operations work. Raw key displayed only at creation (encrypted at rest immediately). | ☐ |
| Model Mappings CRUD | POST/GET/PATCH/DELETE | All 4 operations work. Pricing updates take effect on next request (Redis cache TTL). | ☐ |
| Users Manage | GET/PATCH suspend/PATCH unsuspend/GET usage | Suspend → user gets 403 on inference. Unsuspend → access restored. | ☐ |
| Margins | GET | Period filter works. Returns aggregated `total_upstream_cost`, `total_user_charges`, `total_margin`. | ☐ |
| Ledgers | GET | Filter by `?user_id=xxx&limit=100`. Read-only (no POST/PATCH/DELETE). | ☐ |
| Balance Reconciliations | GET | Returns discrepancies found by `balance-reconciler` worker. | ☐ |
| Health | GET `/providers`, `/keys`, `/queues` | Provider latency from Redis, key pool stats, BullMQ queue depths. | ☐ |
| Emergency Drain | POST | Sets all provider keys → `ROTATING`. `acquireKey` no longer selects them. | ☐ |
| Emergency Rotate All | POST | Archives ALL keys for provider + logs archive event. | ☐ |

#### 9.4 User Events SSE

| Check | Test | Result |
|-------|------|--------|
| Session required (no anonymous access) | No auth → 401 | ☐ |
| `Content-Type: text/event-stream` header | Response headers | ☐ |
| Heartbeat sent every 30s | `data: {"type":"heartbeat"}` ~30s intervals | ☐ |
| Pub/sub channel: `user_events:{userId}` | Check Redis `PUBSUB CHANNELS` | ☐ |
| Client disconnect unsubscribes | Close connection → channel subscriber count drops | ☐ |
| Publish event → client receives it | `redis.publish("user_events:{id}", msg)` → client sees it | ☐ |

#### 9.5 Automated Checks

```bash
pnpm test -- routes/api/user/
pnpm test -- routes/webhooks/
pnpm test -- routes/admin/
```

#### 9.6 Security Gate

| Check | Result |
|-------|--------|
| Dashboard routes do NOT expose message content ever | ☐ |
| API key creation returns raw key ONCE — no retrieval endpoint | ☐ |
| Admin routes reject non-admin access | ☐ |
| Stripe webhook signature verified before any DB operation | ☐ |
| `X-Admin-Key` check uses `timingSafeEqual` | ☐ |
| Emergency drain immediate (no cache delay) | ☐ |

**Phase 9 Sign-off:** __________ Date: __________

---

### Phase 10: App Bootstrap, Workers & Production Readiness

**What It Covers:** App factory, graceful shutdown, BullMQ workers, Dockerfile, production config.

#### 10.1 App Factory (`app.ts`)

| Check | Test | Result |
|-------|------|--------|
| Plugins registered: `@fastify/cors`, `@fastify/helmet` | Check `app.ts` plugin list | ☐ |
| CORS: `origin = process.env.NEXTAUTH_URL` (not `*`) | Check CORS config | ☐ |
| CORS: `credentials: true` | Check CORS config | ☐ |
| Helmet configured with security headers | Check `@fastify/helmet` options | ☐ |
| `trustProxy: true` | Behind Cloudflare + Azure ingress | ☐ |
| `bodyLimit: 2MB` | Prevent large payload abuse | ☐ |
| Global error handler registered (`setErrorHandler`) | Uncaught errors → OpenAI-compatible format | ☐ |
| All route modules registered (`/health`, `/v1/*`, `/api/user/*`, `/webhooks/*`, `/admin/*`) | Check `app.ts` route list | ☐ |
| Metrics endpoint `/metrics` available (internal network only or gated) | Prometheus metrics exposed | ☐ |

#### 10.2 Graceful Shutdown (`index.ts`) — CRITICAL

| Check | Test | Result |
|-------|------|--------|
| `SIGTERM` handler registered | `process.on('SIGTERM', ...)` | ☐ |
| `SIGINT` handler registered | `process.on('SIGINT', ...)` | ☐ |
| Sequence: 1. Stop HTTP 2. Wait in-flight 3. Close workers 4. Close Redis 5. Close DB 6. Exit | Simulate shutdown → verify order | ☐ |
| Fastify `server.close()` stops accepting new requests but waits for in-flight | Check: `close()` behavior | ☐ |
| BullMQ workers call `worker.close()` (drain current job, don't start new) | Check: `worker.close()` call | ☐ |
| Redis `redis.quit()` and `subscriberRedis.quit()` | Both connections closed | ☐ |
| DB `pool.end()` | Pool drained and closed | ☐ |
| Shutdown completes within Azure's 30s `SIGTERM` window | Measure shutdown time | ☐ |
| Process exits with code 0 | Normal exit | ☐ |

**BUG CHECK:** What happens if a request is in-flight during shutdown?
- [ ] Gateway finishes the request before shutting down → ✅ Correct
- [ ] Gateway drops the request immediately → ❌ Bug (billing state lost!)

| In-flight requests complete before shutdown | Result |
|---------------------------------------------|--------|
| Long request > 25s → gateway still finishes it before shutdown | ☐ |

#### 10.3 Workers

| Worker | Schedule | Check | Result |
|--------|----------|-------|--------|
| **Health Checker** | Every 60s | Pings each active provider. Updates Redis `health:{provider}`. >5 failures in 5m → circuit breaker trip. | ☐ |
| **Balance Reconciler** | Every 5 min | `users.balance` vs `SUM(usage_ledger.amount)` compared. Discrepancy > $0.01 → adjustment entry + CRITICAL log. | ☐ |
| **Key Cleaner** | Every 10 min | Marks `remaining_credits <= 0 AND status != 'EXHAUSTED'` as EXHAUSTED. | ☐ |
| **Analytics Aggregator** | Every 15 min | Rolls up per-user/per-model stats. | ☐ |
| **Margin Reporter** | Daily 00:00 UTC | Generates daily/weekly/monthly margin reports. | ☐ |
| **Data Retention** | Daily 02:00 UTC | Purges `request_logs` > 90 days. Purges content logs > 30 days. Archives ledgers > 7 years. | ☐ |

**Worker Test:** Manually trigger each worker job and verify its output:
```bash
# Trigger a specific job (BullMQ add method or test utility):
await healthCheckQueue.add('health-check', {}, { repeat: undefined });
```

| Each worker successfully processes a test job | Result |
|-----------------------------------------------|--------|
| All 6 workers tested | ☐ |

#### 10.4 Dockerfile

| Check | Test | Result |
|-------|------|--------|
| Multi-stage build (builder + runner) | Two `FROM` statements | ☐ |
| Builder stage uses `node:20-alpine` | Check base image | ☐ |
| Runner stage uses `node:20-alpine` | Check base image | ☐ |
| Runner stage only contains `dist/`, `node_modules/`, `package.json` | No source code in runner | ☐ |
| `NODE_ENV=production` set in runner | Check Dockerfile | ☐ |
| `EXPOSE 3000` | Correct port | ☐ |
| Image size < 150MB | `docker images | grep fluxai-api` | ☐ |
| `docker build` succeeds without errors | Check build output | ☐ |
| `docker run` starts and `/health` returns 200 | Container functional test | ☐ |

#### 10.5 Production Readiness Checklist (from Section 23.11)

| Category | Check | Result |
|----------|-------|--------|
| **Infra** | PostgreSQL `max_connections` > (pool.max × replicas + 20) | ☐ |
| **Infra** | Redis TLS enabled, `enableOfflineQueue: false` | ☐ |
| **Infra** | Azure Key Vault access configured with Managed Identity | ☐ |
| **Infra** | Container Apps health probes configured | ☐ |
| **Infra** | Auto-scaling rules set (HTTP + CPU) | ☐ |
| **Infra** | Minimum 2 replicas for HA | ☐ |
| **Security** | All secrets rotated from dev values | ☐ |
| **Security** | `ADMIN_API_KEY` is cryptographically random (≥32 bytes) | ☐ |
| **Security** | Stripe webhook signature verified | ☐ |
| **Security** | CORS restricted to `NEXTAUTH_URL` (not `*`) | ☐ |
| **Security** | Rate limits tested at 2× peak | ☐ |
| **Observe** | Pino redaction rules configured | ☐ |
| **Observe** | Prometheus `/metrics` exposed | ☐ |
| **Observe** | Alert rules configured for P0/P1/P2 | ☐ |
| **Observe** | Log aggregation pipeline tested | ☐ |
| **Resilience** | DB circuit breaker tested | ☐ |
| **Resilience** | Redis circuit breaker tested | ☐ |
| **Resilience** | All 6 providers tested for upstream failures | ☐ |
| **Resilience** | Graceful shutdown tested | ☐ |
| **Resilience** | Load test: 500 concurrent, 0% error, p99 < 5s | ☐ |
| **Financial** | Balance reconciliation tested | ☐ |
| **Financial** | Idempotency dedup tested (10× replay) | ☐ |
| **Financial** | Mid-stream balance exhaust tested | ☐ |
| **Financial** | Key rotation audit trail verified | ☐ |

#### 10.6 Automated Checks

```bash
pnpm test -- workers/
docker build -t fluxai-api:test ./apps/api
docker run --rm -e NODE_ENV=production fluxai-api:test node -e "console.log('startup ok')"
```

#### 10.7 Security Gate

| Check | Result |
|-------|--------|
| `SIGTERM` graceful shutdown tested | ☐ |
| `SIGKILL` after 30s forced shutdown acceptable | ☐ |
| In-flight SSE streams closed with `[DONE]` on shutdown | ☐ |
| Docker image has no dev dependencies | ☐ |
| Secrets injected via env/Key Vault, not baked into image | ☐ |

**Phase 10 Sign-off:** __________ Date: __________

---

## Cross-Cutting Verification

These checks span multiple phases and verify end-to-end correctness.

### Project Structure Compliance

```bash
# Verify all files from Section 2 exist:
for f in $(grep -E "\.ts$|\.json$|\.yml$" backend.md -o | sort -u); do
  test -f "$f" && echo "✅ $f" || echo "❌ MISSING: $f"
done
```

| All files from Project Structure (Section 2) exist | Result |
|-----------------------------------------------------|--------|
| No missing files | ☐ |

### Route Completeness

| Surface | Expected Count | Actual Count Match? |
|---------|---------------|---------------------|
| Public Inference API | 1 | ☐ |
| User Dashboard API | 10 | ☐ |
| Admin API | 21 | ☐ |
| Webhooks | 1 | ☐ |
| Health | 1 | ☐ |
| **Backend Total** | **34** | ☐ |

```bash
# Count registered routes:
pnpm dev &
sleep 3
curl -s http://localhost:3000/health | jq .
# Or extract from Fastify's route list:
node -e "require('./apps/api/src/app').buildApp().then(a => console.log(a.printRoutes()))"
```

### Dependency Audit

```bash
# Check for known vulnerabilities:
pnpm audit

# Check for unused dependencies:
pnpm dlx depcheck

# Verify all dependencies from Section 17 are installed:
node -e "
const deps = require('./apps/api/package.json').dependencies;
const spec = ['fastify','@fastify/cors','@fastify/helmet','drizzle-orm','pg',
  'ioredis','bullmq','zod','pino','stripe','nanoid','bcryptjs','next-auth',
  '@auth/drizzle-adapter','@azure/identity','@azure/keyvault-secrets'];
const missing = spec.filter(d => !deps[d]);
if (missing.length) console.log('MISSING:', missing); else console.log('✅ All deps present');
"
```

| No high/critical `pnpm audit` vulnerabilities | Result |
|------------------------------------------------|--------|
| Clean audit | ☐ |

### TypeScript Strictness

```json
// tsconfig.json must have:
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": false  // optional for Zod compatibility
  }
}
```

| TypeScript strict mode enabled | Result |
|-------------------------------|--------|
| `tsconfig.json` has `strict: true` | ☐ |
| `pnpm tsc --noEmit` returns zero errors | ☐ |

### Code Quality

```bash
pnpm lint                    # ESLint: zero errors
pnpm format --check          # Prettier (if configured): no changes needed
```

| Tool | Result |
|------|--------|
| ESLint passes (zero errors, zero warnings) | ☐ |
| No `console.log` (only `logger.info/warn/error`) in source | ☐ |
| No `any` type usage in critical paths (services, middleware) | ☐ |
| No commented-out code | ☐ |
| No TODO/FIXME without ticket reference | ☐ |

### Financial Integrity — CRITICAL

```sql
-- These queries MUST return zero rows for the system to be financially sound.

-- 1. User balances must match ledger sum
SELECT u.id, u.email, u.balance, SUM(ul.amount) as ledger_total
FROM users u
LEFT JOIN usage_ledger ul ON ul.user_id = u.id
GROUP BY u.id
HAVING ABS(u.balance - COALESCE(SUM(ul.amount), 0)) > 0.0001;

-- 2. No duplicate idempotency keys in request_logs
SELECT idempotency_key, COUNT(*)
FROM request_logs
GROUP BY idempotency_key
HAVING COUNT(*) > 1;

-- 3. No duplicate idempotency keys in usage_ledger
SELECT idempotency_key, COUNT(*)
FROM usage_ledger
GROUP BY idempotency_key
HAVING COUNT(*) > 1;

-- 4. No user with negative balance (should never happen)
SELECT id, email, balance FROM users WHERE balance < 0;
```

| Financial integrity queries all return zero rows | Result |
|---------------------------------------------------|--------|
| Balances match ledger | ☐ |
| No duplicate idempotency keys in logs | ☐ |
| No duplicate idempotency keys in ledger | ☐ |
| No negative balances | ☐ |

### Security Scan

```bash
# Check for hardcoded secrets:
grep -rn "sk_live_\|sk-test-\|ghp_\|AIza\|Bearer [a-zA-Z0-9_-]\{20,\}" apps/api/src/

# Check for unsafe eval:
grep -rn "eval(\|new Function(" apps/api/src/

# Check for SQL injection patterns (should use Drizzle parameterized queries):
grep -rn "sql\s*=\s*['\"]" apps/api/src/

# Check for missing authorization on routes:
grep -rn "preHandler\|onRequest" apps/api/src/routes/
```

| No hardcoded secrets found | Result |
|----------------------------|--------|
| No `sk_live_` or other API keys in source | ☐ |
| No `eval()` or `new Function()` | ☐ |
| No raw SQL string concatenation with user input | ☐ |
| All routes have appropriate auth middleware | ☐ |

### Load & Performance Test

```bash
# Using autocannon (install: npm i -g autocannon):

# Non-streaming load test:
autocannon -c 100 -d 30 -H "Authorization: Bearer sk_live_TEST123" \
  -H "Content-Type: application/json" \
  -b '{"model":"gpt-4o","messages":[{"role":"user","content":"test"}]}' \
  http://localhost:3000/v1/chat/completions

# Streaming load test:
autocannon -c 50 -d 30 -H "Authorization: Bearer sk_live_TEST123" \
  -H "Content-Type: application/json" \
  -b '{"model":"gpt-4o","messages":[{"role":"user","content":"test"}],"stream":true}' \
  http://localhost:3000/v1/chat/completions
```

| Metric | Target | Actual | Result |
|--------|--------|--------|--------|
| RPS (non-streaming) | >100 | _____ | ☐ |
| p99 latency (non-streaming) | <5s | _____ | ☐ |
| p99 latency (streaming, first byte) | <3s | _____ | ☐ |
| Error rate | 0% | _____ | ☐ |
| Memory usage (steady state) | <300MB | _____ | ☐ |
| Memory leak (5min sustained) | <10MB growth | _____ | ☐ |

### Resilience Test Matrix

| Failure Scenario | Expected | Actual | Result |
|-----------------|----------|--------|--------|
| PostgreSQL down | 503 on DB ops, health check fails | | ☐ |
| Redis down | Rate limits bypassed, auth falls back to DB, health check degraded | | ☐ |
| One provider down | Request fails over to next key for same provider or returns 503 if all down | | ☐ |
| All providers down | 503 with clear error | | ☐ |
| Mid-request Redis crash | In-flight streaming request terminates | | ☐ |
| Mid-request PostgreSQL crash | In-flight request fails, billing not committed (rollback) | | ☐ |
| Container restart (SIGTERM) | Zero dropped requests (graceful shutdown) | | ☐ |
| Memory pressure | Process doesn't OOM under sustained load | | ☐ |

---

## Final Gate: Production Readiness

Before accepting real user traffic, ALL of the following must be ✅:

### Infrastructure
- [ ] Azure Container Apps deployed with ≥2 replicas
- [ ] PostgreSQL Flexible Server configured with backups enabled
- [ ] Azure Cache for Redis provisioned with TLS
- [ ] Azure Key Vault configured with all required secrets
- [ ] Cloudflare WAF rules applied
- [ ] Custom domain + SSL configured
- [ ] Health probe URL returns 200 from Azure

### Data
- [ ] Production PostgreSQL has all 9 tables + indexes
- [ ] At least 1 active provider key per provider in `provider_keys`
- [ ] At least 1 model mapping per provider in `model_mappings`
- [ ] At least 1 admin user exists (manually promoted via SQL)
- [ ] Test user created with balance for smoke testing

### Observability
- [ ] Pino structured logs flowing to Azure Monitor / Datadog
- [ ] Prometheus metrics scrapeable from Azure Monitor
- [ ] Alert rules active in Grafana / BetterStack
- [ ] Sentry configured for error tracking
- [ ] Health check alert configured (ping every 60s)

### Security
- [ ] ALL secrets rotated from development values
- [ ] `ADMIN_API_KEY` set to production value
- [ ] CORS restricted to actual `NEXTAUTH_URL`
- [ ] Stripe webhook signing secret set to production value
- [ ] Stripe production keys (not test mode)
- [ ] TLS 1.3 enforced

### Functional
- [ ] Smoke test: `curl /health` → 200
- [ ] Smoke test: `curl /v1/chat/completions` with test key → valid OpenAI response
- [ ] Stripe test top-up → balance increases
- [ ] Admin dashboard accessible
- [ ] Rate limits functional

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-01-15 | 1.0 | Initial | Complete verification guide covering all 10 phases |
