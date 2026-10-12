'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  ShoppingCart,
  FileText,
  Book,
  Check,
  Star,
  Download,
  Link2,
  Copy,
  TrendingUp,
  ChevronDown,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarCarrinho, type ItemCarrinho } from '@/lojas/carrinho'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { formatarPreco } from '@/lib/autenticacao'
import { construirLinkAfiliadoProduto } from '@/lib/afiliado-ref'

// Tipo do produto retornado pela API
type TipoFormato = 'pdf' | 'epub'

interface ProdutoDetalhe {
  id: string
  titulo: string
  descricao: string
  descricaoCurta: string | null
  capaUrl: string | null
  tipoProduto: string
  formatoPdf: string | null
  formatoEpub: string | null
  precoNormal: number
  precoPromocional: number | null
  precoUsd: number | null
  precoEur: number | null
  categoria: {
    nome: string
    slug: string
  }
  destaque: boolean
  vendasCount: number
  comissaoAfiliado: number
}

// Perguntas frequentes (alinhadas com os Termos e a página de Suporte)
const PERGUNTAS_FREQUENTES: { pergunta: string; resposta: string }[] = [
  {
    pergunta: 'Como é que pago o meu pedido?',
    resposta:
      'Podes pagar por transferência bancária, Airtm ou PayPal. Ao confirmares o pedido na transferência bancária, mostramos-te o IBAN, o titular, o valor a pagar e a referência do pedido, que deves colocar na descrição da transferência.',
  },
  {
    pergunta: 'Quando posso descarregar o ebook?',
    resposta:
      'O download só fica disponível depois de confirmarmos o pagamento. A confirmação é feita manualmente pela nossa equipa, normalmente dentro de 24 horas. Quando for aprovada, recebes um email e o ebook aparece em "Os Meus Ebooks".',
  },
  {
    pergunta: 'Qual a diferença entre PDF e EPUB?',
    resposta:
      'O PDF mantém a paginação original e abre em praticamente qualquer telemóvel ou computador. O EPUB adapta o texto ao tamanho do ecrã e é ideal para leitores de ebooks e aplicações de leitura. Se estiverem ambos disponíveis, podes levar os dois formatos.',
  },
  {
    pergunta: 'Posso pedir reembolso?',
    resposta:
      'Por regra, não há reembolso depois de o ficheiro ter sido descarregado. Se tiveres um problema com o ficheiro, contacta-nos em até 7 dias úteis com a referência do pedido e tentaremos resolver primeiro, por exemplo reenviando o ficheiro correcto. Os detalhes estão nos Termos e na página de Suporte.',
  },
  {
    pergunta: 'Já paguei mas o ebook não aparece. O que faço?',
    resposta:
      'Confirma que colocaste a referência do pedido na descrição da transferência e envia-nos o comprovativo para angolareads@gmail.com ou pelo WhatsApp +244 947 399 578, indicando a referência do pedido.',
  },
]

// Etiquetas amigáveis para tipos
const etiquetasTipo: Record<string, string> = {
  ebook: 'Ebook',
  bundle: 'Pacote',
  curso_limitado: 'Curso Limitado',
}

// Cores dos badges por tipo
const coresTipo: Record<string, string> = {
  ebook: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
  bundle: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
  curso_limitado: 'bg-teal-100 text-teal-700 hover:bg-teal-100',
}

export default function PaginaProduto() {
  const parametroId = usarNavegacao((s) => s.parametroId)
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const adicionarItem = usarCarrinho((s) => s.adicionarItem)
  const itensCarrinho = usarCarrinho((s) => s.itens)
  const { utilizador, estaAutenticado, eAfiliado } = usarAutenticacao()

  const [produto, setProduto] = useState<ProdutoDetalhe | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [formatoSelecionado, setFormatoSelecionado] = useState<TipoFormato>('pdf')
  const [formatosAdicionados, setFormatosAdicionados] = useState<Set<TipoFormato>>(new Set())
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [mostrarAfiliacao, setMostrarAfiliacao] = useState(false)

  // Verificar se um formato já está no carrinho
  const estaNoCarrinho = useCallback(
    (formato: TipoFormato) => {
      return itensCarrinho.some(
        (i) => i.produtoId === parametroId && i.formato === formato
      )
    },
    [itensCarrinho, parametroId]
  )

  // Sincronizar formatos adicionados com o estado real do carrinho
  useEffect(() => {
    const formatos = new Set<TipoFormato>()
    if (estaNoCarrinho('pdf')) formatos.add('pdf')
    if (estaNoCarrinho('epub')) formatos.add('epub')
    setFormatosAdicionados(formatos)
  }, [estaNoCarrinho])

  // Buscar detalhes do produto
  useEffect(() => {
    if (!parametroId) return
    setMostrarAfiliacao(false)

    const buscarProduto = async () => {
      setCarregando(true)
      setErro(null)
      try {
        const resposta = await fetch(`/api/produtos/${parametroId}`)
        if (!resposta.ok) {
          throw new Error('Produto não encontrado')
        }
        const dados = await resposta.json()
        setProduto(dados.produto || dados)
      } catch {
        setErro('Não foi possível carregar os detalhes do produto. Tenta novamente mais tarde.')
      } finally {
        setCarregando(false)
      }
    }
    buscarProduto()
  }, [parametroId])

  // Determinar formatos disponíveis
  const temPdf = produto?.formatoPdf !== null && produto?.formatoPdf !== undefined
  const temEpub = produto?.formatoEpub !== null && produto?.formatoEpub !== undefined
  const temAmbosFormatos = temPdf && temEpub

  // Verificar se pode adicionar o formato selecionado
  const podeAdicionar = !estaNoCarrinho(formatoSelecionado)

  // Verificar se pode adicionar ambos (quando ambos estão disponíveis)
  const podeAdicionarAmbos =
    temAmbosFormatos &&
    (!estaNoCarrinho('pdf') || !estaNoCarrinho('epub'))

  // Preço final
  const temPromocao = produto !== null && produto.precoPromocional !== null && produto.precoPromocional > 0
  const precoFinal = temPromocao ? produto!.precoPromocional! : produto?.precoNormal ?? 0
  const desconto = temPromocao
    ? Math.round(((produto!.precoNormal - produto!.precoPromocional!) / produto!.precoNormal) * 100)
    : 0

  // Comissão de afiliado deste produto
  const temComissaoAfiliado = (produto?.comissaoAfiliado ?? 0) > 0
  const valorComissaoEstimado = produto ? (precoFinal * produto.comissaoAfiliado) / 100 : 0
  const linkAfiliado =
    produto && utilizador?.afiliado?.codigoRef
      ? construirLinkAfiliadoProduto(produto.id, utilizador.afiliado.codigoRef)
      : ''

  const copiarLinkAfiliado = () => {
    if (!linkAfiliado) return
    navigator.clipboard.writeText(linkAfiliado)
    setLinkCopiado(true)
    toast.success('Link copiado!')
    setTimeout(() => setLinkCopiado(false), 2000)
  }

  const partilharWhatsApp = () => {
    if (!linkAfiliado || !produto) return
    const texto = encodeURIComponent(`Recomendo este ebook: "${produto.titulo}" — ${linkAfiliado}`)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  const partilharFacebook = () => {
    if (!linkAfiliado) return
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkAfiliado)}`,
      '_blank'
    )
  }

  // Clique em "Afiliar-me a este produto"
  const lidarCliqueAfiliacao = () => {
    if (!estaAutenticado()) {
      toast.info('Inicia sessão para te afiliares', {
        description: 'Precisas de ter conta para ganhares comissão neste ebook.',
      })
      navegarPara('login')
      return
    }
    setMostrarAfiliacao((aberto) => !aberto)
  }

  // Adicionar ao carrinho
  const lidarAdicionarAoCarrinho = () => {
    if (!produto || !podeAdicionar) return

    const item: ItemCarrinho = {
      produtoId: produto.id,
      titulo: produto.titulo,
      preco: produto.precoNormal,
      precoPromocional: produto.precoPromocional,
      capaUrl: produto.capaUrl,
      formato: formatoSelecionado,
      tipoProduto: produto.tipoProduto,
    }

    adicionarItem(item)
    setFormatosAdicionados((prev) => new Set([...prev, formatoSelecionado]))
    toast.success('Adicionado ao carrinho!', {
      description: `${produto.titulo} (${formatoSelecionado.toUpperCase()}) foi adicionado ao teu carrinho.`,
      action: {
        label: 'Ver Carrinho',
        onClick: () => navegarPara('carrinho'),
      },
    })
  }

  // Adicionar ambos os formatos ao carrinho
  const lidarAdicionarAmbos = () => {
    if (!produto || !podeAdicionarAmbos) return

    const formatos: TipoFormato[] = []
    if (!estaNoCarrinho('pdf')) formatos.push('pdf')
    if (!estaNoCarrinho('epub')) formatos.push('epub')

    formatos.forEach((fmt) => {
      const item: ItemCarrinho = {
        produtoId: produto.id,
        titulo: produto.titulo,
        preco: produto.precoNormal,
        precoPromocional: produto.precoPromocional,
        capaUrl: produto.capaUrl,
        formato: fmt,
        tipoProduto: produto.tipoProduto,
      }
      adicionarItem(item)
    })

    setFormatosAdicionados(new Set(['pdf', 'epub']))
    const nomesFormatos = formatos.map((f) => f.toUpperCase()).join(' e ')
    toast.success('Adicionado ao carrinho!', {
      description: `${produto.titulo} (${nomesFormatos}) foram adicionados ao teu carrinho.`,
      action: {
        label: 'Ver Carrinho',
        onClick: () => navegarPara('carrinho'),
      },
    })
  }

  // Estado de carregamento
  if (carregando) {
    return <EsqueletoPaginaProduto />
  }

  // Estado de erro
  if (erro || !produto) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <BookOpen className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Produto não encontrado
        </h2>
        <p className="mb-6 max-w-md text-sm text-gray-500">{erro || 'O produto que procuras não existe ou foi removido.'}</p>
        <Button
          onClick={() => navegarPara('inicio')}
          variant="outline"
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Catálogo
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Botão Voltar */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => navegarPara('inicio')}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600 focus:outline-none sm:mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Catálogo
        </motion.button>

        {/* Layout principal - duas colunas no desktop */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:gap-12">
          {/* Coluna Esquerda - Imagem da Capa */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto w-full max-w-sm lg:mx-0"
          >
            <div className="overflow-hidden rounded-2xl shadow-xl shadow-emerald-900/10">
              {produto.capaUrl ? (
                <img
                  src={produto.capaUrl}
                  alt={`Capa de ${produto.titulo}`}
                  className="aspect-[3/4] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-3xl bg-emerald-100 p-6">
                      <BookOpen className="h-16 w-16 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-emerald-300">
                      Capa indisponível
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Badge de destaque abaixo da imagem */}
            {produto.destaque && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-2"
              >
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-amber-700">
                  Produto em Destaque
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Coluna Direita - Detalhes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Badges de tipo e categoria */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge
                className={`${coresTipo[produto.tipoProduto] || 'bg-gray-100 text-gray-700'} border-0 text-xs font-semibold`}
              >
                {etiquetasTipo[produto.tipoProduto] || produto.tipoProduto}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-xs text-gray-600">
                {produto.categoria.nome}
              </Badge>
            </div>

            {/* Título */}
            <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
              {produto.titulo}
            </h1>

            {/* Vendas */}
            <p className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
              <Download className="h-4 w-4" />
              {produto.vendasCount} {produto.vendasCount === 1 ? 'venda' : 'vendas'}
            </p>

            <Separator className="mb-6" />

            {/* Preço */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                {temPromocao && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatarPreco(produto.precoNormal)}
                  </span>
                )}
                <span className="text-3xl font-bold text-emerald-600">
                  {formatarPreco(precoFinal)}
                </span>
              </div>
              {temPromocao && desconto > 0 && (
                <Badge className="mt-2 border-0 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-50">
                  Economiza {desconto}% — poupa {formatarPreco(produto.precoNormal - produto.precoPromocional!)}
                </Badge>
              )}
            </div>

            {/* Seleção de Formato */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Formato de Download
              </h3>
              <div className="flex flex-wrap gap-3">
                {temPdf && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormatoSelecionado('pdf')}
                    className={`relative flex items-center gap-2.5 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all focus:outline-none ${
                      formatoSelecionado === 'pdf'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    } ${
                      estaNoCarrinho('pdf')
                        ? 'opacity-60'
                        : ''
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    PDF
                    {estaNoCarrinho('pdf') && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </motion.button>
                )}
                {temEpub && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormatoSelecionado('epub')}
                    className={`relative flex items-center gap-2.5 rounded-xl border-2 px-5 py-3 text-sm font-medium transition-all focus:outline-none ${
                      formatoSelecionado === 'epub'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    } ${
                      estaNoCarrinho('epub')
                        ? 'opacity-60'
                        : ''
                    }`}
                  >
                    <Book className="h-5 w-5" />
                    EPUB
                    {estaNoCarrinho('epub') && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <motion.div whileHover={{ scale: podeAdicionar ? 1.01 : 1 }} whileTap={{ scale: podeAdicionar ? 0.99 : 1 }} className="flex-1">
                <Button
                  size="lg"
                  onClick={lidarAdicionarAoCarrinho}
                  disabled={!podeAdicionar}
                  className={`h-12 w-full rounded-xl text-base font-semibold shadow-md transition-all ${
                    podeAdicionar
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200'
                      : 'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none'
                  }`}
                >
                  <ShoppingCart className={`mr-2 h-5 w-5 ${podeAdicionar ? '' : 'opacity-50'}`} />
                  {podeAdicionar
                    ? `Adicionar ao Carrinho — ${formatarPreco(precoFinal)}`
                    : 'Já no Carrinho'}
                </Button>
              </motion.div>

              {/* Opção de adicionar ambos os formatos */}
              {temAmbosFormatos && podeAdicionarAmbos && (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={lidarAdicionarAmbos}
                    className="h-12 rounded-xl border-emerald-200 text-sm font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Adicionar PDF + EPUB
                  </Button>
                </motion.div>
              )}
            </div>

                        {/* Programa de Afiliados (recolhido por defeito) */}
            {temComissaoAfiliado && (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={lidarCliqueAfiliacao}
                  aria-expanded={mostrarAfiliacao}
                  aria-controls="painel-afiliacao"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:w-auto"
                >
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  Afiliar-me a este produto
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${mostrarAfiliacao ? 'rotate-180' : ''}`}
                  />
                </button>
                <p className="mt-1.5 text-xs text-gray-500">
                  A comissão é só deste ebook. Noutros produtos a percentagem pode ser diferente.
                </p>

                {mostrarAfiliacao && estaAutenticado() && (
                  <motion.div
                    id="painel-afiliacao"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5"
                  >
                    {!eAfiliado() ? (
                      <div>
                        <p className="mb-3 text-sm text-gray-600">
                          Para ganhares comissão neste ebook, primeiro tens de ativar o
                          Programa de Afiliados. Depois, voltas aqui e copias o teu link.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => navegarPara('afiliado')}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          Tornar-me afiliado
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1 text-sm font-medium text-emerald-900">
                          Comissão deste produto
                        </p>
                        <p className="mb-3 text-sm text-gray-700">
                          Neste ebook ganhas <strong>{produto.comissaoAfiliado}%</strong> (≈{' '}
                          <strong>{formatarPreco(valorComissaoEstimado)}</strong>) por cada
                          venda confirmada através do teu link.
                        </p>
                        <p className="mb-3 text-xs text-gray-500">
                          Esta percentagem aplica-se apenas a este produto. Consulta cada
                          ebook para veres a comissão respectiva — noutros títulos pode ser
                          maior ou menor.
                        </p>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <div className="relative flex-1">
                            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                              readOnly
                              value={linkAfiliado}
                              onFocus={(e) => e.currentTarget.select()}
                              className="truncate rounded-lg border-emerald-200 bg-white pl-9 text-xs text-gray-600 sm:text-sm"
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={copiarLinkAfiliado}
                            disabled={!linkAfiliado}
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-700"
                          >
                            {linkCopiado ? (
                              <>
                                <Check className="mr-1.5 h-4 w-4" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1.5 h-4 w-4" />
                                Copiar link
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={partilharWhatsApp}
                            className="border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                          >
                            Partilhar no WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={partilharFacebook}
                            className="border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                          >
                            Partilhar no Facebook
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}
            <Separator className="my-6" />

            {/* Descrição Completa */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Descrição
              </h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {produto.descricao.split('\n').map((paragrafo, indice) => (
                  <p
                    key={indice}
                    className={`${indice > 0 ? 'mt-3' : ''} text-sm leading-relaxed`}
                  >
                    {paragrafo}
                  </p>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Perguntas Frequentes */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                Perguntas Frequentes
              </h3>
              <Accordion type="single" collapsible className="w-full">
                {PERGUNTAS_FREQUENTES.map((item, indice) => (
                  <AccordionItem key={indice} value={`faq-${indice}`}>
                    <AccordionTrigger className="text-left text-sm font-medium text-gray-800 hover:no-underline">
                      {item.pergunta}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-gray-600">
                      {item.resposta}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

// Esqueleto da página de produto durante carregamento
function EsqueletoPaginaProduto() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Botão voltar esqueleto */}
        <Skeleton className="mb-6 h-5 w-36 sm:mb-8" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr] lg:gap-12">
          {/* Esqueleto da imagem */}
          <div className="mx-auto w-full max-w-sm lg:mx-0">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          </div>

          {/* Esqueleto dos detalhes */}
          <div className="flex flex-col">
            <div className="mb-3 flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="mb-2 h-9 w-3/4" />
            <Skeleton className="mb-4 h-4 w-32" />
            <Skeleton className="mb-6 h-px w-full" />
            <Skeleton className="mb-2 h-9 w-40" />
            <Skeleton className="mb-6 h-6 w-56 rounded-full" />
            <Skeleton className="mb-3 h-4 w-36" />
            <div className="mb-6 flex gap-3">
              <Skeleton className="h-12 w-32 rounded-xl" />
              <Skeleton className="h-12 w-32 rounded-xl" />
            </div>
            <Skeleton className="mb-6 h-12 w-full rounded-xl" />
            <Skeleton className="mb-6 h-px w-full" />
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        </div>
      </main>
    </div>
  )
}
