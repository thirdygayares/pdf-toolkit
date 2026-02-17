import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    },
};

export default nextConfig;
