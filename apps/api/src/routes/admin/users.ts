import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import {
  users,
  requestLogs,
  usageLedger,
  accounts,
  adminAuditLogs,
} from "../../db/schema.js";
import { eq, sql, and, gte } from "drizzle-orm";
import { sendOpenAIError } from "../../utils/errors.js";
import { randomUUID } from "crypto";

async function writeAuditLog(
  request: FastifyRequest,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const adminId = request.locals?.admin?.id;
  if (!adminId) return;

  const forwarded = request.headers["x-forwarded-for"];
  const ip =
    typeof forwarded === "string"
      ? forwarded.split(",")[0]?.trim()
      : request.ip;

  await db.insert(adminAuditLogs).values({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
    ip: ip ?? null,
  });
}

export async function usersRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { limit?: string; offset?: string; status?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 200);
    const offset = parseInt(query.offset ?? "0", 10);

    let conditions = undefined;
    if (query.status) {
      conditions = eq(users.status, query.status as "active" | "suspended");
    }

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        balance: users.balance,
        status: users.status,
        created_at: users.created_at,
      })
      .from(users)
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(users.created_at);

    return reply.status(200).send({ data: rows, limit, offset });
  });

  app.get("/:id/summary", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const now = Date.now();
    const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const exists = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (exists.length === 0) {
      return sendOpenAIError(reply, 404, "User not found", "not_found", null);
    }

    const aggregate = async (since?: Date) => {
      const conditions = since
        ? and(eq(requestLogs.user_id, id), gte(requestLogs.created_at, since))
        : eq(requestLogs.user_id, id);

      const [row] = await db
        .select({
          request_count: sql<number>`count(*)::int`,
          tokens_input: sql<number>`coalesce(sum(${requestLogs.tokens_input}), 0)::int`,
          tokens_output: sql<number>`coalesce(sum(${requestLogs.tokens_output}), 0)::int`,
          total_charged: sql<string>`coalesce(sum(${requestLogs.user_charge}), 0)::text`,
        })
        .from(requestLogs)
        .where(conditions);

      return row;
    };

    const [allTime, last7d, last30d] = await Promise.all([
      aggregate(),
      aggregate(since7d),
      aggregate(since30d),
    ]);

    return reply.status(200).send({
      all_time: allTime,
      last_7d: last7d,
      last_30d: last30d,
    });
  });

  app.get("/:id/ledger", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; offset?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 200);
    const offset = parseInt(query.offset ?? "0", 10);

    const rows = await db
      .select()
      .from(usageLedger)
      .where(eq(usageLedger.user_id, id))
      .orderBy(sql`${usageLedger.created_at} DESC`)
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({ data: rows, limit, offset });
  });

  app.patch("/:id/suspend", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await db
      .update(users)
      .set({ status: "suspended" })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "User not found", "not_found", null);
    }

    await writeAuditLog(request, "user.suspend", "user", id);
    return reply.status(200).send({ suspended: true });
  });

  app.patch("/:id/unsuspend", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const result = await db
      .update(users)
      .set({ status: "active" })
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "User not found", "not_found", null);
    }

    await writeAuditLog(request, "user.unsuspend", "user", id);
    return reply.status(200).send({ unsuspended: true });
  });

  app.patch("/:id/balance", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { amount?: string; reason?: string };

    const amount = body.amount?.trim();
    const reason = body.reason?.trim() || "Manual adjustment";

    if (!amount || Number.isNaN(Number(amount))) {
      return sendOpenAIError(reply, 400, "Valid amount is required", "invalid_request", "amount");
    }

    const userRows = await db
      .select({ id: users.id, balance: users.balance })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = userRows[0];
    if (!user) {
      return sendOpenAIError(reply, 404, "User not found", "not_found", null);
    }

    const currentBalance = Number(user.balance);
    const delta = Number(amount);
    const newBalance = (currentBalance + delta).toFixed(4);

    await db.update(users).set({ balance: newBalance }).where(eq(users.id, id));

    await db.insert(usageLedger).values({
      user_id: id,
      amount: delta.toFixed(4),
      balance_after: newBalance,
      type: "adjustment",
      idempotency_key: `admin-adjust-${randomUUID()}`,
    });

    await writeAuditLog(request, "user.balance_adjust", "user", id, {
      amount: delta,
      reason,
      balance_after: newBalance,
    });

    return reply.status(200).send({ balance: newBalance });
  });

  app.get("/:id/usage", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string; offset?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 200);
    const offset = parseInt(query.offset ?? "0", 10);

    const rows = await db
      .select()
      .from(requestLogs)
      .where(eq(requestLogs.user_id, id))
      .orderBy(sql`${requestLogs.created_at} DESC`)
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({ data: rows, limit, offset });
  });

  app.get("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        balance: users.balance,
        status: users.status,
        stripe_customer_id: users.stripe_customer_id,
        created_at: users.created_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return sendOpenAIError(reply, 404, "User not found", "not_found", null);
    }

    const oauthProviders = await db
      .select({ provider: accounts.provider })
      .from(accounts)
      .where(eq(accounts.userId, id));

    return reply.status(200).send({
      ...user,
      oauth_providers: oauthProviders.map((a) => a.provider),
    });
  });
}
