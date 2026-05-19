import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { env } from "./env.js";

let cachedMasterKey: string | null = null;

/**
 * Fetch MASTER_ENCRYPTION_KEY from Azure Key Vault.
 * Cached for the lifetime of the process (no per-request KV calls).
 * Falls back to null when AZURE_KEY_VAULT_URL is not configured (local dev).
 */
export async function fetchMasterEncryptionKey(): Promise<string | null> {
  if (!env.AZURE_KEY_VAULT_URL) {
    return null;
  }

  if (cachedMasterKey) {
    return cachedMasterKey;
  }

  const credential = new DefaultAzureCredential();
  const client = new SecretClient(env.AZURE_KEY_VAULT_URL, credential);
  const secret = await client.getSecret("MASTER_ENCRYPTION_KEY");

  if (secret.value) {
    cachedMasterKey = secret.value;
  }

  return cachedMasterKey;
}
