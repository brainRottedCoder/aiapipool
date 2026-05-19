import { describe, it, expect, vi, beforeEach } from "vitest";
import { runHealthChecker } from "./health-checker.js";
import { runBalanceReconciler } from "./balance-reconciler.js";
import { runKeyCleaner } from "./key-cleaner.js";
import { runAnalyticsAggregator } from "./analytics-aggregator.js";
import { runMarginReporter } from "./margin-reporter.js";
import { runDataRetention } from "./data-retention.js";

function createDbProxy(): any {
  const handler = {
    get(_target: any, prop: string) {
      if (prop === "then" || prop === "catch") return undefined;
      return vi.fn(() => createDbProxy());
    },
  };
  return new Proxy({}, handler);
}

vi.mock("../db/client.js", () => {
  const dbProxy = createDbProxy();
  // Override specific terminal methods to return resolved values
  dbProxy.limit = vi.fn(() => Promise.resolve([]));
  dbProxy.orderBy = vi.fn(() => Promise.resolve([]));
  dbProxy.groupBy = vi.fn(() => Promise.resolve([]));
  dbProxy.insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve([])) }));
  dbProxy.update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) })) }));
  dbProxy.delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) }));
  return { db: dbProxy };
});

vi.mock("../redis/client.js", () => ({
  redis: {
    setex: vi.fn(() => Promise.resolve("OK")),
    get: vi.fn(() => Promise.resolve(null)),
    pipeline: vi.fn(() => ({
      setex: vi.fn().mockReturnThis(),
      exec: vi.fn(() => Promise.resolve([])),
    })),
  },
}));

vi.mock("../providers/registry.js", () => ({
  getAdapter: vi.fn(() => ({ baseUrl: "https://api.example.com/v1" })),
}));

vi.mock("../services/circuit-breaker.js", () => ({
  recordFailure: vi.fn(),
  recordSuccess: vi.fn(),
}));

import { db } from "../db/client.js";

describe("workers", () => {
  let dbProxy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    dbProxy = db as any;
    // Ensure terminal methods resolve
    dbProxy.limit = vi.fn(() => Promise.resolve([]));
    dbProxy.orderBy = vi.fn(() => Promise.resolve([]));
    dbProxy.groupBy = vi.fn(() => Promise.resolve([]));
    dbProxy.insert = vi.fn(() => ({ values: vi.fn(() => Promise.resolve([])) }));
    dbProxy.update = vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) })) }));
    dbProxy.delete = vi.fn(() => ({ where: vi.fn(() => Promise.resolve([])) }));
  });

  it("health-checker runs without throwing", async () => {
    await expect(runHealthChecker()).resolves.not.toThrow();
  });

  it("balance-reconciler runs without throwing", async () => {
    dbProxy.select.mockReturnValueOnce({
      from: vi.fn(() => Promise.resolve([{ id: "u1", balance: "50.00" }])),
    });
    dbProxy.select.mockReturnValueOnce({
      from: vi.fn(() => ({
        groupBy: vi.fn(() => Promise.resolve([{ user_id: "u1", total: "50.00" }])),
      })),
    });
    await expect(runBalanceReconciler()).resolves.not.toThrow();
  });

  it("key-cleaner runs without throwing", async () => {
    await expect(runKeyCleaner()).resolves.not.toThrow();
  });

  it("analytics-aggregator runs without throwing", async () => {
    await expect(runAnalyticsAggregator()).resolves.not.toThrow();
  });

  it("margin-reporter runs without throwing", async () => {
    await expect(runMarginReporter()).resolves.not.toThrow();
  });

  it("data-retention runs without throwing", async () => {
    await expect(runDataRetention()).resolves.not.toThrow();
  });
});
