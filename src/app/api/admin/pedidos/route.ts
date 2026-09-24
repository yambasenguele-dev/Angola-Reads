import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirAdmin } from '@/lib/autenticacao-servidor'
import { enviarEmail } from '@/lib/email/enviar'
import { modeloPagamentoAprovado, modeloPagamentoRejeitado } from '@/lib/email/modelos'

export const SELECAO_PEDIDO = `
  id, referencia, estado, metodoPagamento:metodo_pagamento, subtotal, moeda,
  observacoes, criadoEm:criado_em, atualizadoEm:atualizado_em, perfilId:perfil_id,
  perfil:perfis(id, nomeCompleto:nome_completo, email),
  itens:itens_pedido(id, produtoId:produto_id, titulo, preco, formato),
  comprovativo:comprovativos(id, ficheiroUrl:ficheiro_url, estado, criadoEm:criado_em),
  afiliado:afiliados(id, codigoRef:codigo_ref, perfil:perfis(nomeCompleto:nome_completo))
`

export function normalizarPedido(p: any) {
  return {
    ...p,
    comprovativo: Array.isArray(p.comprovativo) ? p.comprovativo[0] ?? null : p.comprovativo,
    afiliado: Array.isArray(p.afiliado) ? p.afiliado[0] ?? null : p.afiliado,
  }
}

// GET /api/admin/pedidos - Listar todos os pedidos (admin)
export async function GET(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(requisicao.url)
    const estado = searchParams.get('estado')
    const pagina = parseInt(searchParams.get('pagina') || '1', 10)
    const limite = parseInt(searchParams.get('limite') || '20', 10)
    const desde = (pagina - 1) * limite

    let consulta = supabase
      .from('pedidos')
      .select(SELECAO_PEDIDO, { count: 'exact' })
      .order('criado_em', { ascending: false })
      .range(desde, desde + limite - 1)

    if (estado) consulta = consulta.eq('estado', estado)

    const { data, error, count } = await consulta
    if (error) throw error

    const total = count ?? 0

    return NextResponse.json({
      pedidos: (data || []).map(normalizarPedido),
      paginacao: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    })
  } catch (erro) {
    console.error('Erro ao listar pedidos (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// Envia o email de "pagamento aprovado" ou "pedido rejeitado" ao cliente.
// Chamado tanto pela aprovação direta do pedido como pela aprovação do comprovativo.
export async function notificarEstadoPedido(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  pedidoId: string,
  estado: 'pago' | 'rejeitado',
  motivo?: string
) {
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('referencia, perfil:perfis(nomeCompleto:nome_completo, email)')
    .eq('id', pedidoId)
    .single()

  if (!pedido) return
  const perfil = Array.isArray(pedido.perfil) ? pedido.perfil[0] : pedido.perfil
  if (!perfil?.email) return

  const modelo =
    estado === 'pago'
      ? modeloPagamentoAprovado({ nome: perfil.nomeCompleto, referencia: pedido.referencia })
      : modeloPagamentoRejeitado({ nome: perfil.nomeCompleto, referencia: pedido.referencia, motivo })

  await enviarEmail({ destinatario: perfil.email, ...modelo }).catch((erro) =>
    console.error('Erro ao enviar email de estado do pedido:', erro)
  )
}

// Cria os registos de download, incrementa vendas e gera comissões de afiliado.
// Usado tanto por PATCH /api/admin/pedidos como por PATCH /api/admin/comprovativos.
export async function processarAprovacaoPedido(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  pedido: {
    id: string
    perfilId: string
    afiliadoId: string | null
    itens: { produtoId: string; preco: number; formato: string }[]
  }
) {
  for (const item of pedido.itens) {
    const { data: produto } = await supabase
      .from('produtos')
      .select('formatoPdf:formato_pdf, formatoEpub:formato_epub, comissaoAfiliado:comissao_afiliado, vendasCount:vendas_count')
      .eq('id', item.produtoId)
      .single()

    if (!produto) continue

    const caminhoFicheiro = item.formato === 'epub' ? produto.formatoEpub : produto.formatoPdf

    if (caminhoFicheiro) {
      await supabase.from('downloads').insert({
        perfil_id: pedido.perfilId,
        produto_id: item.produtoId,
        pedido_id: pedido.id,
        formato: item.formato,
        ativo: true,
      })
    }

    await supabase
      .from('produtos')
      .update({ vendas_count: (produto.vendasCount ?? 0) + 1 })
      .eq('id', item.produtoId)

    if (pedido.afiliadoId) {
      const percentagem = produto.comissaoAfiliado ?? 20
      const valorComissao = (item.preco * percentagem) / 100

      await supabase.from('comissoes_afiliado').insert({
        afiliado_id: pedido.afiliadoId,
        pedido_id: pedido.id,
        produto_id: item.produtoId,
        valor: valorComissao,
        percentagem,
        estado: 'pendente',
      })

      const { data: afiliado } = await supabase
        .from('afiliados')
        .select('saldo, totalGanho:total_ganho')
        .eq('id', pedido.afiliadoId)
        .single()

      if (afiliado) {
        await supabase
          .from('afiliados')
          .update({
            saldo: Number(afiliado.saldo) + valorComissao,
            total_ganho: Number(afiliado.totalGanho) + valorComissao,
          })
          .eq('id', pedido.afiliadoId)
      }
    }
  }
}
