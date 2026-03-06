import type { NextConfig } from "next";

// Determine if we should use standalone mode
const shouldUseStandalone = () => {
  if (process.platform === 'win32') return false;
  if (process.env.DISABLE_STANDALONE === 'true') return false;
  if (process.env.NODE_ENV === 'production') return true;
  return false;
};

const nextConfig: NextConfig = {
  // FORCE basePath for proxy routing
  basePath: '/docs',
  assetPrefix: '/docs', 
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