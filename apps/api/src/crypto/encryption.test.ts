import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./encryption.js";

const MASTER_KEY = Buffer.from("a".repeat(32)); // 32-byte master key

describe("encryption", () => {
  it("round-trips plaintext correctly", () => {
    const plaintext = "my-secret-api-key-12345";
    const encrypted = encrypt(plaintext, MASTER_KEY);
    const decrypted = decrypt(encrypted, MASTER_KEY);
    expect(decrypted).toBe(plaintext);
  });

  it("returns a Buffer with correct structure", () => {
    const plaintext = "test";
    const encrypted = encrypt(plaintext, MASTER_KEY);
    // iv (16) + authTag (16) + ciphertext
    expect(encrypted.length).toBeGreaterThanOrEqual(32);
  });

  it("produces different ciphertexts for same plaintext (random IV)", () => {
    const plaintext = "same-plaintext";
    const encrypted1 = encrypt(plaintext, MASTER_KEY);
    const encrypted2 = encrypt(plaintext, MASTER_KEY);
    expect(encrypted1.toString("hex")).not.toBe(encrypted2.toString("hex"));
  });

  it("throws on tampered ciphertext", () => {
    const plaintext = "sensitive-data";
    const encrypted = encrypt(plaintext, MASTER_KEY);

    // Flip a byte in the ciphertext portion (after iv+authTag)
    const tampered = Buffer.from(encrypted);
    const idx = tampered.length - 1;
    tampered.writeUInt8(tampered.readUInt8(idx) ^ 0xff, idx);

    expect(() => decrypt(tampered, MASTER_KEY)).toThrow();
  });

  it("throws on tampered auth tag", () => {
    const plaintext = "sensitive-data";
    const encrypted = encrypt(plaintext, MASTER_KEY);

    // Flip a byte in the auth tag portion (bytes 16-31)
    const tampered = Buffer.from(encrypted);
    tampered.writeUInt8(tampered.readUInt8(20) ^ 0xff, 20);

    expect(() => decrypt(tampered, MASTER_KEY)).toThrow();
  });

  it("throws when encrypted buffer is too short", () => {
    const short = Buffer.from("too-short");
    expect(() => decrypt(short, MASTER_KEY)).toThrow("Invalid encrypted data");
  });

  it("fails decryption with wrong master key", () => {
    const plaintext = "secret";
    const encrypted = encrypt(plaintext, MASTER_KEY);
    const wrongKey = Buffer.from("b".repeat(32));
    expect(() => decrypt(encrypted, wrongKey)).toThrow();
  });
});
