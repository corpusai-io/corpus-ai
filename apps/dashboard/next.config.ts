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
  output: shouldUseStandalone() ? 'standalone' : undefined,
  // Optional: Add other config options
  // reactStrictMode: true,
  // swcMinify: true,
};

export default nextConfig;