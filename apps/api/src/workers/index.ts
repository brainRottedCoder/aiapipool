import { Queue, Worker } from "bullmq";
import { redis, bullmqRedis } from "../redis/client.js";
import pino from "pino";
import { runHealthChecker } from "./health-checker.js";
import { runBalanceReconciler } from "./balance-reconciler.js";
import { runKeyCleaner } from "./key-cleaner.js";
import { runAnalyticsAggregator } from "./analytics-aggregator.js";
import { runMarginReporter } from "./margin-reporter.js";
import { runDataRetention } from "./data-retention.js";

const logger = pino({ name: "workers" });

interface QueueConfig {
  name: string;
  cron: string;
  handler: () => Promise<void>;
}

const queueConfigs: QueueConfig[] = [
  { name: "health-check", cron: "*/1 * * * *", handler: runHealthChecker },
  { name: "balance-sync", cron: "*/5 * * * *", handler: runBalanceReconciler },
  { name: "key-cleanup", cron: "*/10 * * * *", handler: runKeyCleaner },
  { name: "analytics", cron: "*/15 * * * *", handler: runAnalyticsAggregator },
  { name: "margin-report", cron: "0 0 * * *", handler: runMarginReporter },
  { name: "data-retention", cron: "0 2 * * *", handler: runDataRetention },
];

const workers: Worker[] = [];
const queues: Queue[] = [];

export async function bootstrapWorkers(): Promise<void> {
  for (const config of queueConfigs) {
    const queue = new Queue(config.name, { connection: redis });
    queues.push(queue);

    // Add repeatable scheduled job
    await queue.add(
      config.name,
      {},
      { repeat: { pattern: config.cron }, jobId: config.name }
    );

    // Real worker handler
    const worker = new Worker(
      config.name,
      async (_job) => {
        try {
          await config.handler();
        } catch (err: unknown) {
          logger.error({ err, queue: config.name }, "Worker handler failed");
          throw err;
        }
      },
      { connection: bullmqRedis }
    );

    worker.on("error", (err: Error) => {
      logger.error({ err, queue: config.name }, "Worker error");
    });

    workers.push(worker);
    logger.info({ queue: config.name, cron: config.cron }, "Queue and worker initialized");
  }
}

export async function closeWorkers(): Promise<void> {
  for (const worker of workers) {
    await worker.close();
  }
  for (const queue of queues) {
    await queue.close();
  }
  logger.info("All workers and queues closed");
}
