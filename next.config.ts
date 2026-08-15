import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Апекс → www: канонический хост один, чтобы не плодить дубли в выдаче.
      // Значение host матчится как ^...$, поэтому сам www сюда не попадает.
      {
        source: "/:path*",
        has: [{ type: "host", value: "psikhotip\\.online" }],
        destination: "https://www.psikhotip.online/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
