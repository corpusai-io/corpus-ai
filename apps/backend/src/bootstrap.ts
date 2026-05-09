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
 *
 * IMPORTANT — DO NOT add static imports of `@corpusai/aws-common` here
 * other than `loadSecretsManager` itself. Several Dynamoose models in
 * that package (UserModel, ChatbotModel, etc.) call `env('AWS_DYNAMO_*_TABLE')`
 * at module-load time, which throws if the env var is undefined. The
 * dynamic import of `./index` below MUST run AFTER loadSecretsManager()
 * has populated process.env.
 */
// Import via the deep path so we don't eagerly pull in the rest of aws-common.
// Going through the package main would load all Dynamoose models, which call
// env('AWS_DYNAMO_*_TABLE') at module-load time and would throw before
// loadSecretsManager() has had a chance to populate process.env.
import { loadSecretsManager } from '@corpusai/aws-common/dist/secrets';

const REQUIRED_ENV_AFTER_SECRETS = [
  'AWS_DYNAMO_USER_TABLE',
  'AWS_DYNAMO_CHATBOT_TABLE',
  'S3_BUCKET_NAME',
];

async function bootstrap() {
  try {
    await loadSecretsManager();
  } catch (err) {
    console.error('[bootstrap] Secrets Manager failed:', err);
    process.exit(1);
  }

  // Sanity check — surface a clear error if something the Dynamoose models
  // need at module-load time is missing, instead of letting the dynamic
  // import below throw a less-helpful "Env Var X is required" stack.
  const missing = REQUIRED_ENV_AFTER_SECRETS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(
      `[bootstrap] Missing required env vars after Secrets Manager load: ${missing.join(', ')}`,
    );
    console.error(
      '[bootstrap] Check that AWS_SM_SECRET_NAME points to a secret containing these keys, ' +
        'or set them directly in .env for local dev.',
    );
    process.exit(1);
  }

  // Dynamic import ensures index.ts (and the @corpusai/aws-common Dynamoose
  // models it transitively imports) runs AFTER secrets are in process.env.
  await import('./index');
}

bootstrap();
