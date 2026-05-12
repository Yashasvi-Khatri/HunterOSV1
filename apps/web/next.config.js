/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  devIndicators: false,
  allowedDevOrigins: ['127.0.0.1'],
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
    OPENAI_API_KEY: process.env.OPENROUTER_API_KEY ?? "",
  },
};

module.exports = nextConfig;

// HunterOS — devIndicators disabled
