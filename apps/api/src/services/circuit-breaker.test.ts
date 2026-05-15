import { describe, it, expect, beforeEach, vi } from "vitest";
import { isOpen, recordFailure, recordSuccess } from "./circuit-breaker.js";
import { CONSTANTS } from "../config/constants.js";

// Mock the Redis client
vi.mock("../redis/client.js", () => ({
  redis: {
    mget: vi.fn(),
    get: vi.fn(),
    setex: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  },
}));

import { redis } from "../redis/client.js";

describe("circuit-breaker", () => {
  const provider = "test-provider";
  const keyId = "test-key-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts closed (not open)", async () => {
    vi.mocked(redis.mget).mockResolvedValue([null, null, null]);

    const open = await isOpen(provider, keyId);
    expect(open).toBe(false);
  });

  it("opens after threshold failures", async () => {
    const threshold = CONSTANTS.CIRCUIT_BREAKER_THRESHOLD;

    // Simulate incrementing failure count
    let failureCount = 0;
    vi.mocked(redis.incr).mockImplementation(async () => {
      return ++failureCount;
    });
    vi.mocked(redis.setex).mockResolvedValue("OK");
    vi.mocked(redis.expire).mockResolvedValue(1);

    for (let i = 0; i < threshold; i++) {
      await recordFailure(provider, keyId);
    }

    // After threshold failures, isOpen should return true
    vi.mocked(redis.mget).mockResolvedValue([
      String(threshold), // failures
      "open",            // state
      String(Date.now()), // lastFailure
    ]);

    const open = await isOpen(provider, keyId);
    expect(open).toBe(true);
  });

  it("closes after success when half-open", async () => {
    // Set state to half-open
    vi.mocked(redis.get).mockResolvedValue("half-open");
    vi.mocked(redis.del).mockResolvedValue(1);

    await recordSuccess(provider, keyId);

    expect(redis.setex).toHaveBeenCalledWith(
      `cb:${provider}:${keyId}:state`,
      300,
      "closed"
    );
  });

  it("resets failure count on success", async () => {
    vi.mocked(redis.del).mockResolvedValue(1);
    vi.mocked(redis.get).mockResolvedValue(null);

    await recordSuccess(provider, keyId);

    expect(redis.del).toHaveBeenCalledWith(`cb:${provider}:${keyId}:failures`);
  });

  it("tracks global provider failures without keyId", async () => {
    const threshold = CONSTANTS.CIRCUIT_BREAKER_THRESHOLD;
    let failureCount = 0;

    vi.mocked(redis.incr).mockImplementation(async () => {
      return ++failureCount;
    });
    vi.mocked(redis.setex).mockResolvedValue("OK");
    vi.mocked(redis.expire).mockResolvedValue(1);

    for (let i = 0; i < threshold; i++) {
      await recordFailure(provider);
    }

    vi.mocked(redis.mget).mockResolvedValue([
      String(threshold),
      "open",
      String(Date.now()),
    ]);

    const open = await isOpen(provider);
    expect(open).toBe(true);
  });
});
