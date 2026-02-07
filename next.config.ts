import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/offline", // Fallback page when offline
  },
  workboxOptions: {
    // Keep development mode until next-pwa/webpack terser early-exit issue is resolved in production mode.
    mode: "development",
    disableDevLogs: true,
    skipWaiting: false, // Don't auto-skip waiting - let user control updates
    clientsClaim: false,
    // Don't cache opaque responses (CORS errors)
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
          },
        },
      },
      {
        // Firebase API calls - network first with fallback
        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "firebase-api",
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
      {
        // Firebase Storage - prefer fresh images, fall back to cache when offline
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "firebase-storage",
          networkTimeoutSeconds: 5,
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          cacheableResponse: {
            statuses: [200],
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Silence Turbopack/webpack warning (PWA plugin requires webpack)
};

export default withPWA(nextConfig);
