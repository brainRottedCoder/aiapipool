import fastify from "fastify";
import pino from "pino";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "./config/env.js";
import { registerRequestIdHook } from "./middleware/request-id.js";
import { healthRoute } from "./routes/health.js";
import { v1Routes } from "./routes/v1/index.js";
import { userRoutes } from "./routes/api/user/index.js";
import { webhookRoutes } from "./routes/webhooks/index.js";
import { adminRoutes } from "./routes/admin/index.js";
import { registry, httpRequestsTotal, requestDuration } from "./metrics/metrics.js";

export async function buildApp() {
  const app = fastify({
    loggerInstance: pino({
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
      redact: {
        paths: [
          "req.headers.authorization",
          'req.headers["x-admin-key"]',
          "*.password_hash",
          "*.api_key_encrypted",
        ],
        remove: true,
      },
    }) as import("fastify").FastifyBaseLogger,
    trustProxy: true,
    bodyLimit: 2 * 1024 * 1024, // 2 MB
    requestIdHeader: "x-request-id",
  });

  // ── Plugins ──
  const corsOrigins = new Set<string>([
    env.WEB_APP_URL ?? env.NEXTAUTH_URL,
    env.NEXTAUTH_URL,
  ]);
  if (env.NODE_ENV === "development") {
    corsOrigins.add("http://localhost:3001");
    corsOrigins.add("http://localhost:3000");
  }

  await app.register(cors, {
    origin: (origin, callback) => {
      if (!origin || corsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
    allowedHeaders: [
      "Authorization",
      "X-Admin-Key",
      "X-Request-ID",
      "Content-Type",
    ],
  });

  await app.register(helmet);

  // ── Global hooks ──
  // 1. Request-ID injection (runs first on every request)
  registerRequestIdHook(app);

  // ── Metrics middleware ──
  app.addHook("onResponse", async (request, reply) => {
    const path = request.url;
    const provider = (request as unknown as Record<string, unknown>).provider as string ?? "unknown";
    httpRequestsTotal.inc({
      method: request.method,
      path,
      status_code: reply.statusCode.toString(),
    });
    requestDuration.observe({ path, provider }, reply.elapsedTime / 1000);
  });

  // ── Global error handler → OpenAI-compatible format ──
  app.setErrorHandler((err, request, reply) => {
    request.log.error({ err }, "Unhandled error");

    // If reply already started, let it propagate
    if (reply.sent) {
      return;
    }

    const errorObj = err as Error & { statusCode?: number; code?: string };
    const statusCode = errorObj.statusCode ?? 500;
    const message = errorObj.message || "Internal server error";
    const code = errorObj.code ?? null;
    reply.status(statusCode).send({
      error: {
        message,
        type:
          statusCode === 400
            ? "invalid_request_error"
            : statusCode === 401 || statusCode === 403
              ? "authentication_error"
              : statusCode === 402
                ? "billing_error"
                : statusCode === 404
                  ? "not_found_error"
                  : statusCode === 429
                    ? "rate_limit_error"
                    : "server_error",
        code,
        param: null,
      },
    });
  });

  // ── Route modules ──
  // Order: health (public) → v1 (API key + rate limit) → user (session) → webhooks (signature) → admin (admin key) → metrics (internal)
  await app.register(healthRoute, { prefix: "/health" });
  await app.register(v1Routes, { prefix: "/v1" });
  await app.register(userRoutes, { prefix: "/api/user" });
  await app.register(webhookRoutes, { prefix: "/webhooks" });
  await app.register(adminRoutes, { prefix: "/admin" });

  // ── Prometheus metrics endpoint (internal network only in production) ──
  app.get("/metrics", async (_request, reply) => {
    const metrics = await registry.metrics();
    reply.header("Content-Type", registry.contentType);
    reply.send(metrics);
  });

  return app;
}
