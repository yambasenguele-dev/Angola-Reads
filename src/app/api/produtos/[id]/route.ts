import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'

type DadosAtualizarProduto = {
  titulo?: string
  descricao?: string
  descricaoCurta?: string
  capaUrl?: string
  tipoProduto?: string
  formatoPdf?: string
  formatoEpub?: string
  precoNormal?: number
  precoPromocional?: number | null
  precoUsd?: number | null
  precoEur?: number | null
  categoriaId?: string
  ativo?: boolean
  destaque?: boolean
  comissaoAfiliado?: number
  estoqueIlimitado?: boolean
  estoqueMaximo?: number | null
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

// GET /api/produtos/[id] - Obter produto por ID
export async function GET(
  requisicao: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await criarClienteServidor()
    const { id } = await params

    // A RLS já esconde produtos inativos de quem não é admin,
    // por isso basta tentar ler diretamente.
    const { data: produto, error } = await supabase
      .from('produtos')
      .select(SELECAO_PRODUTO)
      .eq('id', id)
      .single()

    if (error || !produto) {
      return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ produto })
  } catch (erro) {
    console.error('Erro ao obter produto:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/produtos/[id] - Atualizar produto (admin)
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
    const corpo = (await requisicao.json()) as DadosAtualizarProduto

    if (corpo.categoriaId) {
      const { data: categoriaExiste } = await supabase
        .from('categorias')
        .select('id')
        .eq('id', corpo.categoriaId)
        .single()
      if (!categoriaExiste) {
        return NextResponse.json({ erro: 'Categoria não encontrada' }, { status: 404 })
      }
    }

    const dadosAtualizacao: Record<string, unknown> = {}
    if (corpo.titulo !== undefined) dadosAtualizacao.titulo = corpo.titulo
    if (corpo.descricao !== undefined) dadosAtualizacao.descricao = corpo.descricao
    if (corpo.descricaoCurta !== undefined) dadosAtualizacao.descricao_curta = corpo.descricaoCurta
    if (corpo.capaUrl !== undefined) dadosAtualizacao.capa_url = corpo.capaUrl
    if (corpo.tipoProduto !== undefined) dadosAtualizacao.tipo_produto = corpo.tipoProduto
    if (corpo.formatoPdf !== undefined) dadosAtualizacao.formato_pdf = corpo.formatoPdf
    if (corpo.formatoEpub !== undefined) dadosAtualizacao.formato_epub = corpo.formatoEpub
    if (corpo.precoNormal !== undefined) dadosAtualizacao.preco_normal = corpo.precoNormal
    if (corpo.precoPromocional !== undefined) dadosAtualizacao.preco_promocional = corpo.precoPromocional
    if (corpo.precoUsd !== undefined) dadosAtualizacao.preco_usd = corpo.precoUsd
    if (corpo.precoEur !== undefined) dadosAtualizacao.preco_eur = corpo.precoEur
    if (corpo.categoriaId !== undefined) dadosAtualizacao.categoria_id = corpo.categoriaId
    if (corpo.ativo !== undefined) dadosAtualizacao.ativo = corpo.ativo
    if (corpo.destaque !== undefined) dadosAtualizacao.destaque = corpo.destaque
    if (corpo.comissaoAfiliado !== undefined) dadosAtualizacao.comissao_afiliado = corpo.comissaoAfiliado
    if (corpo.estoqueIlimitado !== undefined) dadosAtualizacao.estoque_ilimitado = corpo.estoqueIlimitado
    if (corpo.estoqueMaximo !== undefined) dadosAtualizacao.estoque_maximo = corpo.estoqueMaximo

    const { data: produto, error } = await supabase
      .from('produtos')
      .update(dadosAtualizacao)
      .eq('id', id)
      .select(SELECAO_PRODUTO)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ erro: 'Produto não encontrado' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ produto })
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/produtos/[id] - Atualização parcial (ex: alternar ativo) — mesma lógica do PUT
export async function PATCH(
  requisicao: NextRequest,
  contexto: { params: Promise<{ id: string }> }
) {
  return PUT(requisicao, contexto)
}

// DELETE /api/produtos/[id] - Remover produto (admin); desativa se tiver pedidos associados
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
      .from('itens_pedido')
      .select('id', { count: 'exact', head: true })
      .eq('produto_id', id)

    if (count && count > 0) {
      const { data: produto, error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)
        .select(SELECAO_PRODUTO)
        .single()

      if (error) throw error

      return NextResponse.json({
        mensagem: 'Produto desativado (possui pedidos associados)',
        produto,
      })
    }

    const { error } = await supabase.from('produtos').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ mensagem: 'Produto removido com sucesso' })
  } catch (erro) {
    console.error('Erro ao remover produto:', erro)
    return NextResponse.json(
      { erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
