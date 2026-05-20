import type { FastifyInstance } from "fastify";
import { registerRoute } from "./register.js";
import { verifyEmailRoute } from "./verify-email.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(registerRoute);
  await app.register(verifyEmailRoute);
}
