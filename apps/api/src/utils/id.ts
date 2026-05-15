import { nanoid } from "nanoid";
import { randomUUID } from "crypto";

export function generateId(): string {
  return randomUUID();
}

export function generateRequestId(): string {
  return randomUUID();
}

export function generateApiKey(): string {
  return `sk_live_${nanoid(32)}`;
}

export function generateIdempotencyKey(
  prefix: string,
  ...parts: string[]
): string {
  return `${prefix}_${parts.join("_")}`;
}
