import { describe, it, expect } from "vitest";
import { hashApiKey, verifyApiKey } from "./hmac.js";

const PEPPER = "super-secret-pepper-for-testing-only!!";

describe("hmac", () => {
  it("produces deterministic 64-char hex hashes", () => {
    const rawKey = "sk_live_test_key_123";
    const hash1 = hashApiKey(rawKey, PEPPER);
    const hash2 = hashApiKey(rawKey, PEPPER);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it("returns different hashes for different peppers", () => {
    const rawKey = "sk_live_test_key_123";
    const hash1 = hashApiKey(rawKey, PEPPER);
    const hash2 = hashApiKey(rawKey, "different-pepper-1234567890123");
    expect(hash1).not.toBe(hash2);
  });

  it("returns different hashes for different raw keys", () => {
    const hash1 = hashApiKey("key-one", PEPPER);
    const hash2 = hashApiKey("key-two", PEPPER);
    expect(hash1).not.toBe(hash2);
  });

  it("verifies correct key", () => {
    const rawKey = "sk_live_test_key_123";
    const storedHash = hashApiKey(rawKey, PEPPER);
    expect(verifyApiKey(rawKey, storedHash, PEPPER)).toBe(true);
  });

  it("rejects incorrect key", () => {
    const rawKey = "sk_live_test_key_123";
    const storedHash = hashApiKey(rawKey, PEPPER);
    expect(verifyApiKey("wrong-key", storedHash, PEPPER)).toBe(false);
  });

  it("rejects key with wrong pepper", () => {
    const rawKey = "sk_live_test_key_123";
    const storedHash = hashApiKey(rawKey, PEPPER);
    expect(verifyApiKey(rawKey, storedHash, "wrong-pepper")).toBe(false);
  });

  it("handles timingSafeEqual safely for non-hex storedHash", () => {
    expect(verifyApiKey("any-key", "not-a-hex-string", PEPPER)).toBe(false);
  });
});
