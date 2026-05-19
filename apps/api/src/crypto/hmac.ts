import { createHmac, timingSafeEqual } from "crypto";

/**
 * Hash an API key using HMAC-SHA256 with a pepper.
 * Returns a hex string.
 */
export function hashApiKey(rawKey: string, pepper: string): string {
  return createHmac("sha256", pepper).update(rawKey).digest("hex");
}

/**
 * Verify an API key against a stored HMAC hash.
 * Uses crypto.timingSafeEqual to prevent timing attacks.
 */
export function verifyApiKey(rawKey: string, storedHash: string, pepper: string): boolean {
  const computedHash = hashApiKey(rawKey, pepper);

  // timingSafeEqual requires equal-length Buffers
  try {
    const computed = Buffer.from(computedHash, "hex");
    const stored = Buffer.from(storedHash, "hex");

    if (computed.length !== stored.length) {
      return false;
    }

    return timingSafeEqual(computed, stored);
  } catch {
    return false;
  }
}
