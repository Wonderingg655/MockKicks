import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project. Without it, Next.js infers
  // the root from lockfiles and can pick the wrong directory when the app is
  // nested inside another folder.
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
