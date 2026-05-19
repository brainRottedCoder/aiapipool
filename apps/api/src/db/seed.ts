import { db } from "../db/client.js";
import { admins, modelMappings, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@fluxai.dev";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "FluxAI Admin";

async function seed() {
  console.log("🌱 Running database seed...");

  const existingAdmin = await db
    .select({ id: admins.id })
    .from(admins)
    .where(eq(admins.email, ADMIN_EMAIL))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log(`⏭️  Admin already exists (${ADMIN_EMAIL}), skipping.`);
  } else {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await db.insert(admins).values({
      email: ADMIN_EMAIL,
      password_hash: passwordHash,
      name: ADMIN_NAME,
      status: "active",
    });
    console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
  }

  // Demote any legacy users.role = admin (portal uses admins table only)
  await db.update(users).set({ role: "user" }).where(eq(users.role, "admin"));

  const defaultModels = [
    {
      model_alias: "gpt-4o",
      provider: "openai",
      provider_model_id: "gpt-4o",
      pricing_input: "2.500000",
      pricing_output: "10.000000",
      status: "ACTIVE",
    },
    {
      model_alias: "gpt-4o-mini",
      provider: "openai",
      provider_model_id: "gpt-4o-mini",
      pricing_input: "0.150000",
      pricing_output: "0.600000",
      status: "ACTIVE",
    },
    {
      model_alias: "claude-sonnet-4-20250514",
      provider: "anthropic",
      provider_model_id: "claude-sonnet-4-20250514",
      pricing_input: "3.000000",
      pricing_output: "15.000000",
      status: "ACTIVE",
    },
    {
      model_alias: "claude-3-5-haiku-20241022",
      provider: "anthropic",
      provider_model_id: "claude-3-5-haiku-20241022",
      pricing_input: "0.800000",
      pricing_output: "4.000000",
      status: "ACTIVE",
    },
    {
      model_alias: "gemini-2.5-pro",
      provider: "gemini",
      provider_model_id: "gemini-2.5-pro",
      pricing_input: "1.250000",
      pricing_output: "10.000000",
      status: "ACTIVE",
    },
    {
      model_alias: "gemini-2.5-flash",
      provider: "gemini",
      provider_model_id: "gemini-2.5-flash",
      pricing_input: "0.150000",
      pricing_output: "0.600000",
      status: "ACTIVE",
    },
    {
      model_alias: "llama-3.3-70b-instruct",
      provider: "together",
      provider_model_id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      pricing_input: "0.880000",
      pricing_output: "0.880000",
      status: "ACTIVE",
    },
    {
      model_alias: "deepseek-r1",
      provider: "openrouter",
      provider_model_id: "deepseek/deepseek-r1",
      pricing_input: "0.140000",
      pricing_output: "0.140000",
      status: "ACTIVE",
    },
  ];

  for (const model of defaultModels) {
    const exists = await db
      .select({ id: modelMappings.id })
      .from(modelMappings)
      .where(eq(modelMappings.model_alias, model.model_alias))
      .limit(1);

    if (exists.length > 0) {
      console.log(`⏭️  Model mapping already exists (${model.model_alias}), skipping.`);
    } else {
      await db.insert(modelMappings).values(model);
      console.log(
        `✅ Model mapping created: ${model.model_alias} → ${model.provider}/${model.provider_model_id}`
      );
    }
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
