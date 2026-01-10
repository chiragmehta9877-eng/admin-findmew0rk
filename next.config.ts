import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Sab jagah se image allow kar rahe hain
      },
    ],
  },
};

export default nextConfig;