import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://fluxai:local_dev_password@localhost:5432/fluxai',
  },
  verbose: true,
  strict: true,
});
