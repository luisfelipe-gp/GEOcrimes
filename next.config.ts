import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   typescript: {
    ignoreBuildErrors: true, // ⛔️ Ignora errores de tipado en el build (incluido Vercel)
  },
  eslint: {
    ignoreDuringBuilds: true, // (opcional) Ignora errores de ESLint también
  },
};

export default nextConfig;
