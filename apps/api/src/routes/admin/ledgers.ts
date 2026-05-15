import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { usageLedger } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export async function ledgersRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { user_id?: string; limit?: string; offset?: string };
    const limit = Math.min(parseInt(query.limit ?? "100", 10), 500);
    const offset = parseInt(query.offset ?? "0", 10);

    let conditions = undefined;
    if (query.user_id) {
      conditions = eq(usageLedger.user_id, query.user_id);
    }

    const rows = await db
      .select()
      .from(usageLedger)
      .where(conditions)
      .orderBy(desc(usageLedger.created_at))
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({ data: rows, limit, offset });
  });
}
