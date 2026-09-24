import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'

// GET /api/auth/perfil - Obter perfil do utilizador atual (via cookie de sessão)
export async function GET() {
  try {
    const supabase = await criarClienteServidor()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data: perfil, error } = await supabase
      .from('perfis')
      .select(
        `id, email, nomeCompleto:nome_completo, telefone, isAdmin:is_admin,
         ativo, criadoEm:criado_em,
         afiliado:afiliados(id, codigoRef:codigo_ref, saldo, totalGanho:total_ganho, ativo)`
      )
      .eq('id', user.id)
      .single()

    if (error || !perfil || !perfil.ativo) {
      return NextResponse.json(
        { erro: 'Perfil não encontrado ou desativado' },
        { status: 404 }
      )
    }

    // afiliado vem como array (relação 1:1 mapeada pelo PostgREST) — normalizar
    const perfilNormalizado = {
      ...perfil,
      afiliado: Array.isArray(perfil.afiliado) ? perfil.afiliado[0] ?? null : perfil.afiliado,
    }

    return NextResponse.json({ utilizador: perfilNormalizado })
  } catch (erro) {
    console.error('Erro ao obter perfil:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
