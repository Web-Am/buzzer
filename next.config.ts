import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignora gli errori ESLint durante la build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
