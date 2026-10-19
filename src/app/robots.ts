import type { MetadataRoute } from 'next'
import { URL_SITE } from '@/lib/seo'

// ATENÇÃO: não bloquear /api/produtos nem /api/categorias — o Googlebot precisa
// delas para "ver" o catálogo quando renderiza o JavaScript da página.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // "/*?vista=" são ecrãs privados da SPA (carrinho, checkout, login...): sem valor para pesquisa.
        disallow: ['/api/admin/', '/api/auth/', '/api/pedidos', '/api/downloads', '/api/upload', '/*?vista='],
      },
    ],
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  }
}
