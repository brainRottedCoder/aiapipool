import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export async function meRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: {
          message: "Unauthorized",
          type: "authentication_error",
          code: null,
          param: null,
        },
      });
    }
    return reply.status(200).send({
      id: user.id,
      email: user.email,
      balance: user.balance,
      status: user.status,
    });
  });
}
