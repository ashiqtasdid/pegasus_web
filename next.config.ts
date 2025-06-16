import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment (disabled for development)
  // output: 'standalone',
  
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
        'localhost:3000', 
        '0.0.0.0:3000',
        '37.114.41.124:3000',
        'localhost:3001',
        '37.114.41.124:3001', // Allow requests to external API
      ]
    }
  },
  
  // Add headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://37.114.41.124:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie, X-Requested-With'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
