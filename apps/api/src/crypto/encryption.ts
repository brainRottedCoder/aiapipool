import { randomBytes, createCipheriv, createDecipheriv, hkdfSync } from "crypto";

const IV_LENGTH = 16;   // bytes
const AUTH_TAG_LENGTH = 16; // bytes
const DEK_LENGTH = 32;  // bytes (AES-256)
const HKDF_INFO = Buffer.from("fluxai-provider-key-v1");
const HKDF_SALT = Buffer.alloc(0);

/**
 * Derive a per-key Data Encryption Key (DEK) from the master key using HKDF.
 */
function deriveDek(masterKey: Buffer): Buffer {
  return Buffer.from(hkdfSync("sha256", masterKey, HKDF_SALT, HKDF_INFO, DEK_LENGTH));
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a single Buffer: [iv (16) | authTag (16) | ciphertext].
 */
export function encrypt(plaintext: string, masterKey: Buffer): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const dek = deriveDek(masterKey);

  const cipher = createCipheriv("aes-256-gcm", dek, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Overwrite DEK buffer immediately after use
  dek.fill(0);

  return Buffer.concat([iv, authTag, ciphertext]);
}

/**
 * Decrypt ciphertext produced by `encrypt()`.
 * Format: [iv (16) | authTag (16) | ciphertext].
 * Returns the plaintext string.
 */
export function decrypt(encrypted: Buffer, masterKey: Buffer): string {
  if (encrypted.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted data: too short");
  }

  const iv = encrypted.subarray(0, IV_LENGTH);
  const authTag = encrypted.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = encrypted.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const dek = deriveDek(masterKey);

  const decipher = createDecipheriv("aes-256-gcm", dek, iv);
  decipher.setAuthTag(authTag);

  const plaintextBuffer = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  // Overwrite DEK buffer immediately after use
  dek.fill(0);

  const plaintext = plaintextBuffer.toString("utf8");

  // Best-effort zero-fill of plaintext buffer
  plaintextBuffer.fill(0);

  return plaintext;
}
