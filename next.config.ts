import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // lib/skills/runner.ts reads *.skill (zip) files from a dynamically built
  // path at runtime — Next's output file tracing can't see that and drops
  // them from the serverless bundle, so every route that can reach a skill
  // (agent chat, onboarding, brand research, maturity scoring) needs them
  // listed explicitly. Confirmed missing in production: adm-zip threw
  // "Invalid filename" trying to read a .skill file that wasn't bundled.
  outputFileTracingIncludes: {
    '/api/**/*': ['./*.skill'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
