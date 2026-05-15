import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { authenticateSession } from "./session-auth.js";

vi.mock("../db/client.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

import { db } from "../db/client.js";

describe("authenticateSession", () => {
  let request: Partial<FastifyRequest> & { headers: Record<string, string | undefined>; locals?: any };
  let reply: Partial<FastifyReply> & { status: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; sent: boolean };

  beforeEach(() => {
    vi.clearAllMocks();
    request = {
      headers: {},
      id: "req-test",
    } as any;
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      sent: false,
    } as any;
  });

  it("returns 401 when no cookie or Authorization header present", async () => {
    await authenticateSession(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
    const body = (reply.send as any).mock.calls[0][0];
    expect(body.error.type).toBe("authentication_error");
  });

  it("authenticates via next-auth.session-token cookie", async () => {
    const future = new Date(Date.now() + 86400000);
    const sessionRow = {
      id: "sess-1",
      sessionToken: "token-abc",
      userId: "user-1",
      expires: future,
    };
    const userRow = {
      id: "user-1",
      email: "test@example.com",
      balance: "50.00",
      status: "active",
      role: "user",
    };

    (db.select as any)
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([sessionRow])),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([userRow])),
          })),
        })),
      });

    request.headers.cookie = "next-auth.session-token=token-abc";
    await authenticateSession(request as any, reply as any);

    expect(reply.status).not.toHaveBeenCalled();
    expect(request.locals?.user?.id).toBe("user-1");
  });

  it("authenticates via Authorization Bearer token (cross-domain)", async () => {
    const future = new Date(Date.now() + 86400000);
    const sessionRow = { id: "sess-1", sessionToken: "bearer-token", userId: "user-1", expires: future };
    const userRow = { id: "user-1", email: "test@example.com", balance: "50.00", status: "active", role: "user" };

    (db.select as any)
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([sessionRow])),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([userRow])),
          })),
        })),
      });

    request.headers.authorization = "Bearer bearer-token";
    await authenticateSession(request as any, reply as any);
    expect(request.locals?.user?.id).toBe("user-1");
  });

  it("returns 401 for expired session", async () => {
    const past = new Date(Date.now() - 86400000);
    const sessionRow = { id: "sess-1", sessionToken: "old-token", userId: "user-1", expires: past };

    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([sessionRow])),
        })),
      })),
    });

    request.headers.cookie = "next-auth.session-token=old-token";
    await authenticateSession(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("returns 403 for suspended user", async () => {
    const future = new Date(Date.now() + 86400000);
    const sessionRow = { id: "sess-1", sessionToken: "token-abc", userId: "user-1", expires: future };
    const userRow = { id: "user-1", email: "test@example.com", balance: "50.00", status: "suspended", role: "user" };

    (db.select as any)
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([sessionRow])),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([userRow])),
          })),
        })),
      });

    request.headers.cookie = "next-auth.session-token=token-abc";
    await authenticateSession(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(403);
  });
});
