// ============================================================
// Rotas e URLs — AngolaReads
// Funções PURAS (sem dependências de servidor), usadas tanto no
// browser (navegação SPA) como no servidor (sitemap, metadata).
// ============================================================

export type VistaRota =
  | 'inicio'
  | 'produto'
  | 'carrinho'
  | 'checkout'
  | 'os-meus-ebooks'
  | 'login'
  | 'registo'
  | 'recuperar-senha'
  | 'afiliado'
  | 'publisher'
  | 'sobre'
  | 'termos'
  | 'privacidade'
  | 'suporte'
  | 'faq'

// Páginas com URL própria e indexável
export const CAMINHOS_PUBLICOS: Partial<Record<VistaRota, string>> = {
  inicio: '/',
  sobre: '/sobre',
  suporte: '/suporte',
  termos: '/termos',
  privacidade: '/privacidade',
  faq: '/faq',
}

const REGEX_UUID = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

/** "Finanças Pessoais p/ Angolanos!" -> "financas-pessoais-p-angolanos" */
export function criarSlug(texto: string, maximo = 60): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maximo)
    .replace(/-+$/g, '')
}

/** URL canónica de um produto: /produto/titulo-do-ebook-<uuid> (o UUID garante estabilidade) */
export function caminhoProduto(id: string, titulo?: string | null): string {
  const slug = titulo ? criarSlug(titulo) : ''
  return slug ? `/produto/${slug}-${id}` : `/produto/${id}`
}

/** Extrai o UUID do fim do parâmetro da rota (aceita só o UUID ou slug-uuid) */
export function extrairIdProduto(parametro: string): string | null {
  const resultado = REGEX_UUID.exec(decodeURIComponent(parametro))
  return resultado ? resultado[1].toLowerCase() : null
}

/** Caminho (path + query) correspondente a uma vista da SPA */
export function caminhoDaVista(vista: VistaRota, id?: string | null): string {
  if (vista === 'produto' && id) return `/produto/${id}`
  const publico = CAMINHOS_PUBLICOS[vista]
  if (publico) return publico
  // Vistas privadas (carrinho, checkout, login...) — deep-link existente
  return `/?vista=${vista}`
}

const VISTAS_VALIDAS: VistaRota[] = [
  'inicio', 'produto', 'carrinho', 'checkout', 'os-meus-ebooks', 'login', 'registo',
  'recuperar-senha', 'afiliado', 'publisher', 'sobre', 'termos', 'privacidade', 'suporte', 'faq',
]

/** Inverso de caminhoDaVista: interpreta o URL actual do browser */
export function vistaDoCaminho(
  pathname: string,
  search: string
): { vista: VistaRota; id: string | null } {
  const partes = pathname.replace(/\/+$/, '') || '/'

  if (partes.startsWith('/produto/')) {
    const id = extrairIdProduto(partes.slice('/produto/'.length))
    if (id) return { vista: 'produto', id }
  }

  for (const [vista, caminho] of Object.entries(CAMINHOS_PUBLICOS)) {
    if (caminho !== '/' && caminho === partes) return { vista: vista as VistaRota, id: null }
  }

  if (partes === '/') {
    const parametros = new URLSearchParams(search)
    const vista = parametros.get('vista') as VistaRota | null
    if (vista && VISTAS_VALIDAS.includes(vista)) {
      return { vista, id: parametros.get('id') }
    }
  }

  return { vista: 'inicio', id: null }
}

// Título de cada vista (usado em document.title na navegação SPA)
export const TITULOS_VISTA: Partial<Record<VistaRota, string>> = {
  carrinho: 'O meu carrinho',
  checkout: 'Finalizar compra',
  'os-meus-ebooks': 'Os meus ebooks',
  login: 'Entrar na conta',
  registo: 'Criar conta',
  'recuperar-senha': 'Recuperar palavra-passe',
  afiliado: 'Programa de Afiliados',
  publisher: 'Painel do Publisher',
  sobre: 'Sobre nós',
  termos: 'Termos e Condições',
  privacidade: 'Política de Privacidade',
  suporte: 'Suporte e Ajuda',
  faq: 'Perguntas Frequentes',
}
