import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'

type DadosRecebimento = {
  metodoRecebimento: 'transferencia_bancaria' | 'airtm' | 'paypal'
  titularConta?: string
  iban?: string
  banco?: string
  emailAirtm?: string
  emailPaypal?: string
}

const METODOS_VALIDOS = ['transferencia_bancaria', 'airtm', 'paypal']

// PUT /api/afiliados/dados-recebimento - Configurar/atualizar a conta de recebimento
export async function PUT(requisicao: NextRequest) {
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

    const corpo = (await requisicao.json()) as DadosRecebimento

    if (!corpo.metodoRecebimento || !METODOS_VALIDOS.includes(corpo.metodoRecebimento)) {
      return NextResponse.json(
        { erro: `Método inválido. Opções: ${METODOS_VALIDOS.join(', ')}` },
        { status: 400 }
      )
    }

    if (corpo.metodoRecebimento === 'transferencia_bancaria') {
      if (!corpo.titularConta?.trim() || !corpo.iban?.trim() || !corpo.banco?.trim()) {
        return NextResponse.json(
          { erro: 'Para transferência bancária: titular da conta, IBAN e banco são obrigatórios' },
          { status: 400 }
        )
      }
    } else if (corpo.metodoRecebimento === 'airtm') {
      if (!corpo.emailAirtm?.trim()) {
        return NextResponse.json({ erro: 'Email da Airtm é obrigatório' }, { status: 400 })
      }
    } else if (corpo.metodoRecebimento === 'paypal') {
      if (!corpo.emailPaypal?.trim()) {
        return NextResponse.json({ erro: 'Email do PayPal é obrigatório' }, { status: 400 })
      }
    }

    const { data: atualizado, error } = await supabase
      .from('afiliados')
      .update({
        metodo_recebimento: corpo.metodoRecebimento,
        titular_conta: corpo.titularConta?.trim() || null,
        iban: corpo.iban?.trim() || null,
        banco: corpo.banco?.trim() || null,
        email_airtm: corpo.emailAirtm?.trim() || null,
        email_paypal: corpo.emailPaypal?.trim() || null,
      })
      .eq('id', afiliado.id)
      .select(
        `id, metodoRecebimento:metodo_recebimento, titularConta:titular_conta,
         iban, banco, emailAirtm:email_airtm, emailPaypal:email_paypal`
      )
      .single()

    if (error) throw error

    return NextResponse.json({ dadosRecebimento: atualizado })
  } catch (erro) {
    console.error('Erro ao atualizar dados de recebimento:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
