import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN-hosted development previews to load Next.js dev resources
  // when testing from a phone/tablet on the same trusted Wi-Fi network.
  allowedDevOrigins: ["172.16.41.146", "localhost", "127.0.0.1"],
};

export default nextConfig;
