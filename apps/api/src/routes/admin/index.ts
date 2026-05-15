import type { FastifyInstance } from "fastify";
import { authenticateAdmin } from "../../middleware/admin-auth.js";
import { usersRoute } from "./users.js";
import { providerKeysRoute } from "./provider-keys.js";
import { modelMappingsRoute } from "./model-mappings.js";
import { healthRoute } from "./health.js";
import { marginsRoute } from "./margins.js";
import { ledgersRoute } from "./ledgers.js";
import { balanceReconciliationsRoute } from "./balance-reconciliations.js";
import { emergencyRoute } from "./emergency.js";

/**
 * Admin API routes — protected by X-Admin-Key or admin session.
 */
export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticateAdmin);

  await app.register(usersRoute, { prefix: "/users" });
  await app.register(providerKeysRoute, { prefix: "/provider-keys" });
  await app.register(modelMappingsRoute, { prefix: "/model-mappings" });
  await app.register(healthRoute, { prefix: "/health" });
  await app.register(marginsRoute, { prefix: "/margins" });
  await app.register(ledgersRoute, { prefix: "/ledgers" });
  await app.register(balanceReconciliationsRoute, { prefix: "/balance-reconciliations" });
  await app.register(emergencyRoute, { prefix: "/emergency" });
}
