import type { FastifyInstance } from "fastify";
import { authenticateAdmin } from "../../middleware/admin-auth.js";
import { adminAuthRoute } from "./auth.js";
import { usersRoute } from "./users.js";
import { providerKeysRoute } from "./provider-keys.js";
import { modelMappingsRoute } from "./model-mappings.js";
import { healthRoute } from "./health.js";
import { marginsRoute } from "./margins.js";
import { ledgersRoute } from "./ledgers.js";
import { balanceReconciliationsRoute } from "./balance-reconciliations.js";
import { emergencyRoute } from "./emergency.js";
import { overviewRoute } from "./overview.js";
import { activityRoute } from "./activity.js";

/**
 * Admin API routes — public auth, then X-Admin-Key or admin session for protected routes.
 */
export async function adminRoutes(app: FastifyInstance): Promise<void> {
  await app.register(adminAuthRoute, { prefix: "/auth" });

  await app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authenticateAdmin);

    await protectedApp.register(overviewRoute, { prefix: "/overview" });
    await protectedApp.register(activityRoute, { prefix: "/activity" });
    await protectedApp.register(usersRoute, { prefix: "/users" });
    await protectedApp.register(providerKeysRoute, { prefix: "/provider-keys" });
    await protectedApp.register(modelMappingsRoute, { prefix: "/model-mappings" });
    await protectedApp.register(healthRoute, { prefix: "/health" });
    await protectedApp.register(marginsRoute, { prefix: "/margins" });
    await protectedApp.register(ledgersRoute, { prefix: "/ledgers" });
    await protectedApp.register(balanceReconciliationsRoute, {
      prefix: "/balance-reconciliations",
    });
    await protectedApp.register(emergencyRoute, { prefix: "/emergency" });
  });
}
