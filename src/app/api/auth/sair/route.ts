import { NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'

// POST /api/auth/sair - Terminar sessão (limpa os cookies do Supabase Auth)
export async function POST() {
  try {
    const supabase = await criarClienteServidor()
    await supabase.auth.signOut()
    return NextResponse.json({ mensagem: 'Sessão terminada com sucesso' })
  } catch (erro) {
    console.error('Erro ao terminar sessão:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
