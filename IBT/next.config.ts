import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // GitHub Pages only
  basePath: isGithubActions ? '/IBT' : '',

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },

  allowedDevOrigins: ['10.248.33.25', 'localhost:3000'],
};

export default nextConfig;