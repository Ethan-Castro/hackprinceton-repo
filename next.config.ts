import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["recharts"],
  // Turbopack is default in Next 16; keeping an explicit empty config signals we don't rely on custom webpack.
  turbopack: {},
  // Optimize build performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
      "lucide-react",
      "recharts",
    ],
  },
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
