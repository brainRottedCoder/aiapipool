import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { authenticateAdmin } from "./admin-auth.js";

vi.mock("../config/env.js", () => ({
  env: { ADMIN_API_KEY: "correct-admin-key-123456789012345678901234567890" },
}));

vi.mock("./session-auth.js", () => ({
  authenticateSession: vi.fn(),
}));

import { authenticateSession } from "./session-auth.js";

describe("authenticateAdmin", () => {
  let request: Partial<FastifyRequest> & { headers: Record<string, string | undefined>; locals?: any };
  let reply: Partial<FastifyReply> & { status: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; sent: boolean };

  beforeEach(() => {
    vi.clearAllMocks();
    request = { headers: {}, id: "req-test", locals: undefined } as any;
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      sent: false,
    } as any;
  });

  it("grants access with valid X-Admin-Key", async () => {
    request.headers["x-admin-key"] = "correct-admin-key-123456789012345678901234567890";
    await authenticateAdmin(request as any, reply as any);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("rejects invalid X-Admin-Key with 401", async () => {
    request.headers["x-admin-key"] = "wrong-key";
    await authenticateAdmin(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("grants access via admin session", async () => {
    (authenticateSession as any).mockImplementation(async (_req: any, _reply: any) => {
      request.locals = { user: { id: "admin-1", role: "admin" } };
    });
    await authenticateAdmin(request as any, reply as any);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("rejects non-admin session with 401", async () => {
    (authenticateSession as any).mockImplementation(async (_req: any, _reply: any) => {
      request.locals = { user: { id: "user-1", role: "user" } };
    });
    await authenticateAdmin(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("rejects when neither admin key nor session present", async () => {
    (authenticateSession as any).mockImplementation(async (_req: any, reply: any) => {
      reply.status(401).send({ error: {} });
    });
    await authenticateAdmin(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });
});
