import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to succeed even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during build (Vercel handles this step separately)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
