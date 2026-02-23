import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    typescript: {
        ignoreBuildErrors: true,
    },
    env: {
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    },
    webpack: (config) => {
        config.resolve = config.resolve ?? {};
        config.resolve.alias = {
            ...(config.resolve.alias ?? {}),
            canvas: false,
        };
        return config;
    },
    turbopack: {
        resolveAlias: {
            canvas: "./src/shims/canvas.ts",
        },
    },
};

export default nextConfig;
