// ============================================================
// Cliente Supabase — Service Role (uso interno do servidor)
// ATENÇÃO: este cliente ignora todas as políticas de RLS.
// Nunca importar este ficheiro em código que corre no browser.
// Usado apenas para: gerar URLs assinadas de download, e
// operações administrativas que o próprio admin (autenticado e
// validado) já teve autorização para fazer.
// ============================================================
import { createClient } from '@supabase/supabase-js'

export function criarClienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chaveServico = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !chaveServico) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL não configurados no .env'
    )
  }

  return createClient(url, chaveServico, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
