/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  experimental: {
    optimizePackageImports: ["@sapi/shared", "lucide-react"],
  },
};

module.exports = nextConfig;
