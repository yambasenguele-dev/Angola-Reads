import type { Metadata } from 'next'
import AppShell from '@/componentes/angolareads/AppShell'
import JsonLd from '@/componentes/angolareads/JsonLd'
import { CatalogoIndexavel } from '@/componentes/angolareads/ConteudoIndexavel'
import { caminhoProduto } from '@/lib/rotas'
import { URL_SITE, NOME_SITE, DESCRICAO_SITE, obterProdutosPublicos } from '@/lib/seo'

// A home é um Server Component: o Google recebe metadata + JSON-LD já no HTML.
// A interface interactiva (catálogo, carrinho, etc.) é o AppShell (cliente).
// Regenerada de hora a hora: novos ebooks entram na lista de links sozinhos.
export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: 'AngolaReads | Loja de Ebooks em Angola — Compra e Descarrega' },
  description: DESCRICAO_SITE,
  alternates: { canonical: '/' },
}

const dadosEstruturados = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${URL_SITE}/#organizacao`,
    name: NOME_SITE,
    url: URL_SITE,
    logo: `${URL_SITE}/icon-512.png`,
    description: DESCRICAO_SITE,
    email: 'angolareads@gmail.com',
    areaServed: 'AO',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'angolareads@gmail.com',
        telephone: '+244947399578',
        availableLanguage: ['pt'],
        areaServed: 'AO',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${URL_SITE}/#website`,
    url: URL_SITE,
    name: NOME_SITE,
    description: DESCRICAO_SITE,
    inLanguage: 'pt-AO',
    publisher: { '@id': `${URL_SITE}/#organizacao` },
  },
]

export default async function PaginaInicial() {
  const produtos = await obterProdutosPublicos()

  // Lista de ebooks (schema.org ItemList) — liga a home a cada página de produto
  const listaDeEbooks =
    produtos.length > 0
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Ebooks disponíveis na AngolaReads',
            itemListOrder: 'https://schema.org/ItemListOrderDescending',
            numberOfItems: Math.min(produtos.length, 50),
            itemListElement: produtos.slice(0, 50).map((p, indice) => ({
              '@type': 'ListItem',
              position: indice + 1,
              url: `${URL_SITE}${caminhoProduto(p.id, p.titulo)}`,
              name: p.titulo,
            })),
          },
        ]
      : []

  return (
    <>
      <JsonLd dados={[...dadosEstruturados, ...listaDeEbooks]} />
      <AppShell vistaInicial="inicio" />
      <CatalogoIndexavel produtos={produtos} />
    </>
  )
}
