import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

// GET /api/admin/utilizadores - Listar todos os utilizadores (admin)
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

    const { data: utilizadores, error } = await supabase
      .from('perfis')
      .select(
        `id, email, nomeCompleto:nome_completo, telefone, isAdmin:is_admin,
         ativo, criadoEm:criado_em`
      )
      .order('criado_em', { ascending: false })

    if (error) throw error

    return NextResponse.json({ utilizadores: utilizadores || [] })
  } catch (erro) {
    console.error('Erro ao listar utilizadores (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
