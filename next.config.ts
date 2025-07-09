import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment only
  ...(process.env.NODE_ENV === 'production' && process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  
  // Disable source maps in development to avoid 404 errors
  productionBrowserSourceMaps: false,
  
  // Configure external image domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Explicitly define environment variables for the client
  env: {
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    DEVELOP: process.env.DEVELOP,
    NEXT_PUBLIC_DEVELOP: process.env.NEXT_PUBLIC_DEVELOP,
  },
  
  // Configure webpack to handle MongoDB optional dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore these server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'mongodb-client-encryption': false,
        'aws4': false,
        'gcp-metadata': false,
        'snappy': false,
        'socks': false,
        'kerberos': false,
        '@mongodb-js/zstd': false,
        '@aws-sdk/credential-providers': false,
      };
    }
    return config;
  },
  
  // Configure port and hostname
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',  // Frontend port
        '127.0.0.1:3000',
        '0.0.0.0:3000',
        'localhost:3001',  // Backend API port
        '127.0.0.1:3001',
      ]
    }
  },
};

export default nextConfig;
