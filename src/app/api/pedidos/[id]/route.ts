// ============================================================
// API de Pedido Individual - Detalhes de um pedido
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'

export async function GET(
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

    const { data: pedido, error } = await supabase
      .from('pedidos')
      .select(
        `id, referencia, estado, metodoPagamento:metodo_pagamento, subtotal, moeda,
         observacoes, criadoEm:criado_em,
         itens:itens_pedido(id, produtoId:produto_id, titulo, preco, formato),
         comprovativo:comprovativos(id, ficheiroUrl:ficheiro_url, estado, criadoEm:criado_em)`
      )
      .eq('id', id)
      .eq('perfil_id', perfil.id)
      .single()

    if (error || !pedido) {
      return NextResponse.json(
        { sucesso: false, erro: 'Pedido não encontrado.' },
        { status: 404 }
      )
    }

    const resultado = {
      ...pedido,
      comprovativo: Array.isArray(pedido.comprovativo) ? pedido.comprovativo[0] ?? null : pedido.comprovativo,
    }

    return NextResponse.json({ sucesso: true, dados: resultado })
  } catch (erro: unknown) {
    console.error('Erro ao carregar pedido:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao carregar pedido.' },
      { status: 500 }
    )
  }
}
