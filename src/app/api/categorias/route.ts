import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin, obterPerfilAtual } from '@/lib/autenticacao-servidor'

// Tipo para criação de categoria
type DadosCriarCategoria = {
  nome: string
  descricao?: string
  slug: string
  ordem?: number
}

// GET /api/categorias - Listar categorias (público vê só ativas; admin vê todas)
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await obterPerfilAtual(supabase)

    let consulta = supabase
      .from('categorias')
      .select(
        `id, nome, descricao, slug, ativa, ordem,
         criadoEm:criado_em, atualizadoEm:atualizado_em,
         produtos(count)`
      )
      .order('ordem', { ascending: true })

    if (!perfil?.isAdmin) {
      consulta = consulta.eq('ativa', true)
    }

    const { data: categorias, error } = await consulta

    if (error) throw error

    // Normalizar a contagem de produtos (Supabase devolve produtos: [{count}])
    const resultado = (categorias || []).map((c: any) => ({
      ...c,
      _count: { produtos: c.produtos?.[0]?.count ?? 0 },
      produtos: undefined,
    }))

    return NextResponse.json({ categorias: resultado })
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/categorias - Criar categoria (apenas admin)
export async function POST(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const corpo = (await requisicao.json()) as DadosCriarCategoria

    if (!corpo.nome || !corpo.slug) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios: nome, slug' },
        { status: 400 }
      )
    }

    const { data: categoria, error } = await supabase
      .from('categorias')
      .insert({
        nome: corpo.nome,
        descricao: corpo.descricao || null,
        slug: corpo.slug,
        ordem: corpo.ordem || 0,
      })
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
      throw error
    }

    return NextResponse.json({ categoria }, { status: 201 })
  } catch (erro) {
    console.error('Erro ao criar categoria:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
