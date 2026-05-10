import type { NextConfig } from "next";

// Determine if we should use standalone mode
const shouldUseStandalone = () => {
  if (process.platform === 'win32') return false;
  if (process.env.DISABLE_STANDALONE === 'true') return false;
  if (process.env.VERCEL) return false;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
};

// On Vercel each app has its own subdomain so basePath is empty (default).
// The docker/nginx setup routes by path prefix, so it sets NEXT_PUBLIC_BASE_PATH=/docs.
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const basePath = rawBasePath === '' ? undefined : rawBasePath;

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,

  output: shouldUseStandalone() ? 'standalone' : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;