import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables the `use cache` directive, `cacheLife`, and `cacheTag`.
  cacheComponents: true,
  cacheLife: {
    // Custom profile: fast enough to visibly change during a live demo.
    demoQuick: {
      stale: 5, // seconds - client can reuse without checking server
      revalidate: 10, // seconds - server regenerates in the background
      expire: 30, // seconds - hard expiry, forces synchronous refresh
    },
  },
};

export default nextConfig;
