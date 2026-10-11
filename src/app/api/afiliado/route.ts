// ============================================================
// API de Afiliado - Painel do afiliado (rota legada, mantida por
// compatibilidade; a rota atual usada pelo frontend é /api/afiliados)
// ============================================================
import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'
import { gerarCodigoAfiliado } from '@/lib/autenticacao'

// --- Obter painel do afiliado ---
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ sucesso: false, erro: 'Não autenticado.' }, { status: 401 })
    }

    const { data: afiliado } = await supabase
      .from('afiliados')
      .select('id, codigoRef:codigo_ref, saldo, totalGanho:total_ganho, ativo, criadoEm:criado_em')
      .eq('perfil_id', perfil.id)
      .single()

    if (!afiliado) {
      return NextResponse.json({ sucesso: true, dados: { afiliado: null, comissoes: [] } })
    }

    const { data: comissoes } = await supabase
      .from('comissoes_afiliado')
      .select('id, valor, percentagem, estado, criadoEm:criado_em')
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: false })
      .limit(50)

    const { count: totalVendas } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('afiliado_id', afiliado.id)
      .eq('estado', 'pago')

    return NextResponse.json({
      sucesso: true,
      dados: { afiliado, comissoes: comissoes || [], totalVendas: totalVendas ?? 0 },
    })
  } catch (erro: unknown) {
    console.error('Erro ao carregar dados do afiliado:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao carregar dados do afiliado.' },
      { status: 500 }
    )
  }
}

// --- Registar-se como afiliado ---
export async function POST() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ sucesso: false, erro: 'Não autenticado.' }, { status: 401 })
    }

    const { data: existente } = await supabase
      .from('afiliados')
      .select('id')
      .eq('perfil_id', perfil.id)
      .single()

    if (existente) {
      return NextResponse.json(
        { sucesso: false, erro: 'Já é registado como afiliado.' },
        { status: 409 }
      )
    }

    const codigoRef = gerarCodigoAfiliado()

    const { data: afiliado, error } = await supabase
      .from('afiliados')
      .insert({ perfil_id: perfil.id, codigo_ref: codigoRef })
      .select('id, codigoRef:codigo_ref, saldo, totalGanho:total_ganho, ativo')
      .single()

    if (error) throw error

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Registado como afiliado com sucesso!',
      dados: afiliado,
    })
  } catch (erro: unknown) {
    console.error('Erro ao registar afiliado:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao registar como afiliado.' },
      { status: 500 }
    )
  }
}
