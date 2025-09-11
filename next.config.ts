import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ This must be at the top level, not inside `experimental`
  allowedDevOrigins: ["http://192.168.1.4:3000"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.tiara.run",
        port: "",
        pathname: "/public/**",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/7.x/**",
      },
      {
        protocol: "https",
        hostname: "robohash.org",
        port: "",
        pathname: "/**",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
