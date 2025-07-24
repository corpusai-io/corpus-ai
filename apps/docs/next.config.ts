import type { NextConfig } from "next";

// Determine if we should use standalone mode
const shouldUseStandalone = () => {
  // Disable on Windows
  if (process.platform === 'win32') return false;
  
  // Disable if explicitly set
  if (process.env.DISABLE_STANDALONE === 'true') return false;
  
  // Enable for production builds (Railway sets NODE_ENV=production)
  if (process.env.NODE_ENV === 'production') return true;
  
  // Disable for local development
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