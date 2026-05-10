import type { NextConfig } from "next";

// Determine if we should use standalone mode
const shouldUseStandalone = () => {
  if (process.platform === 'win32') return false;
  if (process.env.DISABLE_STANDALONE === 'true') return false;
  if (process.env.VERCEL) return false;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
};

// In docker/local-proxy deploys, the dashboard is served under /dashboard so
// nginx can route by path prefix. On Vercel/Railway each app has its own
// subdomain, so basePath must be empty. NEXT_PUBLIC_BASE_PATH=""  on Vercel.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/dashboard';
const basePath = rawBasePath === '' ? undefined : rawBasePath;

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  output: shouldUseStandalone() ? 'standalone' : undefined,
};

export default nextConfig;