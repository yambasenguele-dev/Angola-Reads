// ============================================================
// API de Comprovativo — envio do comprovativo de pagamento
// POST /api/pedidos/[id]/comprovativo   (multipart/form-data, campo "ficheiro")
//
// - Só o dono do pedido pode enviar
// - Valida tipo (JPG, PNG, WEBP, PDF) e tamanho (máx. 5 MB)
// - Guarda no bucket privado "comprovativos" em {perfil}/{pedido}/...
// - NUNCA marca o pedido como pago: isso é decisão do admin
// ============================================================
import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { exigirUtilizador } from '@/lib/autenticacao-servidor'
import { gerarNomeFicheiroUnico } from '@/lib/autenticacao'

const TAMANHO_MAXIMO = 5 * 1024 * 1024

const TIPOS_PERMITIDOS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
}

// Confirma o conteúdo real do ficheiro (não confiar só no tipo/nome enviados)
function assinaturaValida(tipo: string, b: Uint8Array): boolean {
  const igual = (...bytes: number[]) => bytes.every((v, i) => b[i] === v)
  switch (tipo) {
    case 'image/jpeg':
      return igual(0xff, 0xd8, 0xff)
    case 'image/png':
      return igual(0x89, 0x50, 0x4e, 0x47)
    case 'application/pdf':
      return igual(0x25, 0x50, 0x44, 0x46) // %PDF
    case 'image/webp':
      return igual(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
    default:
      return false
  }
}

export async function POST(
  requisicao: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await criarClienteServidor()
    const perfil = await exigirUtilizador(supabase)

    if (!perfil) {
      return NextResponse.json({ sucesso: false, erro: 'Não autenticado.' }, { status: 401 })
    }

    const { id } = await params

    // Só o dono do pedido (filtro por perfil_id + RLS)
    const { data: pedido } = await supabase
      .from('pedidos')
      .select('id, estado')
      .eq('id', id)
      .eq('perfil_id', perfil.id)
      .single()

    if (!pedido) {
      return NextResponse.json({ sucesso: false, erro: 'Pedido não encontrado.' }, { status: 404 })
    }

    if (pedido.estado === 'pago') {
      return NextResponse.json(
        { sucesso: false, erro: 'Este pedido já está pago.' },
        { status: 400 }
      )
    }
    if (!['pendente', 'rejeitado'].includes(pedido.estado)) {
      return NextResponse.json(
        { sucesso: false, erro: 'Não é possível enviar comprovativo para este pedido.' },
        { status: 400 }
      )
    }

    const formData = await requisicao.formData().catch(() => null)
    const ficheiro = formData?.get('ficheiro')

    if (!ficheiro || typeof ficheiro === 'string') {
      return NextResponse.json(
        { sucesso: false, erro: 'Seleciona o ficheiro do comprovativo.' },
        { status: 400 }
      )
    }

    const extensao = ficheiro.name.includes('.')
      ? ficheiro.name.substring(ficheiro.name.lastIndexOf('.')).toLowerCase()
      : ''

    if (!TIPOS_PERMITIDOS[ficheiro.type]?.includes(extensao)) {
      return NextResponse.json(
        { sucesso: false, erro: 'Formato inválido. Envia uma imagem (JPG, PNG, WEBP) ou um PDF.' },
        { status: 400 }
      )
    }

    if (ficheiro.size === 0 || ficheiro.size > TAMANHO_MAXIMO) {
      return NextResponse.json(
        { sucesso: false, erro: 'Ficheiro inválido ou demasiado grande. O máximo é 5MB.' },
        { status: 400 }
      )
    }

    const bytes = await ficheiro.arrayBuffer()
    if (!assinaturaValida(ficheiro.type, new Uint8Array(bytes.slice(0, 12)))) {
      return NextResponse.json(
        { sucesso: false, erro: 'O conteúdo do ficheiro não corresponde ao formato indicado.' },
        { status: 400 }
      )
    }

    const caminho = `${perfil.id}/${pedido.id}/${gerarNomeFicheiroUnico(ficheiro.name)}`

    // A posse do pedido já foi verificada acima; o upload e o registo usam a
    // service role para permitir também reenvio (substituir comprovativo).
    const admin = criarClienteAdmin()

    const { data: anterior } = await admin
      .from('comprovativos')
      .select('ficheiro_url')
      .eq('pedido_id', pedido.id)
      .maybeSingle()

    const { error: erroUpload } = await admin.storage
      .from('comprovativos')
      .upload(caminho, bytes, { contentType: ficheiro.type, upsert: false })

    if (erroUpload) {
      console.error('Erro ao carregar comprovativo para o Storage:', erroUpload)
      return NextResponse.json(
        { sucesso: false, erro: 'Não foi possível carregar o ficheiro. Tenta novamente.' },
        { status: 500 }
      )
    }

    const { data: comprovativo, error } = await admin
      .from('comprovativos')
      .upsert(
        {
          pedido_id: pedido.id,
          perfil_id: perfil.id,
          ficheiro_url: caminho,
          tipo_ficheiro: ficheiro.type,
          estado: 'pendente',
          observacoes: null,
        },
        { onConflict: 'pedido_id' }
      )
      .select('id, pedidoId:pedido_id, estado')
      .single()

    if (error) {
      await admin.storage.from('comprovativos').remove([caminho])
      throw error
    }

    // Se o pedido estava rejeitado, volta a ficar pendente para nova análise.
    // Nunca passa a "pago" aqui.
    if (pedido.estado === 'rejeitado') {
      await admin.from('pedidos').update({ estado: 'pendente' }).eq('id', pedido.id)
    }

    // Remover o ficheiro antigo (se existir e for um caminho do Storage)
    if (anterior?.ficheiro_url && !anterior.ficheiro_url.startsWith('http')) {
      await admin.storage.from('comprovativos').remove([anterior.ficheiro_url])
    }

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Comprovativo enviado! Vamos confirmar o pagamento e libertar o download.',
        dados: comprovativo,
      },
      { status: 201 }
    )
  } catch (erro: unknown) {
    console.error('Erro ao enviar comprovativo:', erro)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro ao enviar comprovativo.' },
      { status: 500 }
    )
  }
    }
                   
