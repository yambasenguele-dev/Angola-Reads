import type { NextConfig } from "next";

// Host do Supabase (capas dos ebooks no Storage público). Lido do ambiente para
// também funcionar com domínio personalizado do Supabase.
function hostSupabase(): string | null {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
}

const hostPersonalizado = hostSupabase();

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  images: {
    // Só capas públicas do Storage do Supabase são otimizadas (nada de proxy aberto)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(hostPersonalizado && !hostPersonalizado.endsWith(".supabase.co")
        ? [
            {
              protocol: "https" as const,
              hostname: hostPersonalizado,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    formats: ["image/webp"],
    // Capas raramente mudam: 30 dias em cache evita reprocessar e acelera visitas repetidas
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Tamanhos pensados para telemóvel (capas pequenas) em vez dos 3840px por defeito
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [36, 56, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        // Logos e ícones estáticos: cache no browser e na CDN
        source: "/logos/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:ficheiro(icon-192.png|icon-512.png|icon-maskable-512.png|apple-touch-icon.png|favicon.ico|og-image.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
        
