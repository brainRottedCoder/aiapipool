import { randomUUID } from "crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";

/**
 * Fastify onRequest hook that injects a trace/request ID into every request.
 *
 * - Reads the `x-request-id` header if present.
 * - Otherwise generates a fresh UUID via `crypto.randomUUID()`.
 * - Attaches the ID to `request.id` (Fastify native).
 * - Creates a Pino child logger on the request so every downstream log line
 *   carries the same trace ID.
 */
export function registerRequestIdHook(app: FastifyInstance): void {
  app.addHook("onRequest", async (request: FastifyRequest) => {
    const headerId = request.headers["x-request-id"];
    const requestId =
      typeof headerId === "string" && headerId.trim().length > 0
        ? headerId.trim()
        : randomUUID();

    // Override Fastify's default generated ID with our deterministic one
    (request as FastifyRequest & { id: string }).id = requestId;

    // Attach child logger so every log line carries trace context
    request.log = request.log.child({ requestId });
  });
}
