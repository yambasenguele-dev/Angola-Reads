import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'
import { processarAprovacaoPedido, SELECAO_PEDIDO, normalizarPedido, notificarEstadoPedido } from '../route'

const ESTADOS_VALIDOS = ['pendente', 'pago', 'rejeitado', 'cancelado']

type DadosAtualizarPedido = {
  estado?: string
  observacoes?: string
}

// PATCH /api/admin/pedidos/[id] - Atualizar estado do pedido
// Ao aprovar (pago) pela primeira vez: liberta downloads, soma vendas e comissões.
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
    const corpo = (await requisicao.json()) as DadosAtualizarPedido

    if (corpo.estado && !ESTADOS_VALIDOS.includes(corpo.estado)) {
      return NextResponse.json(
        { erro: `Estado inválido. Opções: ${ESTADOS_VALIDOS.join(', ')}` },
        { status: 400 }
      )
    }

    const { data: pedidoExistente, error: erroBusca } = await supabase
      .from('pedidos')
      .select(
        `id, estado, perfilId:perfil_id, afiliadoId:afiliado_id,
         itens:itens_pedido(id, produtoId:produto_id, preco, formato),
         comprovativo:comprovativos(id)`
      )
      .eq('id', id)
      .single()

    if (erroBusca || !pedidoExistente) {
      return NextResponse.json({ erro: 'Pedido não encontrado' }, { status: 404 })
    }

    if (corpo.estado === 'pago' && pedidoExistente.estado !== 'pago') {
      await processarAprovacaoPedido(supabase, pedidoExistente as any)

      const comprovativo = Array.isArray(pedidoExistente.comprovativo)
        ? pedidoExistente.comprovativo[0]
        : pedidoExistente.comprovativo
      if (comprovativo) {
        await supabase.from('comprovativos').update({ estado: 'aprovado' }).eq('id', comprovativo.id)
      }
    }

    const dadosAtualizacao: Record<string, unknown> = {}
    if (corpo.estado) dadosAtualizacao.estado = corpo.estado
    if (corpo.observacoes !== undefined) dadosAtualizacao.observacoes = corpo.observacoes

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select(SELECAO_PEDIDO)
      .single()

    if (error) throw error

    if (corpo.estado === 'pago' || corpo.estado === 'rejeitado') {
      if (pedidoExistente.estado !== corpo.estado) {
        await notificarEstadoPedido(supabase, id, corpo.estado, corpo.observacoes)
      }
    }

    return NextResponse.json({ pedido: normalizarPedido(pedido) })
  } catch (erro) {
    console.error('Erro ao atualizar pedido (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
