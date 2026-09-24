import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

// GET /api/admin/afiliados - Listar todos os afiliados (admin)
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const { data: afiliados, error } = await supabase
      .from('afiliados')
      .select(
        `id, codigoRef:codigo_ref, saldo, totalGanho:total_ganho, ativo, criadoEm:criado_em,
         perfil:perfis(nomeCompleto:nome_completo, email)`
      )
      .order('criado_em', { ascending: false })

    if (error) throw error

    return NextResponse.json({ afiliados: afiliados || [] })
  } catch (erro) {
    console.error('Erro ao listar afiliados (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
