import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Apply PWA plugin - disabled for now due to build issues
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: true, // Disabled PWA to resolve build issues
  publicExcludes: ["!icons/**/*"],
  fallbacks: {
    document: "/offline.html",
  },
  cacheOnFrontEndNav: true,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
    {
      urlPattern: /\.(js|css|woff2?)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
})(nextConfig);

export type { NextConfig };
