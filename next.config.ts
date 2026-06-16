import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  experimental: {
    optimizePackageImports: ['@anthropic-ai/sdk'],
  },
};

export default nextConfig;
