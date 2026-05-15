import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  decimal,
  boolean,
  integer,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core/columns/custom";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});
import { CONSTANTS } from "../config/constants.js";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const apiKeyStatusEnum = pgEnum("api_key_status", ["active", "revoked"]);
export const providerKeyStatusEnum = pgEnum("provider_key_status", [
  "ACTIVE",
  "EXHAUSTED",
  "ERROR",
  "ROTATING",
]);
export const modelMappingStatusEnum = pgEnum("model_mapping_status", [
  "ACTIVE",
  "INACTIVE",
]);
export const requestLogStatusEnum = pgEnum("request_log_status", [
  "success",
  "error",
  "timeout",
]);
export const ledgerTypeEnum = pgEnum("ledger_type", [
  "api_usage",
  "topup",
  "refund",
  "adjustment",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password_hash: text("password_hash"),
    emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
    name: text("name"),
    image: text("image"),
    balance: decimal("balance", { precision: 12, scale: 4 }).notNull().default("0.0000"),
    status: userStatusEnum("status").notNull().default("active"),
    role: userRoleEnum("role").notNull().default("user"),
    stripe_customer_id: varchar("stripe_customer_id", { length: 255 }),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    index("users_status_idx").on(table.status),
    index("users_role_idx").on(table.role),
  ]
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hashed_key: text("hashed_key").notNull(),
    key_prefix: varchar("key_prefix", { length: 12 }).notNull(),
    name: text("name"),
    rate_limit_rpm: integer("rate_limit_rpm").notNull().default(60),
    rate_limit_tokens_day: integer("rate_limit_tokens_day").notNull().default(100000),
    status: apiKeyStatusEnum("status").notNull().default("active"),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("api_keys_user_id_idx").on(table.userId),
    index("api_keys_status_idx").on(table.status),
    uniqueIndex("api_keys_hashed_key_idx").on(table.hashed_key),
  ]
);

export const providerKeys = pgTable(
  "provider_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: varchar("provider", { length: 100 }).notNull(),
    api_key_encrypted: bytea("api_key_encrypted").notNull(),
    initial_credits: decimal("initial_credits", { precision: 12, scale: 4 }).notNull().default("0.0000"),
    remaining_credits: decimal("remaining_credits", { precision: 12, scale: 4 })
      .notNull()
      .default(CONSTANTS.KEY_CREDIT_CAP.toFixed(4)),
    status: providerKeyStatusEnum("status").notNull().default("ACTIVE"),
    is_emergency_reserve: boolean("is_emergency_reserve").notNull().default(false),
    last_used: timestamp("last_used", { mode: "date", withTimezone: true }),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    archived_at: timestamp("archived_at", { mode: "date", withTimezone: true }),
  },
  (table) => [
    index("provider_keys_provider_idx").on(table.provider),
    index("provider_keys_status_idx").on(table.status),
    index("provider_keys_emergency_idx").on(table.is_emergency_reserve),
  ]
);

export const modelMappings = pgTable(
  "model_mappings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    model_alias: varchar("model_alias", { length: 255 }).notNull().unique(),
    provider: varchar("provider", { length: 100 }).notNull(),
    provider_model_id: varchar("provider_model_id", { length: 255 }).notNull(),
    pricing_input: decimal("pricing_input", { precision: 12, scale: 6 }).notNull().default("0.000000"),
    pricing_output: decimal("pricing_output", { precision: 12, scale: 6 }).notNull().default("0.000000"),
    capabilities: jsonb("capabilities").$type<Record<string, unknown>>().default({}),
    status: modelMappingStatusEnum("status").notNull().default("ACTIVE"),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("model_mappings_alias_idx").on(table.model_alias),
    index("model_mappings_provider_idx").on(table.provider),
    index("model_mappings_status_idx").on(table.status),
  ]
);

export const requestLogs = pgTable(
  "request_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    api_key_id: uuid("api_key_id").references(() => apiKeys.id, { onDelete: "set null" }),
    provider_key_id: uuid("provider_key_id").references(() => providerKeys.id, { onDelete: "set null" }),
    provider: varchar("provider", { length: 100 }).notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    tokens_input: integer("tokens_input").notNull().default(0),
    tokens_output: integer("tokens_output").notNull().default(0),
    upstream_cost: decimal("upstream_cost", { precision: 12, scale: 6 }).notNull().default("0.000000"),
    user_charge: decimal("user_charge", { precision: 12, scale: 6 }).notNull().default("0.000000"),
    margin: decimal("margin", { precision: 12, scale: 6 }).notNull().default("0.000000"),
    latency_ms: integer("latency_ms").notNull().default(0),
    status: requestLogStatusEnum("status").notNull().default("success"),
    idempotency_key: varchar("idempotency_key", { length: 255 }).notNull().unique(),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("request_logs_user_created_idx").on(table.user_id, table.created_at.desc()),
    uniqueIndex("request_logs_idempotency_idx").on(table.idempotency_key),
    index("request_logs_provider_idx").on(table.provider),
    index("request_logs_model_idx").on(table.model),
  ]
);

export const usageLedger = pgTable(
  "usage_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    request_log_id: uuid("request_log_id").references(() => requestLogs.id, { onDelete: "set null" }),
    amount: decimal("amount", { precision: 12, scale: 4 }).notNull().default("0.0000"),
    balance_after: decimal("balance_after", { precision: 12, scale: 4 }).notNull().default("0.0000"),
    type: ledgerTypeEnum("type").notNull(),
    idempotency_key: varchar("idempotency_key", { length: 255 }).notNull().unique(),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("usage_ledger_user_created_idx").on(table.user_id, table.created_at.desc()),
    uniqueIndex("usage_ledger_idempotency_idx").on(table.idempotency_key),
    index("usage_ledger_type_idx").on(table.type),
    index("usage_ledger_request_log_idx").on(table.request_log_id),
  ]
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    uniqueIndex("accounts_provider_provider_account_id_idx").on(
      table.provider,
      table.providerAccountId
    ),
    index("accounts_user_id_idx").on(table.userId),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionToken: varchar("session_token", { length: 255 }).notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("sessions_session_token_idx").on(table.sessionToken),
    index("sessions_user_id_idx").on(table.userId),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);
