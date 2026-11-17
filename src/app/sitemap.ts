import type { MetadataRoute } from 'next'
import { caminhoProduto, CAMINHOS_PUBLICOS } from '@/lib/rotas'
import { URL_SITE, obterProdutosPublicos } from '@/lib/seo'

// Regenerado de hora a hora: novos produtos entram sozinhos e produtos
// desactivados saem. Só inclui URLs reais e indexáveis (nunca ?vista=...).
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const produtos = await obterProdutosPublicos()

  const ultimaAlteracao = produtos.length
    ? new Date(Math.max(...produtos.map((p) => new Date(p.atualizadoEm).getTime())))
    : undefined

  const paginasEstaticas: MetadataRoute.Sitemap = [
    { url: `${URL_SITE}/`, lastModified: ultimaAlteracao, changeFrequency: 'daily', priority: 1 },
    ...(['sobre', 'suporte', 'faq', 'termos', 'privacidade'] as const).map((vista) => ({
      url: `${URL_SITE}${CAMINHOS_PUBLICOS[vista]}`,
      changeFrequency: 'monthly' as const,
      priority: vista === 'termos' || vista === 'privacidade' ? 0.3 : 0.6,
    })),
  ]

  const paginasProdutos: MetadataRoute.Sitemap = produtos.map((produto) => ({
    url: `${URL_SITE}${caminhoProduto(produto.id, produto.titulo)}`,
    lastModified: new Date(produto.atualizadoEm),
    changeFrequency: 'weekly',
    priority: 0.8,
    ...(produto.capaUrl ? { images: [produto.capaUrl] } : {}),
  }))

  return [...paginasEstaticas, ...paginasProdutos]
}
