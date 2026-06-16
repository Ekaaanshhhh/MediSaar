import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // React Compiler currently causes a TurbopackInternalError on Vercel
  // reactCompiler: true,
};

export default nextConfig;
