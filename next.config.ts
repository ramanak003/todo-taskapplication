import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["prettier", "resend", "@react-email/render"],
};

export default nextConfig;
