import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'

type DadosRegistro = {
  email: string
  nomeCompleto: string
  senha: string
  senhaConfirmacao?: string
}

// POST /api/auth/registrar - Registar novo utilizador (Supabase Auth)
export async function POST(requisicao: NextRequest) {
  try {
    const corpo = (await requisicao.json()) as DadosRegistro

    if (!corpo.email || !corpo.nomeCompleto || !corpo.senha) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios: email, nomeCompleto, senha' },
        { status: 400 }
      )
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regexEmail.test(corpo.email)) {
      return NextResponse.json({ erro: 'Formato de email inválido' }, { status: 400 })
    }

    if (corpo.senha.length < 6) {
      return NextResponse.json(
        { erro: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    if (corpo.senhaConfirmacao !== undefined && corpo.senha !== corpo.senhaConfirmacao) {
      return NextResponse.json({ erro: 'As senhas não coincidem' }, { status: 400 })
    }

    const supabase = await criarClienteServidor()

    const { data, error } = await supabase.auth.signUp({
      email: corpo.email.toLowerCase(),
      password: corpo.senha,
      options: {
        data: { nome_completo: corpo.nomeCompleto },
      },
    })

    if (error) {
      const mensagem = error.message.toLowerCase().includes('already registered')
        ? 'Este email já está registado'
        : error.message
      return NextResponse.json(
        { erro: mensagem },
        { status: error.status && error.status >= 400 ? error.status : 400 }
      )
    }

    if (!data.session) {
      // Confirmação de email está ativa no projeto Supabase: o
      // utilizador precisa de confirmar o email antes de entrar.
      return NextResponse.json(
        {
          mensagem:
            'Conta criada! Verifica o teu email para confirmar a conta antes de entrares.',
          precisaConfirmacao: true,
        },
        { status: 201 }
      )
    }

    // A trigger on_auth_user_created já criou a linha em "perfis".
    const { data: perfil } = await supabase
      .from('perfis')
      .select('id, email, nomeCompleto:nome_completo, isAdmin:is_admin')
      .eq('id', data.user!.id)
      .single()

    return NextResponse.json(
      {
        utilizador: perfil || {
          id: data.user!.id,
          email: data.user!.email,
          nomeCompleto: corpo.nomeCompleto,
          isAdmin: false,
        },
      },
      { status: 201 }
    )
  } catch (erro) {
    console.error('Erro ao registar utilizador:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
