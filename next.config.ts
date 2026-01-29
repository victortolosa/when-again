import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {}, // Silence Turbopack/webpack warning (PWA plugin requires webpack)
};

export default withPWA(nextConfig);
