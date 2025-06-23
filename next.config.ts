import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment only
  ...(process.env.NODE_ENV === 'production' && process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  
  // Disable source maps in development to avoid 404 errors
  productionBrowserSourceMaps: false,
  
  // Explicitly define environment variables for the client
  env: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    DEVELOP: process.env.DEVELOP,
  },
  
  // Configure port and hostname
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',  // Frontend port
        '0.0.0.0:3000',
        '37.114.41.124:3000',
        'localhost:3001',  // External API port
        '37.114.41.124:3001', // External API production
      ]
    }
  },
};

export default nextConfig;
