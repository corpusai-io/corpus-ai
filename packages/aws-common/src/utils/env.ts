export function env(envVarName: string, defaultValue?: string): string {
  if (process.env[envVarName] === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Env Var ${envVarName} is required in .env`);
  }

  return process.env[envVarName];
}
