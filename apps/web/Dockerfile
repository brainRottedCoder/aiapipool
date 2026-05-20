FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@10.12.4

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm exec tsc -b packages/shared/tsconfig.json
RUN cd apps/web && pnpm next build

FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

EXPOSE 3001

CMD ["node", "apps/web/server.js"]
