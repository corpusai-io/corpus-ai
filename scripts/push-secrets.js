#!/usr/bin/env node
/**
 * push-secrets.js
 *
 * Reads a local .env file and creates or updates a secret in AWS Secrets Manager.
 * Run this once to seed staging/production secrets. After that, manage secrets
 * directly in the AWS console or via the AWS CLI.
 *
 * Usage:
 *   node scripts/push-secrets.js --env apps/backend/.env.development --secret corpus-ai/staging
 *   node scripts/push-secrets.js --env apps/backend/.env.production  --secret corpus-ai/production
 *
 * Prerequisites:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY must be set in
 *   the shell (or use an IAM role / AWS profile).
 *
 * Required IAM permissions:
 *   secretsmanager:CreateSecret
 *   secretsmanager:PutSecretValue
 *   secretsmanager:DescribeSecret
 */

const fs = require('fs');
const path = require('path');
const {
  SecretsManagerClient,
  CreateSecretCommand,
  PutSecretValueCommand,
  DescribeSecretCommand,
} = require('@aws-sdk/client-secrets-manager');

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const envFile  = get('--env')    || 'apps/backend/.env.development';
const secretId = get('--secret') || 'corpus-ai/staging';
const region   = process.env.AWS_REGION || 'eu-north-1';
const dryRun   = args.includes('--dry-run');

// ─── Parse .env file ─────────────────────────────────────────────────────────
function parseEnvFile(filePath) {
  const abs = path.resolve(filePath);
  if (!fs.existsSync(abs)) {
    console.error(`ERROR: File not found: ${abs}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(abs, 'utf-8').split('\n');
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;

    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();

    // Skip empty values — no point storing blanks
    if (!key || value === '') continue;

    // Strip surrounding quotes if present
    result[key] = value.replace(/^["']|["']$/g, '');
  }

  return result;
}

// ─── Keys that should NEVER be pushed (only needed for the Secrets Manager
//     call itself, not the running app) ────────────────────────────────────
const SKIP_KEYS = new Set([
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SM_SECRET_NAME',
  'DYNAMODB_ENDPOINT',      // local-only, must not exist in staging/prod
]);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n  Source : ${path.resolve(envFile)}`);
  console.log(`  Secret : ${secretId}`);
  console.log(`  Region : ${region}`);
  if (dryRun) console.log('  Mode   : DRY RUN (no changes will be made)\n');
  else        console.log('  Mode   : LIVE\n');

  const allVars = parseEnvFile(envFile);
  const payload = {};
  const skipped = [];

  for (const [k, v] of Object.entries(allVars)) {
    if (SKIP_KEYS.has(k)) {
      skipped.push(k);
    } else {
      payload[k] = v;
    }
  }

  console.log(`  Keys to push : ${Object.keys(payload).length}`);
  if (skipped.length) {
    console.log(`  Skipped      : ${skipped.join(', ')}`);
  }

  if (dryRun) {
    console.log('\n  Payload preview:\n');
    for (const [k, v] of Object.entries(payload)) {
      const display = v.length > 6 ? v.slice(0, 4) + '****' : '****';
      console.log(`    ${k}=${display}`);
    }
    console.log('\n  Dry run complete — nothing was written.\n');
    return;
  }

  const client = new SecretsManagerClient({ region });
  const secretString = JSON.stringify(payload, null, 2);

  // Check if secret already exists
  let exists = false;
  try {
    await client.send(new DescribeSecretCommand({ SecretId: secretId }));
    exists = true;
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') throw err;
  }

  if (exists) {
    console.log(`\n  Secret exists — updating value...`);
    await client.send(
      new PutSecretValueCommand({
        SecretId:     secretId,
        SecretString: secretString,
      }),
    );
    console.log(`  Updated: ${secretId}`);
  } else {
    console.log(`\n  Secret not found — creating...`);
    await client.send(
      new CreateSecretCommand({
        Name:         secretId,
        SecretString: secretString,
        Description:  `Corpus AI application secrets (${secretId})`,
        Tags: [
          { Key: 'Project',     Value: 'corpus-ai' },
          { Key: 'ManagedBy',   Value: 'push-secrets-script' },
        ],
      }),
    );
    console.log(`  Created: ${secretId}`);
  }

  console.log('\n  Done. Secret is ready for use by the application.\n');
  console.log('  IMPORTANT: The keys listed below were intentionally skipped.');
  console.log('  They must be provided as container environment variables,');
  console.log('  not stored in Secrets Manager:');
  console.log(`    AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY`);
  console.log(`    AWS_SM_SECRET_NAME=${secretId}\n`);
}

main().catch((err) => {
  console.error('\nFATAL:', err.message);
  process.exit(1);
});
