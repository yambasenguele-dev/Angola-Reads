import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'
import { enviarEmail } from '@/lib/email/enviar'
import { modeloSaqueAprovado, modeloSaqueRejeitado } from '@/lib/email/modelos'

type DadosAtualizarSaque = {
  estado: 'pago' | 'rejeitado'
  observacoesAdmin?: string
}

// PATCH /api/admin/saques/[id] - Aprovar (marcar como pago) ou rejeitar um pedido de saque
// Ao rejeitar, o valor reservado é devolvido ao saldo do afiliado.
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
    const corpo = (await requisicao.json()) as DadosAtualizarSaque

    if (!corpo.estado || !['pago', 'rejeitado'].includes(corpo.estado)) {
      return NextResponse.json(
        { erro: 'Estado inválido. Use "pago" ou "rejeitado".' },
        { status: 400 }
      )
    }

    const { data: saque, error: erroBusca } = await supabase
      .from('pedidos_saque')
      .select(
        `id, valor, estado, afiliadoId:afiliado_id,
         afiliado:afiliados(id, saldo, perfil:perfis(nomeCompleto:nome_completo, email))`
      )
      .eq('id', id)
      .single()

    if (erroBusca || !saque) {
      return NextResponse.json({ erro: 'Pedido de saque não encontrado' }, { status: 404 })
    }

    if (saque.estado !== 'pendente') {
      return NextResponse.json(
        { erro: `Este pedido já foi ${saque.estado}` },
        { status: 400 }
      )
    }

    const afiliado = Array.isArray(saque.afiliado) ? saque.afiliado[0] : saque.afiliado
    const perfilAfiliado = afiliado ? (Array.isArray(afiliado.perfil) ? afiliado.perfil[0] : afiliado.perfil) : null

    if (corpo.estado === 'rejeitado' && afiliado) {
      // Devolve o valor reservado ao saldo do afiliado
      await supabase
        .from('afiliados')
        .update({ saldo: Number(afiliado.saldo) + Number(saque.valor) })
        .eq('id', afiliado.id)
    }

    const { data: saqueAtualizado, error } = await supabase
      .from('pedidos_saque')
      .update({
        estado: corpo.estado,
        observacoes_admin: corpo.observacoesAdmin || null,
      })
      .eq('id', id)
      .select(
        `id, valor, metodo, estado, observacoesAdmin:observacoes_admin, criadoEm:criado_em`
      )
      .single()

    if (error) throw error

    if (perfilAfiliado?.email) {
      const modelo =
        corpo.estado === 'pago'
          ? modeloSaqueAprovado({ nome: perfilAfiliado.nomeCompleto, valor: Number(saque.valor) })
          : modeloSaqueRejeitado({
              nome: perfilAfiliado.nomeCompleto,
              valor: Number(saque.valor),
              motivo: corpo.observacoesAdmin,
            })
      await enviarEmail({ destinatario: perfilAfiliado.email, ...modelo })
    }

    return NextResponse.json({ saque: saqueAtualizado })
  } catch (erro) {
    console.error('Erro ao processar pedido de saque (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
