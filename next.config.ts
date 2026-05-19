import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents:true,
  allowedDevOrigins: [
    "astrology-palace-proofread.ngrok-free.dev",
  ],
};

export default nextConfig;