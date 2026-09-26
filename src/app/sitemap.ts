import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://angolareads.vercel.app'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    // Se no futuro tiveres URLs fixas de produto/páginas, adiciona aqui
  ]
}