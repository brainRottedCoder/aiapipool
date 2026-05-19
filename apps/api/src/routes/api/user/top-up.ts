import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { CONSTANTS } from "../../../config/constants.js";
import { sendOpenAIError } from "../../../utils/errors.js";
import { createCheckoutSession } from "../../../services/billing.js";

export async function topUpRoute(app: FastifyInstance): Promise<void> {
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const body = request.body as { amount?: number };
    const amount = body.amount ?? 0;

    if (amount < CONSTANTS.MIN_TOPUP_AMOUNT) {
      return sendOpenAIError(
        reply,
        400,
        `Minimum top-up amount is $${CONSTANTS.MIN_TOPUP_AMOUNT}`,
        "invalid_amount",
        null
      );
    }

    try {
      const url = await createCheckoutSession(user.id, amount);
      return reply.status(200).send({ checkout_url: url });
    } catch (err) {
      request.log.error({ err }, "Failed to create checkout session");
      return sendOpenAIError(
        reply,
        500,
        "Failed to create checkout session",
        "checkout_failed",
        null
      );
    }
  });
}
