import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { accounts, users } from "../../../db/schema.js";
import { eq } from "drizzle-orm";

export async function meRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: {
          message: "Unauthorized",
          type: "authentication_error",
          code: null,
          param: null,
        },
      });
    }

    const [dbUser] = await db
      .select({ password_hash: users.password_hash })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const oauthRows = await db
      .select({ provider: accounts.provider })
      .from(accounts)
      .where(eq(accounts.userId, user.id));

    const oauthProviders = oauthRows
      .map((row) => row.provider)
      .filter((provider) => provider !== "credentials");

    return reply.status(200).send({
      id: user.id,
      email: user.email,
      balance: user.balance,
      status: user.status,
      has_password: Boolean(dbUser?.password_hash),
      oauth_providers: oauthProviders,
    });
  });
}
