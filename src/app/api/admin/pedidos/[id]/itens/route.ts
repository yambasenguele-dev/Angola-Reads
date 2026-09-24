import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

// GET /api/admin/pedidos/[id]/itens - Itens de um pedido (admin)
export async function GET(
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

    const { data: itens, error } = await supabase
      .from('itens_pedido')
      .select('id, produtoId:produto_id, titulo, preco, formato')
      .eq('pedido_id', id)

    if (error) throw error

    return NextResponse.json({ itens: itens || [] })
  } catch (erro) {
    console.error('Erro ao obter itens do pedido (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
