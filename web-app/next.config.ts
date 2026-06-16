import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler currently causes a TurbopackInternalError on Vercel
  // reactCompiler: true,
  output: "standalone",
};

export default nextConfig;
