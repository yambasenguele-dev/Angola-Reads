// ============================================================
// SEO — dados e helpers de servidor (sitemap, metadata, JSON-LD)
// Usa o cliente Supabase "anon" SEM cookies: só lê o que a RLS
// já torna público (produtos activos). Nunca lança erro — se o
// Supabase falhar, devolve vazio e o site continua a funcionar.
// ============================================================
import { cache } from 'react'
import { createClient } from '@supabase/supabase-js'

// Aceita as duas variáveis (NEXT_PUBLIC_SITE_URL e a já documentada NEXT_PUBLIC_URL_SITE).
// Em produção ignora valores "localhost" para nunca publicar um sitemap/canonical errado.
function escolherUrlSite(): string {
  const candidatos = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_URL_SITE]
  for (const valor of candidatos) {
    if (!valor) continue
    if (process.env.NODE_ENV === 'production' && /localhost|127\.0\.0\.1/i.test(valor)) continue
    return valor.trim().replace(/\/+$/, '')
  }
  return 'https://angolareads.vercel.app'
}

export const URL_SITE = escolherUrlSite()
export const NOME_SITE = 'AngolaReads'
export const DESCRICAO_SITE =
  'Loja de ebooks digitais para angolanos: empreendedorismo, finanças pessoais, marketing digital e desenvolvimento pessoal. Paga por transferência bancária, Airtm ou PayPal e descarrega o teu ebook em PDF/EPUB.'

export interface ProdutoSeo {
  id: string
  titulo: string
  descricao: string
  descricaoCurta: string | null
  capaUrl: string | null
  precoNormal: number
  precoPromocional: number | null
  tipoProduto: string
  categoriaNome: string | null
  atualizadoEm: string
}

function clientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !chave) return null
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
}

const COLUNAS = `id, titulo, descricao, descricaoCurta:descricao_curta, capaUrl:capa_url,
  precoNormal:preco_normal, precoPromocional:preco_promocional, tipoProduto:tipo_produto,
  atualizadoEm:atualizado_em, categoria:categorias(nome)`

function normalizar(p: any): ProdutoSeo {
  const categoria = Array.isArray(p.categoria) ? p.categoria[0] : p.categoria
  return {
    id: p.id,
    titulo: p.titulo,
    descricao: p.descricao ?? '',
    descricaoCurta: p.descricaoCurta ?? null,
    capaUrl: p.capaUrl ?? null,
    precoNormal: Number(p.precoNormal),
    precoPromocional: p.precoPromocional != null ? Number(p.precoPromocional) : null,
    tipoProduto: p.tipoProduto ?? 'ebook',
    categoriaNome: categoria?.nome ?? null,
    atualizadoEm: p.atualizadoEm,
  }
}

/** Um produto ACTIVO (a RLS + filtro garantem que inactivos dão null). */
export const obterProdutoPublico = cache(async (id: string): Promise<ProdutoSeo | null> => {
  try {
    const supabase = clientePublico()
    if (!supabase) return null
    const { data, error } = await supabase
      .from('produtos')
      .select(COLUNAS)
      .eq('id', id)
      .eq('ativo', true)
      .maybeSingle()
    if (error || !data) return null
    return normalizar(data)
  } catch {
    return null
  }
})

/** TODOS os produtos activos (paginado, o Supabase devolve no máx. 1000 por pedido). */
export async function obterProdutosPublicos(limite?: number): Promise<ProdutoSeo[]> {
  try {
    const supabase = clientePublico()
    if (!supabase) return []
    const todos: ProdutoSeo[] = []
    const tamanhoPagina = 1000
    for (let desde = 0; desde < 20000; desde += tamanhoPagina) {
      const { data, error } = await supabase
        .from('produtos')
        .select(COLUNAS)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .range(desde, desde + tamanhoPagina - 1)
      if (error || !data) break
      todos.push(...data.map(normalizar))
      if (limite && todos.length >= limite) return todos.slice(0, limite)
      if (data.length < tamanhoPagina) break
    }
    return todos
  } catch {
    return []
  }
}

/** Texto limpo (sem markdown/HTML) cortado para meta description */
export function resumirTexto(texto: string, maximo = 155): string {
  const limpo = texto
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_`>\[\]()!~-]{1,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (limpo.length <= maximo) return limpo
  return limpo.slice(0, maximo - 1).replace(/\s+\S*$/, '') + '…'
}

export function urlAbsoluto(caminho: string): string {
  if (/^https?:\/\//i.test(caminho)) return caminho
  return `${URL_SITE}${caminho.startsWith('/') ? '' : '/'}${caminho}`
}
