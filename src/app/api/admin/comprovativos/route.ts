import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { exigirAdmin } from '@/lib/autenticacao-servidor'
import { processarAprovacaoPedido } from '../pedidos/route'
import { notificarEstadoPedido } from '../pedidos/route'

// O bucket "comprovativos" é privado — para o admin conseguir ver a
// imagem, é preciso gerar um URL assinado válido por um curto período
// a partir do caminho guardado em ficheiro_url.
async function assinarUrlsComprovativos(itens: any[]) {
  const clienteAdmin = criarClienteAdmin()
  return Promise.all(
    itens.map(async (item) => {
      if (!item.ficheiroUrl || item.ficheiroUrl.startsWith('http')) return item
      const { data } = await clienteAdmin.storage
        .from('comprovativos')
        .createSignedUrl(item.ficheiroUrl, 3600)
      return { ...item, ficheiroUrl: data?.signedUrl || item.ficheiroUrl }
    })
  )
}

// GET /api/admin/comprovativos - Listar comprovativos (admin)
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
    const estado = searchParams.get('estado') || 'pendente'
    const pagina = parseInt(searchParams.get('pagina') || '1', 10)
    const limite = parseInt(searchParams.get('limite') || '20', 10)
    const desde = (pagina - 1) * limite

    const { data, error, count } = await supabase
      .from('comprovativos')
      .select(
        `id, ficheiroUrl:ficheiro_url, estado, observacoes, criadoEm:criado_em,
         pedido:pedidos(
           id, referencia,
           perfil:perfis(id, nomeCompleto:nome_completo, email),
           itens:itens_pedido(titulo, formato, preco)
         )`,
        { count: 'exact' }
      )
      .eq('estado', estado)
      .order('criado_em', { ascending: true })
      .range(desde, desde + limite - 1)

    if (error) throw error

    const total = count ?? 0
    const comprovativos = await assinarUrlsComprovativos(data || [])

    return NextResponse.json({
      comprovativos,
      paginacao: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
    })
  } catch (erro) {
    console.error('Erro ao listar comprovativos (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

type DadosAprovarComprovativo = {
  pedidoId: string
  estado: 'aprovado' | 'rejeitado'
  observacoes?: string
}

// PATCH /api/admin/comprovativos - Aprovar ou rejeitar o comprovativo de um pedido
export async function PATCH(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const admin = await exigirAdmin(supabase)

    if (!admin) {
      return NextResponse.json(
        { erro: 'Acesso negado. Apenas administradores.' },
        { status: 403 }
      )
    }

    const corpo = (await requisicao.json()) as DadosAprovarComprovativo

    if (!corpo.pedidoId || !corpo.estado) {
      return NextResponse.json(
        { erro: 'pedidoId e estado são obrigatórios' },
        { status: 400 }
      )
    }

    if (!['aprovado', 'rejeitado'].includes(corpo.estado)) {
      return NextResponse.json(
        { erro: 'Estado inválido. Use "aprovado" ou "rejeitado".' },
        { status: 400 }
      )
    }

    const { data: comprovativo, error: erroBusca } = await supabase
      .from('comprovativos')
      .select(
        `id, estado, observacoes, pedidoId:pedido_id,
         pedido:pedidos(id, perfilId:perfil_id, afiliadoId:afiliado_id,
           itens:itens_pedido(produtoId:produto_id, preco, formato))`
      )
      .eq('pedido_id', corpo.pedidoId)
      .single()

    if (erroBusca || !comprovativo) {
      return NextResponse.json({ erro: 'Comprovativo não encontrado para este pedido' }, { status: 404 })
    }

    if (comprovativo.estado !== 'pendente') {
      return NextResponse.json(
        { erro: `Este comprovativo já foi ${comprovativo.estado}` },
        { status: 400 }
      )
    }

    const { data: comprovativoAtualizado, error } = await supabase
      .from('comprovativos')
      .update({ estado: corpo.estado, observacoes: corpo.observacoes ?? comprovativo.observacoes })
      .eq('id', comprovativo.id)
      .select('id, pedidoId:pedido_id, ficheiroUrl:ficheiro_url, estado, observacoes')
      .single()

    if (error) throw error

    const pedido = Array.isArray(comprovativo.pedido) ? comprovativo.pedido[0] : comprovativo.pedido

    if (corpo.estado === 'aprovado' && pedido) {
      await processarAprovacaoPedido(supabase, pedido as any)
      await supabase.from('pedidos').update({ estado: 'pago' }).eq('id', corpo.pedidoId)
      await notificarEstadoPedido(supabase, corpo.pedidoId, 'pago')
    } else {
      await supabase.from('pedidos').update({ estado: 'rejeitado' }).eq('id', corpo.pedidoId)
      await notificarEstadoPedido(supabase, corpo.pedidoId, 'rejeitado', corpo.observacoes)
    }

    return NextResponse.json({ comprovativo: comprovativoAtualizado })
  } catch (erro) {
    console.error('Erro ao processar comprovativo (admin):', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
