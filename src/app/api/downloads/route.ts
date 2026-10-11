import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'

// GET /api/downloads?ficheiro=<caminho-no-bucket-ebooks>
// Verifica se o utilizador autenticado tem um download liberado para
// esse ficheiro e, se sim, redireciona para um URL assinado (válido
// por poucos minutos) gerado com a service role do Supabase Storage.
export async function GET(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()
    const utilizador = await exigirUtilizador(supabase)

    if (!utilizador) {
      return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(requisicao.url)
    const ficheiro = searchParams.get('ficheiro')

    if (!ficheiro) {
      return NextResponse.json(
        { erro: 'Parâmetro obrigatório em falta: ficheiro' },
        { status: 400 }
      )
    }

    // Confirmar que o utilizador tem um download ativo e liberado
    // (criado quando o pedido correspondente foi aprovado) para um
    // produto cujo ficheiro (pdf ou epub) corresponde ao pedido.
    const { data: downloads } = await supabase
      .from('downloads')
      .select(
        `id, formato, ativo,
         produto:produtos(formatoPdf:formato_pdf, formatoEpub:formato_epub)`
      )
      .eq('perfil_id', utilizador.id)
      .eq('ativo', true)

    const temAcesso = (downloads || []).some((d: any) => {
      const caminhoProduto = d.formato === 'epub' ? d.produto?.formatoEpub : d.produto?.formatoPdf
      return caminhoProduto === ficheiro
    })

    if (!temAcesso) {
      return NextResponse.json(
        { erro: 'Não tens acesso a este ficheiro ou o download ainda não foi liberado.' },
        { status: 403 }
      )
    }

    const clienteAdmin = criarClienteAdmin()
    const { data, error } = await clienteAdmin.storage
      .from('ebooks')
      .createSignedUrl(ficheiro, 300, { download: true })

    if (error || !data) {
      console.error('Erro ao gerar URL assinado:', error)
      return NextResponse.json({ erro: 'Ficheiro não encontrado' }, { status: 404 })
    }

    return NextResponse.redirect(data.signedUrl)
  } catch (erro) {
    console.error('Erro ao processar download:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
