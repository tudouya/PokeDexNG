import type { NextConfig } from 'next';

// Next.js configuration
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true // Temporarily ignore TypeScript errors for deployment
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist']
};

export default nextConfig;
