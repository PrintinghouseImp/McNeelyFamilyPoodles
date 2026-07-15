import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo uploads via Server Actions (camera/gallery) can exceed the 1MB default
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
