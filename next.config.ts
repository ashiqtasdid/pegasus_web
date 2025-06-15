import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Configure port and hostname
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3001', '0.0.0.0:3001']
    }
  }
};

export default nextConfig;
