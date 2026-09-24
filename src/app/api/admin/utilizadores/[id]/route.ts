import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

type DadosAtualizarUtilizador = {
  isAdmin?: boolean
  ativo?: boolean
}

// PATCH /api/admin/utilizadores/[id] - Alternar admin/ativo de um utilizador (admin)
export async function PATCH(
  requisicao: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const { id } = await params
    const corpo = (await requisicao.json()) as DadosAtualizarUtilizador

    // Evita que um admin se auto-remova o estatuto de administrador
    // ou se desactive por engano, o que poderia trancar o acesso ao painel.
    if (id === admin.id) {
      if (corpo.isAdmin === false || corpo.ativo === false) {
        return NextResponse.json(
          { erro: 'Não podes remover o teu próprio acesso de administrador.' },
          { status: 400 }
        )
      }
    }

    const dadosAtualizacao: Record<string, unknown> = {}
    if (corpo.isAdmin !== undefined) dadosAtualizacao.is_admin = corpo.isAdmin
    if (corpo.ativo !== undefined) dadosAtualizacao.ativo = corpo.ativo

    const { data: utilizador, error } = await supabase
      .from('perfis')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select(
        `id, email, nomeCompleto:nome_completo, telefone, isAdmin:is_admin, ativo, criadoEm:criado_em`
      )
      .single()

    if (error) throw error

    return NextResponse.json({ utilizador })
  } catch (erro) {
    console.error('Erro ao atualizar utilizador (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
