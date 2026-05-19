import type { FastifyReply } from "fastify";

export type OpenAIErrorType =
  | "invalid_request_error"
  | "authentication_error"
  | "rate_limit_error"
  | "billing_error"
  | "server_error"
  | "not_found_error";

export interface OpenAIError {
  error: {
    message: string;
    type: OpenAIErrorType;
    code: string | null;
    param: string | null;
  };
}

const statusToType: Record<number, OpenAIErrorType> = {
  400: "invalid_request_error",
  401: "authentication_error",
  402: "billing_error",
  403: "authentication_error",
  404: "not_found_error",
  429: "rate_limit_error",
  500: "server_error",
  502: "server_error",
  503: "server_error",
};

export function createOpenAIError(
  statusCode: number,
  message: string,
  code: string | null = null,
  param: string | null = null
): OpenAIError {
  const type = statusToType[statusCode] ?? "server_error";
  return { error: { message, type, code, param } };
}

export function sendOpenAIError(
  reply: FastifyReply,
  statusCode: number,
  message: string,
  code?: string | null,
  param?: string | null
) {
  const error = createOpenAIError(
    statusCode,
    message,
    code ?? null,
    param ?? null
  );
  return reply.status(statusCode).send(error);
}
