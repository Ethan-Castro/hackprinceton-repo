import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

// Apply PWA plugin - disabled for now due to build issues
// Using dynamic import to avoid type issues
let pwaConfig = nextConfig;

if (process.env.NODE_ENV !== 'production') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const withPWA = require("next-pwa")({
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
    });
    pwaConfig = withPWA(nextConfig);
  } catch (error) {
    // If next-pwa fails to load, just use base config
    console.warn('Failed to load next-pwa, using base config:', error);
  }
}

export default pwaConfig;

export type { NextConfig };
