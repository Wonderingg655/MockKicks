import path from "node:path";
import type { NextConfig } from "next";

// Turbopack resolves modules relative to its workspace root. Use the directory
// that contains next.config.ts when available, otherwise fall back to cwd.
const projectRoot =
  typeof __dirname === "string" ? __dirname : path.resolve(process.cwd());

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
