// ============================================================
// Autenticação no Servidor — AngolaReads
// Helpers usados dentro das rotas de API (src/app/api/**) para
// saber quem é o utilizador autenticado (via cookies de sessão
// do Supabase Auth) e se é administrador.
// ============================================================
import type { SupabaseClient } from '@supabase/supabase-js'

export interface PerfilAutenticado {
  id: string
  email: string
  nomeCompleto: string
  telefone: string | null
  isAdmin: boolean
  ativo: boolean
}

/**
 * Obtém o utilizador autenticado (a partir da sessão em cookies)
 * e o respetivo perfil na tabela `perfis`.
 * Devolve `null` se não houver sessão válida ou o perfil não existir.
 */
export async function obterPerfilAtual(
  supabase: SupabaseClient
): Promise<PerfilAutenticado | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil, error } = await supabase
    .from('perfis')
    .select(
      'id, email, nomeCompleto:nome_completo, telefone, isAdmin:is_admin, ativo'
    )
    .eq('id', user.id)
    .single()

  if (error || !perfil) return null

  return perfil as unknown as PerfilAutenticado
}

/**
 * Exige que exista um utilizador autenticado. Devolve o perfil,
 * ou `null` caso não esteja autenticado (o chamador deve responder
 * com 401).
 */
export async function exigirUtilizador(
  supabase: SupabaseClient
): Promise<PerfilAutenticado | null> {
  const perfil = await obterPerfilAtual(supabase)
  if (!perfil || !perfil.ativo) return null
  return perfil
}

/**
 * Exige que o utilizador autenticado seja administrador. Devolve
 * o perfil, ou `null` caso contrário (o chamador deve responder
 * com 401/403).
 */
export async function exigirAdmin(
  supabase: SupabaseClient
): Promise<PerfilAutenticado | null> {
  const perfil = await obterPerfilAtual(supabase)
  if (!perfil || !perfil.ativo || !perfil.isAdmin) return null
  return perfil
}
