// ============================================================
// Middleware — Atualiza a sessão Supabase em cada pedido
// ============================================================
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(requisicao: NextRequest) {
  // Visitantes sem sessão (incluindo o Googlebot) não têm nada para renovar:
  // evitar a chamada de rede ao Supabase acelera muito a resposta (TTFB).
  const temSessao = requisicao.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
  if (!temSessao) {
    return NextResponse.next({ request: requisicao })
  }

  let resposta = NextResponse.next({
    request: requisicao,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requisicao.cookies.getAll()
        },
        setAll(cookiesParaDefinir) {
          cookiesParaDefinir.forEach(({ name, value }) =>
            requisicao.cookies.set(name, value)
          )
          resposta = NextResponse.next({ request: requisicao })
          cookiesParaDefinir.forEach(({ name, value, options }) =>
            resposta.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Isto força a renovação do token de sessão, se necessário.
  await supabase.auth.getUser()

  return resposta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
