// ============================================================
// Utilitários de Autenticação - AngolaReads
// ============================================================

import crypto from 'crypto'

/** Gerar hash SHA-256 para senhas */
export function gerarHashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex')
}

/** Verificar senha contra hash */
export function verificarSenha(senha: string, hash: string): boolean {
  return gerarHashSenha(senha) === hash
}

/** Gerar token de sessão simples */
export function gerarTokenSessao(): string {
  return crypto.randomBytes(32).toString('hex')
}

/** Gerar código de referência de afiliado */
export function gerarCodigoAfiliado(): string {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = 'AR-'
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length))
  }
  return codigo
}

/** Gerar referência única de pedido */
export function gerarReferenciaPedido(): string {
  const agora = new Date()
  const ano = agora.getFullYear().toString().slice(-2)
  const mes = (agora.getMonth() + 1).toString().padStart(2, '0')
  const aleatorio = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `AR${ano}${mes}-${aleatorio}`
}

/** Extrair token do cabeçalho Authorization */
export function extrairTokenRequisicao(requisicao: Request): string | null {
  const authHeader = requisicao.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.replace('Bearer ', '')
}
