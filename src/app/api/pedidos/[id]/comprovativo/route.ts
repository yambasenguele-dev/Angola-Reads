// ============================================================
// API de Comprovativo - Envio de comprovativo de pagamento
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'

export async function POST(
  requisicao: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ sucesso: false, erro: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('id')
      .eq('id', id)
      .eq('perfil_id', perfil.id)
      .single()

    if (!pedido) {
      return NextResponse.json(
        { sucesso: false, erro: 'Pedido não encontrado.' },
        { status: 404 }
      )
    }

    const corpo = await requisicao.json()
    const { ficheiroUrl } = corpo

    if (!ficheiroUrl) {
      return NextResponse.json(
        { sucesso: false, erro: 'URL do ficheiro é obrigatória.' },
        { status: 400 }
      )
    }

    const { data: comprovativo, error } = await supabase
      .from('comprovativos')
      .upsert(
        { pedido_id: id, ficheiro_url: ficheiroUrl, estado: 'pendente' },
        { onConflict: 'pedido_id' }
      )
      .select('id, pedidoId:pedido_id, ficheiroUrl:ficheiro_url, estado')
      .single()

    if (error) throw error

    await supabase.from('pedidos').update({ estado: 'pendente' }).eq('id', id)

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Comprovativo enviado com sucesso! Aguarde a confirmação do pagamento.',
      dados: comprovativo,
    })
  } catch (erro: unknown) {
    console.error('Erro ao enviar comprovativo:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao enviar comprovativo.' },
      { status: 500 }
    )
  }
}
