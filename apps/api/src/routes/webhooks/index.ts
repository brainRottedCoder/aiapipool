import type { FastifyInstance } from "fastify";
import { stripeWebhookRoute } from "./stripe.js";

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  await app.register(stripeWebhookRoute, { prefix: "/stripe" });
}
