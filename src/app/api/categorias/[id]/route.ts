import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

type DadosAtualizarCategoria = {
  nome?: string
  descricao?: string | null
  slug?: string
  ativa?: boolean
  ordem?: number
}

// PUT /api/categorias/[id] - Atualizar categoria (admin)
export async function PUT(
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
    const corpo = (await requisicao.json()) as DadosAtualizarCategoria

    const dadosAtualizacao: Record<string, unknown> = {}
    if (corpo.nome !== undefined) dadosAtualizacao.nome = corpo.nome
    if (corpo.descricao !== undefined) dadosAtualizacao.descricao = corpo.descricao
    if (corpo.slug !== undefined) dadosAtualizacao.slug = corpo.slug
    if (corpo.ativa !== undefined) dadosAtualizacao.ativa = corpo.ativa
    if (corpo.ordem !== undefined) dadosAtualizacao.ordem = corpo.ordem

    const { data: categoria, error } = await supabase
      .from('categorias')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select(
        'id, nome, descricao, slug, ativa, ordem, criadoEm:criado_em, atualizadoEm:atualizado_em'
      )
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { erro: 'Este nome ou slug de categoria já existe' },
          { status: 409 }
        )
      }
      if (error.code === 'PGRST116') {
        return NextResponse.json({ erro: 'Categoria não encontrada' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ categoria })
  } catch (erro) {
    console.error('Erro ao atualizar categoria:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/categorias/[id] - Remover categoria (admin)
export async function DELETE(
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

    const { count } = await supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('categoria_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { erro: 'Não é possível remover esta categoria pois possui produtos associados' },
        { status: 400 }
      )
    }

    const { error } = await supabase.from('categorias').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ mensagem: 'Categoria removida com sucesso' })
  } catch (erro) {
    console.error('Erro ao remover categoria:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
