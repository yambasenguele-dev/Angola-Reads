import { NextRequest, NextResponse } from 'next/server'
import { criarClienteServidor } from '@/lib/supabase/servidor'
import { criarClienteAdmin } from '@/lib/supabase/admin'
import { exigirAdmin, exigirUtilizador } from '@/lib/autenticacao-servidor'
import { gerarNomeFicheiroUnico } from '@/lib/autenticacao'

const EXTENSOES_EBOOK = ['.pdf', '.epub']
const TIPOS_MIME_EBOOK = ['application/pdf', 'application/epub+zip']
const EXTENSOES_IMAGEM = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const TIPOS_MIME_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const TAMANHO_MAXIMO_EBOOK = 50 * 1024 * 1024
const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024

type Pasta = 'ebooks' | 'comprovativos' | 'capas'

// POST /api/upload - Carregar ficheiro para o Supabase Storage
// FormData: "ficheiro" (obrigatório), "pasta" (ebooks | comprovativos | capas)
//   - ebooks e capas: apenas administradores
//   - comprovativos: qualquer utilizador autenticado (fica na sua própria pasta)
export async function POST(requisicao: NextRequest) {
  try {
    const supabase = await criarClienteServidor()

    const formData = await requisicao.formData()
    const ficheiro = formData.get('ficheiro') as File | null
    const pasta = (formData.get('pasta') as string | null) || 'comprovativos'

    if (!ficheiro) {
      return NextResponse.json(
        { erro: 'Nenhum ficheiro enviado. Use o campo "ficheiro".' },
        { status: 400 }
      )
    }

    if (!['ebooks', 'comprovativos', 'capas'].includes(pasta)) {
      return NextResponse.json(
        { erro: 'Pasta inválida. Use "ebooks", "comprovativos" ou "capas".' },
        { status: 400 }
      )
    }

    const nomeOriginal = ficheiro.name
    const extensao = nomeOriginal.includes('.')
      ? nomeOriginal.substring(nomeOriginal.lastIndexOf('.')).toLowerCase()
      : ''

    let prefixoCaminho = ''

    if (pasta === 'ebooks') {
      const admin = await exigirAdmin(supabase)
      if (!admin) {
        return NextResponse.json(
          { erro: 'Acesso negado. Apenas administradores podem carregar ebooks.' },
          { status: 403 }
        )
      }
      if (!EXTENSOES_EBOOK.includes(extensao) || !TIPOS_MIME_EBOOK.includes(ficheiro.type)) {
        return NextResponse.json(
          { erro: 'Formato de ebook inválido. Apenas PDF e EPUB são aceites.' },
          { status: 400 }
        )
      }
      if (ficheiro.size > TAMANHO_MAXIMO_EBOOK) {
        return NextResponse.json(
          { erro: 'Ficheiro demasiado grande. Máximo 50MB para ebooks.' },
          { status: 400 }
        )
      }
    } else if (pasta === 'capas') {
      const admin = await exigirAdmin(supabase)
      if (!admin) {
        return NextResponse.json(
          { erro: 'Acesso negado. Apenas administradores podem carregar capas.' },
          { status: 403 }
        )
      }
      if (!EXTENSOES_IMAGEM.includes(extensao) || !TIPOS_MIME_IMAGEM.includes(ficheiro.type)) {
        return NextResponse.json(
          { erro: 'Formato de imagem inválido. Apenas JPG, PNG, WEBP e GIF são aceites.' },
          { status: 400 }
        )
      }
      if (ficheiro.size > TAMANHO_MAXIMO_IMAGEM) {
        return NextResponse.json(
          { erro: 'Ficheiro demasiado grande. Máximo 5MB para capas.' },
          { status: 400 }
        )
      }
    } else {
      // comprovativos
      const utilizador = await exigirUtilizador(supabase)
      if (!utilizador) {
        return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 })
      }
      if (!EXTENSOES_IMAGEM.includes(extensao) || !TIPOS_MIME_IMAGEM.includes(ficheiro.type)) {
        return NextResponse.json(
          { erro: 'Formato de imagem inválido. Apenas JPG, PNG, WEBP e GIF são aceites.' },
          { status: 400 }
        )
      }
      if (ficheiro.size > TAMANHO_MAXIMO_IMAGEM) {
        return NextResponse.json(
          { erro: 'Ficheiro demasiado grande. Máximo 5MB para comprovativos.' },
          { status: 400 }
        )
      }
      // Cada utilizador só pode escrever dentro da sua própria pasta
      prefixoCaminho = `${utilizador.id}/`
    }

    const nomeFicheiro = gerarNomeFicheiroUnico(nomeOriginal)
    const caminho = `${prefixoCaminho}${nomeFicheiro}`

    const clienteAdmin = criarClienteAdmin()
    const bytes = await ficheiro.arrayBuffer()

    const { error: erroUpload } = await clienteAdmin.storage
      .from(pasta as Pasta)
      .upload(caminho, bytes, {
        contentType: ficheiro.type,
        upsert: false,
      })

    if (erroUpload) {
      console.error('Erro ao carregar para o Storage:', erroUpload)
      return NextResponse.json({ erro: 'Erro ao carregar ficheiro' }, { status: 500 })
    }

    // Bucket "capas" é público: podemos devolver logo o URL público e permanente.
    // "ebooks" e "comprovativos" são privados: devolvemos apenas o caminho —
    // o acesso é sempre feito depois através de URLs assinadas geradas no servidor.
    const resposta: Record<string, unknown> = {
      caminho,
      nomeFicheiro,
      tamanho: ficheiro.size,
      pasta,
    }

    if (pasta === 'capas') {
      const { data: urlPublico } = clienteAdmin.storage.from('capas').getPublicUrl(caminho)
      resposta.url = urlPublico.publicUrl
    }

    return NextResponse.json(resposta, { status: 201 })
  } catch (erro) {
    console.error('Erro ao carregar ficheiro:', erro)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
