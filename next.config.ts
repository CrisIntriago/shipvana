import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Pitch build: unfinished screens send visitors to the Inventory.
  async redirects() {
    return ['/scenarios', '/alerts', '/inbox', '/advisor', '/events'].map((source) => ({ source, destination: "/fleet", permanent: false }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
