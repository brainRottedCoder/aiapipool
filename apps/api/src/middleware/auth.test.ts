import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { authenticateUser } from "./auth.js";

// Mock dependencies
vi.mock("../db/client.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
  },
}));

vi.mock("../config/env.js", () => ({
  env: { API_KEY_PEPPER: "test-pepper-123456789012345678901234567890" },
}));

import { db } from "../db/client.js";

describe("authenticateUser", () => {
  let request: Partial<FastifyRequest> & { headers: Record<string, string>; locals?: any };
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

  it("returns 401 when Authorization header is missing", async () => {
    await authenticateUser(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalled();
    const body = (reply.send as any).mock.calls[0][0];
    expect(body.error.type).toBe("authentication_error");
  });

  it("returns 401 when Authorization header is not Bearer", async () => {
    request.headers.authorization = "Basic abc";
    await authenticateUser(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("returns 401 for invalid API key (no DB match)", async () => {
    request.headers.authorization = "Bearer sk_live_invalidkey123";
    await authenticateUser(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(401);
  });

  it("attaches user and apiKey to request.locals on valid key", async () => {
    const mockRow = {
      api_keys: {
        id: "key-1",
        rate_limit_rpm: 60,
        rate_limit_tokens_day: 100000,
      },
      users: {
        id: "user-1",
        email: "test@example.com",
        balance: "50.00",
        status: "active",
        role: "user",
      },
    };

    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockRow])),
          })),
        })),
      })),
    });

    request.headers.authorization = "Bearer sk_live_validkey123";
    await authenticateUser(request as any, reply as any);

    expect(reply.status).not.toHaveBeenCalled();
    expect(request.locals).toBeDefined();
    expect(request.locals.user.id).toBe("user-1");
    expect(request.locals.apiKey.id).toBe("key-1");
  });

  it("returns 403 for suspended user", async () => {
    const mockRow = {
      api_keys: { id: "key-1", rate_limit_rpm: 60, rate_limit_tokens_day: 100000 },
      users: { id: "user-1", email: "test@example.com", balance: "50.00", status: "suspended", role: "user" },
    };

    (db.select as any).mockReturnValueOnce({
      from: vi.fn(() => ({
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([mockRow])),
          })),
        })),
      })),
    });

    request.headers.authorization = "Bearer sk_live_validkey123";
    await authenticateUser(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(403);
  });
});
