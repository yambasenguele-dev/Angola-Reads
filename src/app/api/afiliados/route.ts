import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'
import { gerarCodigoAfiliado } from '@/lib/autenticacao'

// Monta o objeto "ContaAfiliado" (com estatísticas agregadas) tal como
// o painel do afiliado (PainelAfiliado.tsx) espera.
async function montarContaAfiliado(supabase: Awaited<ReturnType<typeof criarClienteServidor>>, afiliado: {
  id: string
  codigoRef: string
  perfilId: string
  saldo: number
  ativo: boolean
}) {
  const { data: comissoesTodas } = await supabase
    .from('comissoes_afiliado')
    .select('valor, percentagem, estado')
    .eq('afiliado_id', afiliado.id)

  const lista = comissoesTodas || []
  const comissoesPendentes = lista
    .filter((c) => c.estado === 'pendente')
    .reduce((soma, c) => soma + Number(c.valor), 0)
  const comissoesPagas = lista
    .filter((c) => c.estado === 'paga')
    .reduce((soma, c) => soma + Number(c.valor), 0)
  const percentagemComissao =
    lista.length > 0
      ? Math.round(lista.reduce((soma, c) => soma + c.percentagem, 0) / lista.length)
      : 20

  const { count: totalVendas } = await supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('afiliado_id', afiliado.id)
    .eq('estado', 'pago')

  return {
    id: afiliado.id,
    codigoAfiliado: afiliado.codigoRef,
    utilizadorId: afiliado.perfilId,
    totalVendas: totalVendas ?? 0,
    comissoesPendentes,
    comissoesPagas,
    saldoDisponivel: Number(afiliado.saldo),
    percentagemComissao,
  }
}

// GET /api/afiliados - Obter conta + comissões do afiliado atual
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data: afiliado, error } = await supabase
      .from('afiliados')
      .select(
        `id, codigoRef:codigo_ref, perfilId:perfil_id, saldo, ativo,
         metodoRecebimento:metodo_recebimento, titularConta:titular_conta,
         iban, banco, emailAirtm:email_airtm, emailPaypal:email_paypal`
      )
      .eq('perfil_id', perfil.id)
      .single()

    if (error || !afiliado) {
      return NextResponse.json({ erro: 'Conta de afiliado não encontrada' }, { status: 404 })
    }

    const conta = await montarContaAfiliado(supabase, afiliado)

    const { data: configSaque } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'saque_minimo')
      .single()

    const dadosRecebimento = {
      metodoRecebimento: afiliado.metodoRecebimento,
      titularConta: afiliado.titularConta,
      iban: afiliado.iban,
      banco: afiliado.banco,
      emailAirtm: afiliado.emailAirtm,
      emailPaypal: afiliado.emailPaypal,
    }

    const { data: comissoesRaw } = await supabase
      .from('comissoes_afiliado')
      .select('id, valor, percentagem, estado, criadoEm:criado_em, produto:produtos(titulo)')
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: false })
      .limit(30)

    const comissoes = (comissoesRaw || []).map((c: any) => ({
      id: c.id,
      data: c.criadoEm,
      produto: c.produto?.titulo || 'Produto',
      valor: Number(c.valor),
      percentagem: c.percentagem,
      estado: c.estado,
    }))

    return NextResponse.json({
      conta,
      comissoes,
      dadosRecebimento,
      saqueMinimo: Number(configSaque?.valor ?? 3000),
    })
  } catch (erro) {
    console.error('Erro ao obter informações de afiliado:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST /api/afiliados - Criar conta de afiliado para o utilizador atual
export async function POST() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data: existente } = await supabase
      .from('afiliados')
      .select('id')
      .eq('perfil_id', perfil.id)
      .single()

    if (existente) {
      return NextResponse.json({ erro: 'Já possui uma conta de afiliado' }, { status: 409 })
    }

    let codigoRef = gerarCodigoAfiliado()
    for (let tentativa = 0; tentativa < 10; tentativa++) {
      const { data: emUso } = await supabase
        .from('afiliados')
        .select('id')
        .eq('codigo_ref', codigoRef)
        .single()
      if (!emUso) break
      codigoRef = gerarCodigoAfiliado()
    }

    const { data: afiliado, error } = await supabase
      .from('afiliados')
      .insert({ perfil_id: perfil.id, codigo_ref: codigoRef })
      .select('id, codigoRef:codigo_ref, perfilId:perfil_id, saldo, ativo')
      .single()

    if (error) throw error

    const conta = await montarContaAfiliado(supabase, afiliado)

    return NextResponse.json(conta, { status: 201 })
  } catch (erro) {
    console.error('Erro ao criar conta de afiliado:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
