import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'

type DadosLogin = {
  email: string
  senha: string
}

// POST /api/auth/login - Autenticar utilizador (Supabase Auth)
// A sessão fica guardada em cookies httpOnly geridos pelo @supabase/ssr;
// não é preciso devolver nem manipular nenhum token manualmente.
export async function POST(requisicao: NextRequest) {
  try {
    const corpo = (await requisicao.json()) as DadosLogin

    if (!corpo.email || !corpo.senha) {
      return NextResponse.json(
        { erro: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await criarClienteServidor()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: corpo.email.toLowerCase(),
      password: corpo.senha,
    })

    if (error || !data.user) {
      return NextResponse.json({ erro: 'Credenciais inválidas' }, { status: 401 })
    }

    const { data: perfil } = await supabase
      .from('perfis')
      .select(
        `id, email, nomeCompleto:nome_completo, isAdmin:is_admin, podePublicar:pode_publicar, ativo,
         afiliado:afiliados(id, codigoRef:codigo_ref, saldo, totalGanho:total_ganho, ativo)`
      )
      .eq('id', data.user.id)
      .single()

    if (!perfil || !perfil.ativo) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { erro: 'Conta desativada. Contacte o suporte.' },
        { status: 403 }
      )
    }

    // afiliado vem como array (relação 1:1 mapeada pelo PostgREST) — normalizar
    const perfilNormalizado = {
      ...perfil,
      afiliado: Array.isArray(perfil.afiliado) ? perfil.afiliado[0] ?? null : perfil.afiliado,
    }

    return NextResponse.json({ utilizador: perfilNormalizado })
  } catch (erro) {
    console.error('Erro ao autenticar utilizador:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
