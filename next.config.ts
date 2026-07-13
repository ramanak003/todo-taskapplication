import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubActions ? "/todo-taskapplication" : "",
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["prettier", "resend", "@react-email/render"],
};

export default nextConfig;
