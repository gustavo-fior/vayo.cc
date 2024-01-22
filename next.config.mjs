/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.mjs";


/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  // allow any hosts for now
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: ["raw.githubusercontent.com"],
    
  },
  experimental: {
    swcPlugins: [['@swc-jotai/react-refresh', {}]],
    outputFileTracingExcludes: {
      '/api/trpc/[trpc]': ['./node_modules/canvas/build/**/*'],
    },
  }
};

export default config;
