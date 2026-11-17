import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import AppShell from '@/componentes/angolareads/AppShell'
import JsonLd from '@/componentes/angolareads/JsonLd'
import { ProdutoIndexavel } from '@/componentes/angolareads/ConteudoIndexavel'
import { caminhoProduto, extrairIdProduto } from '@/lib/rotas'
import {
  NOME_SITE,
  URL_SITE,
  obterProdutoPublico,
  obterProdutosPublicos,
  resumirTexto,
  urlAbsoluto,
} from '@/lib/seo'

// Página rendida no servidor e regenerada de 10 em 10 minutos (ISR):
// o Google recebe title, description, Open Graph e JSON-LD de cada ebook.
export const revalidate = 600

type Props = { params: Promise<{ id: string }> }

// Sem pré-renderizar nada no build, mas permite guardar em cache (ISR) cada produto
// na primeira visita e regenerá-lo conforme o "revalidate" acima.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: parametro } = await params
  const id = extrairIdProduto(parametro)
  const produto = id ? await obterProdutoPublico(id) : null

  if (!produto) {
    return { title: 'Ebook não encontrado', robots: { index: false, follow: false } }
  }

  const caminho = caminhoProduto(produto.id, produto.titulo)
  const descricao = resumirTexto(produto.descricaoCurta || produto.descricao)
  const titulo = `${produto.titulo} – Comprar ebook`
  const imagens = produto.capaUrl
    ? [{ url: produto.capaUrl, alt: `Capa do ebook ${produto.titulo}` }]
    : [{ url: '/og-image.png', width: 1200, height: 630, alt: NOME_SITE }]

  return {
    title: titulo,
    description: descricao,
    keywords: [
      produto.titulo,
      `ebook ${produto.titulo}`,
      ...(produto.categoriaNome ? [`${produto.categoriaNome} angola`, produto.categoriaNome] : []),
      'comprar ebook em angola',
      'ebooks angola',
    ],
    alternates: { canonical: caminho },
    openGraph: {
      title: titulo,
      description: descricao,
      url: caminho,
      siteName: NOME_SITE,
      type: 'website',
      locale: 'pt_AO',
      images: imagens,
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descricao,
      images: imagens.map((i) => i.url),
    },
  }
}

export default async function PaginaDoProduto({ params }: Props) {
  const { id: parametro } = await params
  const id = extrairIdProduto(parametro)
  const produto = id ? await obterProdutoPublico(id) : null

  // Produto inexistente ou inactivo -> 404 real (o Google remove-o do índice)
  if (!produto) notFound()

  // Um único URL por produto: /produto/<slug>-<uuid>. Qualquer variação redirecciona (308).
  const caminho = caminhoProduto(produto.id, produto.titulo)
  if (decodeURIComponent(parametro) !== caminho.replace('/produto/', '')) {
    permanentRedirect(caminho)
  }

  const url = urlAbsoluto(caminho)
  const preco = produto.precoPromocional ?? produto.precoNormal
  const descricao = resumirTexto(produto.descricaoCurta || produto.descricao, 500)
  const validoAte = `${new Date().getFullYear() + 1}-12-31`

  // Outros ebooks (mesma categoria primeiro): links internos rastreáveis
  const outros = (await obterProdutosPublicos(30)).filter((p) => p.id !== produto.id)
  const relacionados = [
    ...outros.filter((p) => p.categoriaNome && p.categoriaNome === produto.categoriaNome),
    ...outros.filter((p) => !p.categoriaNome || p.categoriaNome !== produto.categoriaNome),
  ].slice(0, 8)

  const dadosEstruturados = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${url}#produto`,
      name: produto.titulo,
      description: descricao,
      sku: produto.id,
      url,
      image: produto.capaUrl ? [produto.capaUrl] : [`${URL_SITE}/og-image.png`],
      category: produto.categoriaNome || 'Ebooks',
      brand: { '@type': 'Brand', name: NOME_SITE },
      offers: {
        '@type': 'Offer',
        url,
        price: preco.toFixed(2),
        priceCurrency: 'AOA',
        priceValidUntil: validoAte,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        // Preço normal riscado quando há promoção
        ...(produto.precoPromocional != null && produto.precoPromocional < produto.precoNormal
          ? {
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: produto.precoNormal.toFixed(2),
                priceCurrency: 'AOA',
                priceType: 'https://schema.org/ListPrice',
              },
            }
          : {}),
        seller: { '@type': 'Organization', name: NOME_SITE, url: URL_SITE },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: URL_SITE },
        { '@type': 'ListItem', position: 2, name: produto.titulo, item: url },
      ],
    },
  ]

  return (
    <>
      <JsonLd dados={dadosEstruturados} />
      <AppShell vistaInicial="produto" />
      <ProdutoIndexavel produto={produto} relacionados={relacionados} />
    </>
  )
}
