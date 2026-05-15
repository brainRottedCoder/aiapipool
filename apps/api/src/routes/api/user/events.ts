import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { subscriberRedis } from "../../../redis/client.js";

export async function eventsRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    // Hijack Fastify reply to manage raw SSE stream
    reply.hijack();
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const channel = `user_events:${user.id}`;
    const heartbeatInterval: NodeJS.Timeout | undefined;
    let isClosed = false;

    const sendEvent = (data: unknown) => {
      if (!isClosed) {
        reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    const messageHandler = (messageChannel: string, message: string) => {
      if (messageChannel === channel) {
        try {
          const parsed = JSON.parse(message);
          sendEvent(parsed);
        } catch {
          sendEvent({ type: "unknown", raw: message });
        }
      }
    };

    await subscriberRedis.subscribe(channel);
    subscriberRedis.on("message", messageHandler);

    // Heartbeat every 30s to keep connection alive
    heartbeatInterval = setInterval(() => {
      sendEvent({ type: "heartbeat" });
    }, 30000);

    // Cleanup on client disconnect
    request.raw.on("close", () => {
      isClosed = true;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      subscriberRedis.unsubscribe(channel).catch(() => {});
      subscriberRedis.off("message", messageHandler);
      reply.raw.end();
    });
  });
}
