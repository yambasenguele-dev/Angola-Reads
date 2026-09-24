import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin, obterPerfilAtual } from '@/lib/autenticacao-servidor'

type DadosCriarProduto = {
  titulo: string
  descricao: string
  descricaoCurta?: string
  capaUrl?: string
  tipoProduto?: string
  formatoPdf?: string
  formatoEpub?: string
  precoNormal: number
  precoPromocional?: number
  precoUsd?: number
  precoEur?: number
  categoriaId: string
  destaque?: boolean
  comissaoAfiliado?: number
  estoqueIlimitado?: boolean
  estoqueMaximo?: number
}

const SELECAO_PRODUTO = `
  id, titulo, descricao, descricaoCurta:descricao_curta, capaUrl:capa_url,
  tipoProduto:tipo_produto, formatoPdf:formato_pdf, formatoEpub:formato_epub,
  precoNormal:preco_normal, precoPromocional:preco_promocional,
  precoUsd:preco_usd, precoEur:preco_eur, categoriaId:categoria_id,
  ativo, destaque, comissaoAfiliado:comissao_afiliado,
  estoqueIlimitado:estoque_ilimitado, estoqueMaximo:estoque_maximo,
  vendasCount:vendas_count, criadoEm:criado_em, atualizadoEm:atualizado_em,
  categoria:categorias(id, nome, slug)
`

// GET /api/produtos - Listar produtos (público, apenas ativos)
export async function GET(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const { searchParams } = new URL(requisicao.url)
    const categoria = searchParams.get('categoria')
    const pesquisa = searchParams.get('pesquisa')
    const destaque = searchParams.get('destaque')

    const perfil = await obterPerfilAtual(supabase)

    let consulta = supabase
      .from('produtos')
      .select(SELECAO_PRODUTO)
      .order('criado_em', { ascending: false })

    if (!perfil?.isAdmin) {
      consulta = consulta.eq('ativo', true)
    }

    if (destaque === 'true') {
      consulta = consulta.eq('destaque', true)
    }

    if (pesquisa) {
      consulta = consulta.or(`titulo.ilike.%${pesquisa}%,descricao.ilike.%${pesquisa}%`)
    }

    if (categoria) {
      // Resolver o slug da categoria para o respectivo id
      const { data: cat } = await supabase
        .from('categorias')
        .select('id')
        .eq('slug', categoria)
        .single()
      if (cat) {
        consulta = consulta.eq('categoria_id', cat.id)
      } else {
        return NextResponse.json({ produtos: [] })
      }
    }

    const { data: produtos, error } = await consulta
    if (error) throw error

    return NextResponse.json({ produtos: produtos || [] })
  } catch (erro) {
    console.error('Erro ao listar produtos:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/produtos - Criar produto (apenas admin)
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

    const corpo = (await requisicao.json()) as DadosCriarProduto

    if (!corpo.titulo || !corpo.descricao || !corpo.precoNormal || !corpo.categoriaId) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios: titulo, descricao, precoNormal, categoriaId' },
        { status: 400 }
      )
    }

    const { data: categoriaExiste } = await supabase
      .from('categorias')
      .select('id')
      .eq('id', corpo.categoriaId)
      .single()

    if (!categoriaExiste) {
      return NextResponse.json({ erro: 'Categoria não encontrada' }, { status: 404 })
    }

    const { data: produto, error } = await supabase
      .from('produtos')
      .insert({
        titulo: corpo.titulo,
        descricao: corpo.descricao,
        descricao_curta: corpo.descricaoCurta || null,
        capa_url: corpo.capaUrl || null,
        tipo_produto: corpo.tipoProduto || 'ebook',
        formato_pdf: corpo.formatoPdf || null,
        formato_epub: corpo.formatoEpub || null,
        preco_normal: corpo.precoNormal,
        preco_promocional: corpo.precoPromocional ?? null,
        preco_usd: corpo.precoUsd ?? null,
        preco_eur: corpo.precoEur ?? null,
        categoria_id: corpo.categoriaId,
        destaque: corpo.destaque || false,
        comissao_afiliado: corpo.comissaoAfiliado ?? 20,
        estoque_ilimitado: corpo.estoqueIlimitado !== undefined ? corpo.estoqueIlimitado : true,
        estoque_maximo: corpo.estoqueMaximo ?? null,
      })
      .select(SELECAO_PRODUTO)
      .single()

    if (error) throw error

    return NextResponse.json({ produto }, { status: 201 })
  } catch (erro) {
    console.error('Erro ao criar produto:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
