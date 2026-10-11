import { redirect } from 'next/navigation'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { obterPerfilAtual } from '@/lib/autenticacao-servidor'

// Área /admin — completamente separada da loja (SPA em "/").
// Sem catálogo, carrinho ou "tornar-me afiliado": apenas gestão.
// A verificação de acesso é feita aqui, no servidor, antes de
// qualquer conteúdo ser enviado ao browser.
export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const supabase = await criarClienteServidor()
  const perfil = await obterPerfilAtual(supabase)

  if (!perfil) {
    redirect('/')
  }

  if (!perfil.isAdmin) {
    redirect('/')
  }

  return <div className="min-h-screen bg-gray-50/50">{children}</div>
}
