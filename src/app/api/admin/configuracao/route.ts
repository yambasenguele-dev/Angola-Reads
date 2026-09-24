import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

// GET /api/admin/configuracao - Obter todas as configurações (admin)
// Devolve um objeto simples { chave: valor, ... } (sem wrapper).
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

    const { data: configuracoes, error } = await supabase
      .from('configuracoes')
      .select('chave, valor')
      .order('chave', { ascending: true })

    if (error) throw error

    const resultado: Record<string, string> = {}
    for (const config of configuracoes || []) {
      resultado[config.chave] = config.valor
    }

    return NextResponse.json(resultado)
  } catch (erro) {
    console.error('Erro ao obter configurações (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT /api/admin/configuracao - Atualizar uma ou mais configurações de uma vez (admin)
// Aceita um objeto simples { chave: valor, ... }
export async function PUT(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const corpo = (await requisicao.json()) as Record<string, string>

    if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
      return NextResponse.json(
        { erro: 'Corpo inválido. Envia um objeto { chave: valor, ... }' },
        { status: 400 }
      )
    }

    const linhas = Object.entries(corpo).map(([chave, valor]) => ({
      chave,
      valor: String(valor ?? ''),
    }))

    if (linhas.length === 0) {
      return NextResponse.json({ erro: 'Nenhuma configuração para atualizar' }, { status: 400 })
    }

    const { error } = await supabase.from('configuracoes').upsert(linhas, { onConflict: 'chave' })
    if (error) throw error

    const { data: configuracoes, error: erroLeitura } = await supabase
      .from('configuracoes')
      .select('chave, valor')

    if (erroLeitura) throw erroLeitura

    const resultado: Record<string, string> = {}
    for (const config of configuracoes || []) {
      resultado[config.chave] = config.valor
    }

    return NextResponse.json(resultado)
  } catch (erro) {
    console.error('Erro ao atualizar configuração (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
