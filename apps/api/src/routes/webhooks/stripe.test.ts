import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { stripeWebhookRoute } from "./stripe.js";

vi.mock("../../services/billing.js", () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  handleWebhook: vi.fn(),
}));

import { handleWebhook } from "../../services/billing.js";

describe("stripeWebhookRoute", () => {
  let app: any;
  let registeredHandler: any;
  let registeredConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();
    app = {
      post: vi.fn((path: string, config: any, handler: any) => {
        registeredConfig = config;
        registeredHandler = handler;
      }),
    };
  });

  it("registers POST /stripe with rawBody config", async () => {
    await stripeWebhookRoute(app as unknown as FastifyInstance);
    expect(app.post).toHaveBeenCalledWith("/stripe", expect.any(Object), expect.any(Function));
    expect(registeredConfig.config.rawBody).toBe(true);
    expect(registeredConfig.preParsing).toBeDefined();
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    await stripeWebhookRoute(app as unknown as FastifyInstance);

    const request = { headers: {}, log: { error: vi.fn() } } as any;
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as any;

    await registeredHandler(request, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
  });

  it("returns 200 on valid webhook processing", async () => {
    await stripeWebhookRoute(app as unknown as FastifyInstance);

    (handleWebhook as any).mockResolvedValue(undefined);

    const request = {
      headers: { "stripe-signature": "sig_valid" },
      rawBody: Buffer.from('{"type":"checkout.session.completed"}'),
      log: { error: vi.fn() },
    } as any;
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as any;

    await registeredHandler(request, reply);
    expect(reply.status).toHaveBeenCalledWith(200);
    expect(handleWebhook).toHaveBeenCalledWith(request.rawBody, "sig_valid");
  });

  it("returns 400 on webhook processing failure", async () => {
    await stripeWebhookRoute(app as unknown as FastifyInstance);

    (handleWebhook as any).mockRejectedValue(new Error("Invalid signature"));

    const request = {
      headers: { "stripe-signature": "sig_invalid" },
      rawBody: Buffer.from('{"type":"checkout.session.completed"}'),
      log: { error: vi.fn() },
    } as any;
    const reply = { status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() } as any;

    await registeredHandler(request, reply);
    expect(reply.status).toHaveBeenCalledWith(400);
  });
});
