import { describe, it, expect, vi, beforeEach } from "vitest";
import type { FastifyRequest, FastifyReply } from "fastify";
import { rateLimiter } from "./rate-limiter.js";

vi.mock("../redis/client.js", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    decr: vi.fn(),
  },
}));

vi.mock("../config/env.js", () => ({
  env: { MAX_CONCURRENT_REQUESTS: 10 },
}));

import { redis } from "../redis/client.js";

describe("rateLimiter", () => {
  let request: Partial<FastifyRequest> & { id: string; url: string; headers: any; locals?: any; ip?: string; raw: any };
  let reply: Partial<FastifyReply> & { status: ReturnType<typeof vi.fn>; send: ReturnType<typeof vi.fn>; raw: any };

  beforeEach(() => {
    vi.clearAllMocks();
    request = {
      id: "req-test",
      url: "/v1/chat/completions",
      headers: {},
      locals: {
        apiKey: { id: "key-1", rate_limit_rpm: 60, rate_limit_tokens_day: 100000 },
      },
      raw: { on: vi.fn() },
    } as any;
    reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      raw: { on: vi.fn() },
    } as any;
  });

  it("allows request when under limits", async () => {
    (redis.incr as any).mockResolvedValue(1);
    (redis.get as any).mockResolvedValue(null);

    await rateLimiter(request as any, reply as any);
    expect(reply.status).not.toHaveBeenCalled();
    expect(redis.incr).toHaveBeenCalledWith("rl:rpm:key-1");
  });

  it("returns 429 when RPM exceeded", async () => {
    (redis.incr as any).mockResolvedValue(61);
    await rateLimiter(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(429);
    const body = (reply.send as any).mock.calls[0][0];
    expect(body.error.type).toBe("rate_limit_error");
  });

  it("fails open (allows traffic) when Redis is unreachable", async () => {
    (redis.incr as any).mockRejectedValue(new Error("Redis connection refused"));
    await rateLimiter(request as any, reply as any);
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("falls back to IP-based limit for unauthenticated requests", async () => {
    request.locals = undefined;
    request.ip = "192.168.1.1";
    (redis.incr as any).mockResolvedValue(1);

    await rateLimiter(request as any, reply as any);
    expect(redis.incr).toHaveBeenCalledWith("rl:ip:192.168.1.1");
    expect(reply.status).not.toHaveBeenCalled();
  });

  it("returns 429 for unauthenticated IP when limit exceeded", async () => {
    request.locals = undefined;
    request.ip = "192.168.1.1";
    (redis.incr as any).mockResolvedValue(11);
    await rateLimiter(request as any, reply as any);
    expect(reply.status).toHaveBeenCalledWith(429);
  });
});
