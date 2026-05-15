import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { users, requestLogs } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { sendOpenAIError } from "../../utils/errors.js";

export async function usersRoute(app: FastifyInstance): Promise<void> {
  // GET /admin/users — list users with balance + status
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
        balance: users.balance,
        status: users.status,
        role: users.role,
        created_at: users.created_at,
      })
      .from(users)
      .where(conditions)
      .limit(limit)
      .offset(offset)
      .orderBy(users.created_at);

    return reply.status(200).send({ data: rows, limit, offset });
  });

  // PATCH /admin/users/:id/suspend
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
    return reply.status(200).send({ suspended: true });
  });

  // PATCH /admin/users/:id/unsuspend
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
    return reply.status(200).send({ unsuspended: true });
  });

  // GET /admin/users/:id/usage
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
}
