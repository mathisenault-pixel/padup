import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver Strict Mode en production pour éviter les doubles useEffect
  reactStrictMode: false,
};

export default nextConfig;
