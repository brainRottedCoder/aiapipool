import type { FastifyInstance } from "fastify";
import { authenticateSession } from "../../../middleware/session-auth.js";
import { meRoute } from "./me.js";
import { usageRoute } from "./usage.js";
import { ledgerRoute } from "./ledger.js";
import { eventsRoute } from "./events.js";
import { apiKeysRoute } from "./api-keys.js";
import { topUpRoute } from "./top-up.js";
import { invoicesRoute } from "./invoices.js";
import { changePasswordRoute } from "./password.js";
import { modelsRoute } from "./models.js";

/**
 * User dashboard API routes — protected by NextAuth session auth.
 */
export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticateSession);

  await app.register(changePasswordRoute);
  await app.register(meRoute, { prefix: "/me" });
  await app.register(usageRoute, { prefix: "/usage" });
  await app.register(ledgerRoute, { prefix: "/ledger" });
  await app.register(eventsRoute, { prefix: "/events" });
  await app.register(apiKeysRoute, { prefix: "/api-keys" });
  await app.register(topUpRoute, { prefix: "/top-up" });
  await app.register(invoicesRoute, { prefix: "/invoices" });
  await app.register(modelsRoute, { prefix: "/models" });
}
