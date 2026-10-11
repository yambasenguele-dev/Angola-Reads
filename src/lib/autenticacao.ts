// ============================================================
// Utilitários Gerais - AngolaReads
// Funções puras, seguras para usar no browser e no servidor.
// A autenticação em si (passwords, sessões, tokens) é agora
// inteiramente gerida pelo Supabase Auth — ver
// src/lib/supabase/* e src/lib/autenticacao-servidor.ts
// ============================================================

/** Formatar um valor monetário de acordo com a moeda. */
export function formatarPreco(valor: number, moeda: string = 'AOA'): string {
  if (moeda === 'USD') return `$${valor.toFixed(2)}`
  if (moeda === 'EUR') return `€${valor.toFixed(2)}`
  return `${valor.toLocaleString('pt-AO')} Kz`
}

/** Gerar referência única de pedido (ex: AR2602-A1B2C3). */
export function gerarReferenciaPedido(): string {
  const agora = new Date()
  const ano = agora.getFullYear().toString().slice(-2)
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0')
  const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AR${ano}${mes}-${aleatorio}`
}

/** Gerar código de referência de afiliado (ex: AR-9F3K2A). */
export function gerarCodigoAfiliado(): string {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = 'AR-'
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

/** Gerar um nome de ficheiro único preservando a extensão original. */
export function gerarNomeFicheiroUnico(nomeOriginal: string): string {
  const extensao = nomeOriginal.includes('.')
    ? nomeOriginal.substring(nomeOriginal.lastIndexOf('.')).toLowerCase()
    : ''
  const timestamp = Date.now()
  const aleatorio = Math.random().toString(36).substring(2, 10)
  return `${timestamp}_${aleatorio}${extensao}`
}
