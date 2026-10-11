import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'
import { enviarEmail } from '@/lib/email/enviar'
import { modeloSaqueSolicitado } from '@/lib/email/modelos'

const SAQUE_MINIMO_PADRAO = 3000

// GET /api/saques - Histórico de pedidos de saque do afiliado atual
export async function GET() {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data: afiliado } = await supabase
      .from('afiliados')
      .select('id')
      .eq('perfil_id', perfil.id)
      .single()

    if (!afiliado) {
      return NextResponse.json({ erro: 'Conta de afiliado não encontrada' }, { status: 404 })
    }

    const { data: saques, error } = await supabase
      .from('pedidos_saque')
      .select(
        `id, valor, metodo, dadosRecebimento:dados_recebimento, estado,
         observacoesAdmin:observacoes_admin, criadoEm:criado_em`
      )
      .eq('afiliado_id', afiliado.id)
      .order('criado_em', { ascending: false })

    if (error) throw error

    return NextResponse.json({ saques: saques || [] })
  } catch (erro) {
    console.error('Erro ao listar pedidos de saque:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}

type DadosCriarSaque = {
  valor: number
}

// POST /api/saques - Solicitar um novo saque (usa a conta de recebimento já configurada)
export async function POST(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { data: afiliado } = await supabase
      .from('afiliados')
      .select(
        `id, saldo, metodoRecebimento:metodo_recebimento, titularConta:titular_conta,
         iban, banco, emailAirtm:email_airtm, emailPaypal:email_paypal`
      )
      .eq('perfil_id', perfil.id)
      .single()

    if (!afiliado) {
      return NextResponse.json({ erro: 'Conta de afiliado não encontrada' }, { status: 404 })
    }

    if (!afiliado.metodoRecebimento) {
      return NextResponse.json(
        { erro: 'Configura primeiro a tua conta de recebimento antes de pedires um saque.' },
        { status: 400 }
      )
    }

    const { data: configSaque } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'saque_minimo')
      .single()
    const saqueMinimo = Number(configSaque?.valor ?? SAQUE_MINIMO_PADRAO)

    const corpo = (await requisicao.json()) as DadosCriarSaque
    const valor = Number(corpo.valor)

    if (!valor || valor <= 0) {
      return NextResponse.json({ erro: 'Valor de saque inválido' }, { status: 400 })
    }

    if (valor < saqueMinimo) {
      return NextResponse.json(
        { erro: `O valor mínimo de saque é ${saqueMinimo.toLocaleString('pt-AO')} Kz.` },
        { status: 400 }
      )
    }

    if (valor > Number(afiliado.saldo)) {
      return NextResponse.json(
        { erro: 'Saldo insuficiente para este valor de saque.' },
        { status: 400 }
      )
    }

    // Fotografia dos dados de recebimento no momento do pedido
    const dadosRecebimento =
      afiliado.metodoRecebimento === 'transferencia_bancaria'
        ? { titularConta: afiliado.titularConta, iban: afiliado.iban, banco: afiliado.banco }
        : afiliado.metodoRecebimento === 'airtm'
          ? { emailAirtm: afiliado.emailAirtm }
          : { emailPaypal: afiliado.emailPaypal }

    // Reserva o valor imediatamente (evita pedir o mesmo saldo duas vezes
    // enquanto o pedido está pendente). Se for rejeitado, o valor é devolvido.
    const { data: saque, error: erroSaque } = await supabase
      .from('pedidos_saque')
      .insert({
        afiliado_id: afiliado.id,
        valor,
        metodo: afiliado.metodoRecebimento,
        dados_recebimento: dadosRecebimento,
        estado: 'pendente',
      })
      .select(
        `id, valor, metodo, dadosRecebimento:dados_recebimento, estado, criadoEm:criado_em`
      )
      .single()

    if (erroSaque) throw erroSaque

    await supabase
      .from('afiliados')
      .update({ saldo: Number(afiliado.saldo) - valor })
      .eq('id', afiliado.id)

    await enviarEmail({
      destinatario: perfil.email,
      ...modeloSaqueSolicitado({ nome: perfil.nomeCompleto, valor }),
    })

    return NextResponse.json({ saque }, { status: 201 })
  } catch (erro) {
    console.error('Erro ao solicitar saque:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
