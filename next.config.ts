import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Генератор PDF читает эти шрифты с диска во время запроса. Их никто не
  // импортирует, поэтому трассировка файлов не увидит зависимость и роуты
  // уедут в деплой без шрифтов — вся кириллица превратится в мусор.
  outputFileTracingIncludes: {
    "/api/webhook": ["./public/fonts/**"],
    "/api/generate-pdf": ["./public/fonts/**"],
  },

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
