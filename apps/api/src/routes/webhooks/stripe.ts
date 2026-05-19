import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Readable } from "stream";
import { handleWebhook } from "../../services/billing.js";

export async function stripeWebhookRoute(app: FastifyInstance): Promise<void> {
  app.post(
    "/stripe",
    {
      config: { rawBody: true },
      preParsing: async (request, reply, payload) => {
        const chunks: Buffer[] = [];
        for await (const chunk of payload) {
          chunks.push(chunk);
        }
        const raw = Buffer.concat(chunks);
        (request as FastifyRequest & { rawBody: Buffer }).rawBody = raw;
        // Return readable so Fastify does not parse JSON
        const readable = new Readable();
        readable.push(raw);
        readable.push(null);
        return readable;
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rawBody = (request as FastifyRequest & { rawBody: Buffer }).rawBody;
      const signature = request.headers["stripe-signature"] as string | undefined;

      if (!signature) {
        return reply.status(400).send({ error: { message: "Missing stripe-signature header", type: "invalid_request_error", code: null, param: null } });
      }

      try {
        await handleWebhook(rawBody, signature);
        return reply.status(200).send({ received: true });
      } catch (err) {
        request.log.error({ err }, "Stripe webhook processing failed");
        return reply.status(400).send({ error: { message: "Webhook processing failed", type: "invalid_request_error", code: "webhook_failed", param: null } });
      }
    }
  );
}
