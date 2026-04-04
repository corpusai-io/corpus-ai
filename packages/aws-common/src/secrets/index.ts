/**
 * AWS Secrets Manager loader
 *
 * In staging / production the container only needs:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SM_SECRET_NAME
 *
 * All other env vars are stored as a flat JSON object in the secret and are
 * injected into process.env at startup before any other module initialises.
 *
 * In development (NODE_ENV=development or no AWS_SM_SECRET_NAME set) this
 * is a no-op so local .env files keep working as-is.
 *
 * Usage — call once, very early in the entry point, before any imports that
 * read process.env:
 *
 *   import { loadSecretsManager } from '@corpusai/aws-common';
 *   await loadSecretsManager();          // resolves immediately in dev
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
  type GetSecretValueCommandOutput,
} from '@aws-sdk/client-secrets-manager';

let loaded = false;

/**
 * Fetches the secret named by AWS_SM_SECRET_NAME and merges all key/value
 * pairs into process.env.  Keys already present in process.env are NOT
 * overwritten so Docker/ECS environment variable overrides still work.
 */
export async function loadSecretsManager(): Promise<void> {
  if (loaded) return;

  const secretName = process.env.AWS_SM_SECRET_NAME;
  if (!secretName) {
    // Development mode — nothing to do.
    return;
  }

  const region = process.env.AWS_REGION || 'eu-north-1';

  const client = new SecretsManagerClient({ region });

  let response: GetSecretValueCommandOutput;
  try {
    response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName }),
    );
  } catch (err: any) {
    throw new Error(
      `[SecretsManager] Failed to fetch secret "${secretName}" in region "${region}": ${err.message}`,
    );
  }

  const raw = response.SecretString;
  if (!raw) {
    throw new Error(
      `[SecretsManager] Secret "${secretName}" has no SecretString value.`,
    );
  }

  let secrets: Record<string, string>;
  try {
    secrets = JSON.parse(raw);
  } catch {
    throw new Error(
      `[SecretsManager] Secret "${secretName}" is not valid JSON. Store secrets as a flat JSON object.`,
    );
  }

  let injected = 0;
  for (const [key, value] of Object.entries(secrets)) {
    // Never overwrite an explicit Docker / ECS env var.
    if (process.env[key] === undefined) {
      process.env[key] = String(value);
      injected++;
    }
  }

  console.log(
    `[SecretsManager] Loaded ${injected} secret(s) from "${secretName}" (${region})`,
  );
  loaded = true;
}
