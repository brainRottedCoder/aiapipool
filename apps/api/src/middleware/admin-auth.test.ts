import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { authenticateAdmin } from "./admin-auth.js";

vi.mock("../config/env.js", () => ({
  env: { ADMIN_API_KEY: "correct-admin-key-123456789012345678901234567890" },
}));

vi.mock("./admin-session-auth.js", () => ({
  authenticateAdminSession: vi.fn(),
}));

import { authenticateAdminSession } from "./admin-session-auth.js";

describe("authenticateAdmin", () => {
  let request: Partial<FastifyRequest> & { headers: Record<string, string | undefined>; locals?: unknown };
  let reply: Partial<FastifyReply> & { status: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; sent: boolean };

  beforeEach(() => {
    vi.clearAllMocks();
    request = { headers: {}, id: "req-test", locals: undefined } as never;
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      sent: false,
    } as never;
  });

  it("grants access with valid X-Admin-Key", async () => {
    request.headers["x-admin-key"] = "correct-admin-key-123456789012345678901234567890";
    await authenticateAdmin(request as never, reply as never);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("rejects invalid X-Admin-Key with 401", async () => {
    request.headers["x-admin-key"] = "wrong-key";
    await authenticateAdmin(request as never, reply as never);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("grants access via admin session", async () => {
    (authenticateAdminSession as ReturnType<typeof vi.fn>).mockImplementation(
      async (_req: FastifyRequest) => {
        request.locals = { admin: { id: "admin-1", email: "a@b.com", name: "Admin" } };
      }
    );
    await authenticateAdmin(request as never, reply as never);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("rejects when admin session missing admin in locals", async () => {
    (authenticateAdminSession as ReturnType<typeof vi.fn>).mockImplementation(async () => {
      request.locals = {};
    });
    await authenticateAdmin(request as never, reply as never);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("rejects when neither admin key nor session present", async () => {
    (authenticateAdminSession as ReturnType<typeof vi.fn>).mockImplementation(
      async (_req: FastifyRequest, rep: FastifyReply) => {
        rep.status(401).send({ error: {} });
        rep.sent = true;
      }
    );
    await authenticateAdmin(request as never, reply as never);
    expect(reply.status).toHaveBeenCalledWith(401);
  });
});
