import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project so nested folders and
  // lockfiles higher up the tree cannot confuse module resolution.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
