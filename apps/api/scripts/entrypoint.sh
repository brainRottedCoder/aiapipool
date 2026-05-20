#!/bin/sh
set -e

echo "⏳ Running database migrations..."
cd /app
node node_modules/drizzle-kit/bin.cjs migrate --config apps/api/drizzle.config.ts

echo "⏳ Running database seed (if needed)..."
node --import tsx apps/api/src/db/seed.ts || echo "⚠️  Seed skipped or partially completed."

echo "🚀 Starting API server..."
exec node apps/api/dist/index.js
