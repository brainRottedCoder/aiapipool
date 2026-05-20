import "./load-env.js";
import { z } from "zod";
import pino from "pino";
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const logger = pino({ name: "env" });

async function loadEnv() {
  const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().default(3000),
    HOST: z.string().default("0.0.0.0"),

    // Database
    DATABASE_URL: z.string().url(),

    // Redis
    REDIS_URL: z.string().url(),

    // Security
    MASTER_ENCRYPTION_KEY: z.string().min(32),
    API_KEY_PEPPER: z.string().min(32),
    ADMIN_API_KEY: z.string().min(32),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // Auth (NextAuth) — NEXTAUTH_URL is the public web app origin (CORS, Stripe redirects)
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    WEB_APP_URL: z.string().url().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // Azure
    AZURE_KEY_VAULT_URL: z.string().url().optional(),

    // Provider-specific (optional)
    PROVIDER_OPENROUTER_REFERER: z.string().optional(),
    PROVIDER_OPENROUTER_TITLE: z.string().optional(),

    // Rate limits (configurable)
    DEFAULT_RPM: z.coerce.number().default(60),
    DEFAULT_TOKENS_PER_DAY: z.coerce.number().default(100_000),
    MAX_CONCURRENT_REQUESTS: z.coerce.number().default(10),

    // Email (Resend) — optional in development
    RESEND_API_KEY: z.string().min(1).optional(),
    FROM_EMAIL: z.string().min(1).default("FluxAI <noreply@fluxai.dev>"),
  }).strict();

  const keys = Object.keys(envSchema.shape) as (keyof z.infer<typeof envSchema>)[];
  const raw: Record<string, string | undefined> = {};
  for (const key of keys) {
    const value = process.env[key];
    raw[key] = value === "" ? undefined : value;
  }

  if (raw.AZURE_KEY_VAULT_URL) {
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(raw.AZURE_KEY_VAULT_URL, credential);
      const secret = await client.getSecret("MASTER_ENCRYPTION_KEY");
      if (secret.value) {
        raw.MASTER_ENCRYPTION_KEY = secret.value;
        logger.info(
          { keyVaultUrl: raw.AZURE_KEY_VAULT_URL },
          "Loaded MASTER_ENCRYPTION_KEY from Azure Key Vault"
        );
      }
    } catch (err) {
      logger.fatal(
        { err },
        "Failed to fetch MASTER_ENCRYPTION_KEY from Azure Key Vault"
      );
      process.exit(1);
    }
  }

  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    logger.fatal({ issues: parsed.error.issues }, "Environment validation failed");
    process.exit(1);
  }

  return parsed.data;
}

export const env = await loadEnv();
