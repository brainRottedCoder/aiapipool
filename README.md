# FluxAI Gateway

AI gateway proxy with unified OpenAI-compatible API across multiple providers.

## Quick Start (Local Dev)

```bash
pnpm install
cp .env.example .env               # root (web)
cp apps/api/.env.example apps/api/.env  # API
# Edit both .env files with your values
docker compose up -d postgres redis # Start infra
pnpm db:migrate                     # Run migrations
pnpm dev                            # API :3000, Web :3001
```

## Production Deployment

### 1. Prepare environment

```bash
cp .env.production.example .env
# Fill in all required values — generate secrets with:
openssl rand -base64 48
```

Required secrets to set:
- `MASTER_ENCRYPTION_KEY` — encrypts provider API keys at rest
- `API_KEY_PEPPER` — HMAC pepper for user API key hashing
- `ADMIN_API_KEY` — admin dashboard access key
- `NEXTAUTH_SECRET` — signs NextAuth sessions (same value in both .env files)
- `POSTGRES_PASSWORD` — database password

### 2. Deploy with Docker Compose

```bash
docker compose -f docker-compose.prod.yml up -d
```

This starts:
- PostgreSQL (persistent volume)
- Redis (persistent volume)
- API (auto-migrates + seeds on first start)
- Web (Next.js dashboard)

### 3. Add provider keys

After deploy, add your provider API keys via the admin route:

```bash
curl -X POST http://localhost:3000/admin/provider-keys \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","apiKey":"sk-..."}'
```

### 4. SSL / TLS

**Do NOT expose ports directly in production.** Use one of these approaches:

| Method | How |
|---|---|
| **Reverse proxy** | Caddy (auto HTTPS), Nginx + Certbot, Traefik |
| **Cloud platform** | Railway, Render, Fly.io provide TLS automatically |
| **Vercel** | Use for the web app only — free HTTPS on custom domains |

**Caddy example** (simplest — automatic Let's Encrypt):

```Caddyfile
api.yourdomain.com {
    reverse_proxy localhost:3000
}

yourdomain.com {
    reverse_proxy localhost:3001
}
```

```bash
# Add Caddy to docker-compose.prod.yml or install on host
caddy reload --config Caddyfile
```

### 5. CI/CD (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` handles:
- PRs: lint + typecheck + test
- Push to main: build Docker images → push to GHCR → SSH deploy

Required GitHub secrets:
- `DEPLOY_HOST` — server IP/hostname
- `DEPLOY_USER` — SSH user
- `DEPLOY_SSH_KEY` — private SSH key
- `DEPLOY_PATH` — project path on server

## Architecture

```
Internet → Caddy/Proxy (TLS) → Web (Next.js :3001)
                               → API (Fastify :3000) → PostgreSQL
                                                      → Redis
                                                      → Upstream AI providers
```

## Adding Provider Keys After Deploy

Repeat for each provider you need:

```bash
# OpenAI
curl -X POST http://localhost:3000/admin/provider-keys \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","apiKey":"sk-..."}'

# Anthropic
curl -X POST http://localhost:3000/admin/provider-keys \
  -H "X-Admin-Key: YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","apiKey":"sk-ant-..."}'
```
