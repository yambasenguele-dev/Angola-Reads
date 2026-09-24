// ============================================================
// Cliente Supabase — Lado do Servidor (Route Handlers)
// Lê/escreve a sessão através dos cookies do pedido HTTP.
// Usa a chave "anon" e respeita sempre as políticas de RLS.
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function criarClienteServidor() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesParaDefinir) {
          try {
            cookiesParaDefinir.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Chamado a partir de um Server Component sem permissão de
            // escrita — pode ser ignorado se houver middleware a atualizar
            // as sessões.
          }
        },
      },
    }
  )
}
