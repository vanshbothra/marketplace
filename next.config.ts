import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  /* allow images from any domain */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
