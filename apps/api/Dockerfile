# Multi-stage build for production
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm (match lockfile version)
RUN npm install -g pnpm@10.12.4

# Copy workspace config and lockfile
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Install dependencies (hoisted mode = flat node_modules at root)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/

# Build API (tsc -b with project references auto-builds @fluxai/shared first)
RUN node node_modules/typescript/bin/tsc -b apps/api/tsconfig.json

# ── Runner stage ──
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache wget

# Copy workspace metadata
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/turbo.json ./

# Copy compiled API
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/migrations ./apps/api/migrations

# Copy compiled shared package directly into node_modules (avoids symlink issues)
COPY --from=builder /app/packages/shared/package.json ./node_modules/@fluxai/shared/
COPY --from=builder /app/packages/shared/dist ./node_modules/@fluxai/shared/dist

# Copy all production dependencies
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]
