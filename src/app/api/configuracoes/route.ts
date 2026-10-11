// ============================================================
// API de Configurações - Dados públicos do sistema
// ============================================================
import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'

export async function GET() {
  try {
    const supabase = await criarClienteServidor()

    const { data: configuracoes, error } = await supabase
      .from('configuracoes')
      .select('chave, valor')

    if (error) throw error

    const mapa: Record<string, string> = {}
    for (const c of configuracoes || []) {
      mapa[c.chave] = c.valor
    }

    return NextResponse.json({ sucesso: true, dados: mapa })
  } catch (erro: unknown) {
    console.error('Erro ao carregar configurações:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao carregar configurações.' },
      { status: 500 }
    )
  }
}
