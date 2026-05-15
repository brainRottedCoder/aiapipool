import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { users } from "../../../db/schema.js";
import { eq } from "drizzle-orm";
import { stripe } from "../../../services/billing.js";

export async function invoicesRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const query = request.query as { limit?: string; starting_after?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 200);

    // Lookup Stripe customer ID
    const userRows = await db
      .select({ stripe_customer_id: users.stripe_customer_id })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const customerId = userRows[0]?.stripe_customer_id;
    if (!customerId) {
      return reply.status(200).send({ data: [], has_more: false });
    }

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
      starting_after: query.starting_after,
    });

    return reply.status(200).send({
      data: invoices.data,
      has_more: invoices.has_more,
      limit,
    });
  });
}
