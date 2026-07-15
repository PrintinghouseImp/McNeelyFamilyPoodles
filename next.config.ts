import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photo uploads via Server Actions (camera/gallery) can exceed the 1MB default
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    // When using next/image; plain <img> already works with absolute R2 URLs
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.mcneelyfamilypoodles.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
