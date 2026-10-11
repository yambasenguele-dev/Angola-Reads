import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

// GET /api/admin/saques - Listar todos os pedidos de saque (admin)
export async function GET(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(requisicao.url)
    const estado = searchParams.get('estado')

    let consulta = supabase
      .from('pedidos_saque')
      .select(
        `id, valor, metodo, dadosRecebimento:dados_recebimento, estado,
         observacoesAdmin:observacoes_admin, criadoEm:criado_em,
         afiliado:afiliados(id, codigoRef:codigo_ref, perfil:perfis(nomeCompleto:nome_completo, email))`
      )
      .order('criado_em', { ascending: false })

    if (estado) consulta = consulta.eq('estado', estado)

    const { data: saques, error } = await consulta
    if (error) throw error

    return NextResponse.json({ saques: saques || [] })
  } catch (erro) {
    console.error('Erro ao listar pedidos de saque (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
