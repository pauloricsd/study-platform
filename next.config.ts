import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
