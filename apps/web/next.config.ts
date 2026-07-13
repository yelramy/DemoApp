import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@bridge/db", "@bridge/pricing", "@bridge/parsers"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
