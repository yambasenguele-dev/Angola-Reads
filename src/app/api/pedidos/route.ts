import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'
import { gerarReferenciaPedido } from '@/lib/autenticacao'
import { enviarEmail } from '@/lib/email/enviar'
import { modeloCompraRecebida } from '@/lib/email/modelos'

type ItemPedidoDados = {
  produtoId: string
  formato: string
  titulo: string
  preco: number
}

type DadosCriarPedido = {
  itens: ItemPedidoDados[]
  metodoPagamento: string
  comprovativoUrl?: string | null
  codigoAfiliado?: string | null
  observacoes?: string | null
}

const METODOS_PAGAMENTO_VALIDOS = ['transferencia_bancaria', 'airtm', 'paypal']
const FORMATOS_VALIDOS = ['pdf', 'epub']

// GET /api/pedidos - Listar os pedidos do utilizador autenticado
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('pedidos')
      .select(
        `id, referencia, estado, metodoPagamento:metodo_pagamento, subtotal, moeda,
         observacoes, criadoEm:criado_em,
         itens:itens_pedido(
           id, produtoId:produto_id, titulo, preco, formato,
           produto:produtos(formatoPdf:formato_pdf, formatoEpub:formato_epub)
         ),
         comprovativo:comprovativos(id, ficheiroUrl:ficheiro_url, estado, criadoEm:criado_em)`
      )
      .eq('perfil_id', perfil.id)
      .order('criado_em', { ascending: false })

    if (error) throw error

    const pedidos = (data || []).map((p: any) => ({
      ...p,
      total: p.subtotal,
      comprovativo: Array.isArray(p.comprovativo) ? p.comprovativo[0] ?? null : p.comprovativo,
      produtos: (p.itens || []).map((i: any) => ({
        titulo: i.titulo,
        formato: i.formato,
        ficheiroPdf: i.produto?.ficheiroPdf ?? i.produto?.formatoPdf ?? null,
        ficheiroEpub: i.produto?.ficheiroEpub ?? i.produto?.formatoEpub ?? null,
      })),
    }))

    return NextResponse.json({ pedidos })
  } catch (erro) {
    console.error('Erro ao listar pedidos:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/pedidos - Criar novo pedido
export async function POST(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const corpo = (await requisicao.json()) as DadosCriarPedido

    if (!corpo.itens || !Array.isArray(corpo.itens) || corpo.itens.length === 0) {
      return NextResponse.json(
        { erro: 'O pedido deve conter pelo menos um item' },
        { status: 400 }
      )
    }

    if (!corpo.metodoPagamento || !METODOS_PAGAMENTO_VALIDOS.includes(corpo.metodoPagamento)) {
      return NextResponse.json(
        { erro: `Método de pagamento inválido. Opções: ${METODOS_PAGAMENTO_VALIDOS.join(', ')}` },
        { status: 400 }
      )
    }

    for (const item of corpo.itens) {
      if (!item.produtoId || !item.formato || !item.titulo || item.preco == null) {
        return NextResponse.json(
          { erro: 'Cada item deve conter: produtoId, formato, titulo, preco' },
          { status: 400 }
        )
      }
      if (!FORMATOS_VALIDOS.includes(item.formato)) {
        return NextResponse.json(
          { erro: `Formato inválido para o item "${item.titulo}". Use pdf ou epub.` },
          { status: 400 }
        )
      }
    }

    // Resolver código de afiliado (opcional, ignora silenciosamente se inválido)
    let afiliadoId: string | null = null
    if (corpo.codigoAfiliado) {
      const { data: afiliado } = await supabase
        .from('afiliados')
        .select('id, ativo')
        .eq('codigo_ref', corpo.codigoAfiliado.trim().toUpperCase())
        .single()
      if (afiliado && afiliado.ativo) {
        afiliadoId = afiliado.id
      }
    }

    const subtotal = corpo.itens.reduce((total, item) => total + item.preco, 0)
    const referencia = gerarReferenciaPedido()

    const { data: pedido, error: erroPedido } = await supabase
      .from('pedidos')
      .insert({
        referencia,
        perfil_id: perfil.id,
        estado: 'pendente',
        metodo_pagamento: corpo.metodoPagamento,
        subtotal,
        moeda: 'AOA',
        afiliado_id: afiliadoId,
        observacoes: corpo.observacoes || null,
      })
      .select('id, referencia, estado, metodoPagamento:metodo_pagamento, subtotal, moeda, criadoEm:criado_em')
      .single()

    if (erroPedido) throw erroPedido

    const { data: itens, error: erroItens } = await supabase
      .from('itens_pedido')
      .insert(
        corpo.itens.map((item) => ({
          pedido_id: pedido.id,
          produto_id: item.produtoId,
          titulo: item.titulo,
          preco: item.preco,
          formato: item.formato,
        }))
      )
      .select('id, produtoId:produto_id, titulo, preco, formato')

    if (erroItens) throw erroItens

    // Se já vier um comprovativo (upload feito antes de criar o pedido)
    if (corpo.comprovativoUrl) {
      await supabase.from('comprovativos').insert({
        pedido_id: pedido.id,
        ficheiro_url: corpo.comprovativoUrl,
        estado: 'pendente',
      })
    }

    // Envio de email (falha de email não impede a criação do pedido)
    await enviarEmail({
      destinatario: perfil.email,
      ...modeloCompraRecebida({
        nome: perfil.nomeCompleto,
        referencia: pedido.referencia,
        itens: corpo.itens.map((i) => ({ titulo: i.titulo, formato: i.formato, preco: i.preco })),
        total: subtotal,
        metodoPagamento: corpo.metodoPagamento,
      }),
    }).catch((erro) => console.error('Erro ao enviar email de compra recebida:', erro))

    return NextResponse.json(
      { pedido: { ...pedido, itens }, referencia: pedido.referencia },
      { status: 201 }
    )
  } catch (erro) {
    console.error('Erro ao criar pedido:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
