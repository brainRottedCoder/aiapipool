# FluxAI Gateway — Agent Instructions

## Monorepo Structure

- **Runtime:** pnpm workspaces + Turborepo
- **Packages:** `@fluxai/api`, `@fluxai/web`, `@fluxai/shared`
- **Entrypoint commands (root):** `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm test`

## Running the Stack

| App | Command | Port | Notes |
|---|---|---|---|
| Both (root) | `pnpm dev` | 3000 (API), 3001 (web) | Uses turbo |
| Database | `docker compose up -d postgres` then `pnpm db:migrate` | 5432 | **Required** for OAuth/login (Auth.js Drizzle adapter) |
| API only | `cd apps/api && pnpm dev` | 3000 | `tsx watch src/index.ts` |
| Web only | `cd apps/web && pnpm dev` | 3001 | `next dev --port 3001` |

## Environment Variables

There are **two separate `.env` files**:

- `apps/api/.env` — controls the API server (PORT=3000, `NEXTAUTH_URL`/`WEB_APP_URL` = web origin `http://localhost:3001` for CORS)
- Root `.env` — controls the Next.js web app (PORT=3001, NEXTAUTH_URL=http://localhost:3001)

The web app needs `NEXT_PUBLIC_API_URL=http://localhost:3000` in its env so the API client can reach the backend. Set this in the root `.env` or `apps/web/.env.local`.

Both env files are loaded by different processes — changes to one don't affect the other.

## Backend (Fastify)

- Entry point: `apps/api/src/index.ts`
- App factory: `apps/api/src/app.ts`
- Build: `pnpm exec tsc -b` (TypeScript Build mode, not `tsc` alone)
- DB: Drizzle ORM. Run `pnpm db:generate` then `pnpm db:migrate` after schema changes
- Test: `vitest` (in `apps/api`)
- ESM-only (`"type": "module"`). All backend imports require `.js` extension in source files.

## Frontend (Next.js)

- API client: `apps/web/lib/api-client.ts` (uses React Query via custom hooks)
- Endpoint URLs: `apps/web/lib/api-endpoints.ts` — reads `NEXT_PUBLIC_API_URL`
- Auth guards: `apps/web/middleware.ts` (Next.js Edge, NextAuth-based)
- Hooks: `apps/web/hooks/use-*.ts` — thin wrappers around `apiClient` + TanStack Query

## Cross-Domain Auth

When web (port 3001) calls API (port 3000), the web API client passes the NextAuth session token as `Authorization: Bearer <token>` header (not as a cookie). The API's `authenticateSession` middleware handles both cookie and Bearer header sources.

CORS is configured to allow `NEXTAUTH_URL` origin with credentials.

## Error Format

All API errors follow OpenAI-compatible format:
```json
{ "error": { "message": "...", "type": "...", "code": "...", "param": null } }
```

## Important Files

- `apps/api/src/db/schema.ts` — Drizzle table definitions (NextAuth tables included)
- `apps/api/src/routes/v1/chat-completions.ts` — main inference endpoint (`POST /v1/chat/completions`)
- `apps/api/src/middleware/auth.ts` — API key auth (Bearer token, HMAC lookup)
- `apps/api/src/middleware/session-auth.ts` — dashboard auth (NextAuth session)
- `apps/api/src/middleware/rate-limiter.ts` — Redis sliding-window rate limiter
- `apps/api/src/config/constants.ts` — app-wide constants (timeouts, retries, limits)
- `packages/shared/src/schemas.ts` — shared Zod schemas consumed by both apps
- `packages/shared/src/types.ts` — shared TypeScript types