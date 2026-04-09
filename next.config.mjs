/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for Apollo Server in App Router
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
