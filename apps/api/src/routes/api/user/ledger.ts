import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { usageLedger } from "../../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export async function ledgerRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const query = request.query as { limit?: string; offset?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 200);
    const offset = parseInt(query.offset ?? "0", 10);

    const rows = await db
      .select()
      .from(usageLedger)
      .where(eq(usageLedger.user_id, user.id))
      .orderBy(desc(usageLedger.created_at))
      .limit(limit)
      .offset(offset);

    return reply.status(200).send({ data: rows, limit, offset });
  });
}
