import type { NextConfig } from "next";

// Determine if we should use standalone mode
const shouldUseStandalone = () => {
  if (process.platform === 'win32') return false;
  if (process.env.DISABLE_STANDALONE === 'true') return false;
  if (process.env.VERCEL) return false;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
};

// On Vercel/Railway each app has its own subdomain, so the dashboard serves
// at root (no basePath) — this is the default. The docker/nginx single-origin
// setup routes by path prefix, so it sets NEXT_PUBLIC_BASE_PATH=/dashboard.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const basePath = rawBasePath === '' ? undefined : rawBasePath;

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  output: shouldUseStandalone() ? 'standalone' : undefined,
};

export default nextConfig;