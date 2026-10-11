// ============================================================
// Cliente Supabase — Lado do Browser
// Usa @supabase/ssr para guardar a sessão em cookies, para que
// as rotas de API (servidor) consigam ler a mesma sessão.
// ============================================================
import { createBrowserClient } from '@supabase/ssr'

export function criarClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
