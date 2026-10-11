// ============================================================
// Referência de afiliado (?ref=CODIGO) — persistência e links
// ============================================================
// A app é uma SPA sem router (ver src/lojas/navegacao.ts), por isso
// o `?ref=` da URL inicial fica acessível via window.location.search
// durante toda a sessão do separador. Para o código sobreviver a um
// refresh, fecho de separador, ou a chegar directamente ao checkout
// sem passar pela home, também o guardamos em localStorage.

const CHAVE_REF_AFILIADO = 'angolareads_ref_afiliado'

export function guardarRefAfiliado(codigo: string) {
  if (typeof window === 'undefined' || !codigo) return
  try {
    window.localStorage.setItem(CHAVE_REF_AFILIADO, codigo)
  } catch {
    // localStorage pode estar indisponível (modo privado, etc.) — sem problema
  }
}

export function obterRefAfiliadoGuardado(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(CHAVE_REF_AFILIADO)
  } catch {
    return null
  }
}

// Lê ?ref= da URL actual; se existir, guarda-o para uso posterior (ex: no
// checkout, mesmo que o utilizador navegue várias páginas dentro da SPA).
// Devolve o código encontrado na URL, ou null se não houver nenhum.
export function capturarRefDaQuery(): string | null {
  if (typeof window === 'undefined') return null
  const parametros = new URLSearchParams(window.location.search)
  const ref = parametros.get('ref')
  if (ref) {
    guardarRefAfiliado(ref)
    return ref
  }
  return null
}

// Código de afiliado a usar no checkout: preferimos o da URL actual (mais
// recente/explícito); se não houver, caímos para o último guardado.
export function obterCodigoAfiliadoActivo(): string {
  return capturarRefDaQuery() || obterRefAfiliadoGuardado() || ''
}

// Constrói o link de partilha de um produto específico, já com o código
// de afiliado embutido (formato usado pelo deep-link em src/app/page.tsx:
// ?vista=produto&id=PRODUTO_ID&ref=CODIGO).
export function construirLinkAfiliadoProduto(produtoId: string, codigoRef: string): string {
  const origem = typeof window !== 'undefined' ? window.location.origin : 'https://angolareads.vercel.app'
  return `${origem}/?vista=produto&id=${produtoId}&ref=${codigoRef}`
}
