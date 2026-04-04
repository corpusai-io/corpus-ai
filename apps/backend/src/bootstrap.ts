/**
 * bootstrap.ts — entry point for staging / production.
 *
 * Loads secrets from AWS Secrets Manager BEFORE any other module runs,
 * then dynamically imports the main app so all process.env reads see
 * the injected values.
 *
 * In development (NODE_ENV=development or AWS_SM_SECRET_NAME not set)
 * loadSecretsManager() is a no-op and this behaves identically to
 * starting index.ts directly.
 */
import { loadSecretsManager } from '@corpusai/aws-common';

async function bootstrap() {
  try {
    await loadSecretsManager();
  } catch (err) {
    console.error('[bootstrap] Secrets Manager failed:', err);
    process.exit(1);
  }

  // Dynamic import ensures index.ts runs AFTER secrets are in process.env
  await import('./index');
}

bootstrap();
