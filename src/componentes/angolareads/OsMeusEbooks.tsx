'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Download,
  LogIn,
  PackageOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  BookX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { formatarPreco } from '@/lib/autenticacao'

// ============================================================
// Tipos dos dados recebidos da API
// ============================================================

interface ProdutoPedido {
  titulo: string
  formato: 'pdf' | 'epub'
  ficheiroPdf: string | null
  ficheiroEpub: string | null
}

interface Pedido {
  id: string
  referencia: string
  estado: string
  total: number
  criadoEm: string
  produtos: ProdutoPedido[]
  comprovativo?: { estado: string } | null
}

// Mapeamento de estados para cores e etiquetas
const ESTADOS_PEDIDO: Record<
  string,
  { etiqueta: string; cor: string; icone: React.ElementType }
> = {
  pago: {
    etiqueta: 'Pago',
    cor: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
    icone: CheckCircle2,
  },
  pendente: {
    etiqueta: 'Pendente',
    cor: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    icone: Clock,
  },
  rejeitado: {
    etiqueta: 'Rejeitado',
    cor: 'bg-red-100 text-red-700 hover:bg-red-100',
    icone: XCircle,
  },
  cancelado: {
    etiqueta: 'Cancelado',
    cor: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    icone: XCircle,
  },
}

export default function OsMeusEbooks() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const { estaAutenticado, carregando: carregandoAuth } = usarAutenticacao()

  const [pedidos, definirPedidos] = useState<Pedido[]>([])
  const [aCarregar, definirACarregar] = useState(true)
  const [erro, definirErro] = useState<string | null>(null)

  // Buscar pedidos do utilizador
  const buscarPedidos = async () => {
    definirACarregar(true)
    definirErro(null)

    try {
      const resposta = await fetch('/api/pedidos')

      if (!resposta.ok) {
        throw new Error('Erro ao carregar os teus pedidos')
      }

      const dados = await resposta.json()
      definirPedidos(dados.pedidos || dados || [])
    } catch (err) {
      definirErro(
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado.'
      )
    } finally {
      definirACarregar(false)
    }
  }

  useEffect(() => {
    if (!carregandoAuth && estaAutenticado()) {
      buscarPedidos()
    }
  }, [carregandoAuth, estaAutenticado])

  // Formatar data
  const formatarData = (dataIso: string) => {
    try {
      return new Date(dataIso).toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return dataIso
    }
  }

  // Filtrar apenas pedidos pagos (para downloads)
  const pedidosPagos = pedidos.filter((p) => p.estado === 'pago')
  const temDownloads = pedidosPagos.length > 0

  // Estado de carregamento inicial
  if (carregandoAuth) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </section>
    )
  }

  // Utilizador não autenticado
  if (!estaAutenticado()) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Os Meus Ebooks
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Acede aos teus ebooks e Downloads
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-20"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <LogIn className="h-10 w-10 text-emerald-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">
            Inicia Sessão
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
            Precisas de estar autenticado para ver os teus ebooks e fazer
            downloads.
          </p>
          <Button
            onClick={() => navegarPara('login')}
            className="rounded-xl bg-emerald-600 px-8 py-2.5 font-medium text-white hover:bg-emerald-700"
          >
            Iniciar Sessão
          </Button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <PackageOpen className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Os Meus Ebooks
            </h1>
            <p className="text-sm text-gray-500">
              {aCarregar
                ? 'A carregar os teus pedidos...'
                : `${pedidos.length} ${pedidos.length === 1 ? 'pedido' : 'pedidos'} no total`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Estado de Carregamento */}
      {aCarregar && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      )}

      {/* Erro */}
      {!aCarregar && erro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <XCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm font-medium text-red-700">{erro}</p>
          <Button
            variant="outline"
            onClick={buscarPedidos}
            className="mt-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
        </motion.div>
      )}

      {/* Estado Vazio - Sem pedidos */}
      {!aCarregar && !erro && pedidos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-20"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
            <BookX className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800">
            Sem compras ainda
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
            Ainda não fizeste nenhuma compra. Explora o nosso catálogo e
            encontra os teus próximos ebooks!
          </p>
          <Button
            onClick={() => navegarPara('inicio')}
            className="rounded-xl bg-emerald-600 px-8 py-2.5 font-medium text-white hover:bg-emerald-700"
          >
            Explorar Catálogo
          </Button>
        </motion.div>
      )}

      {/* Lista de Pedidos */}
      {!aCarregar && !erro && pedidos.length > 0 && (
        <div className="space-y-6">
          {pedidos.map((pedido, indicePedido) => {
            const estadoInfo = ESTADOS_PEDIDO[pedido.estado] || {
              etiqueta: pedido.estado,
              cor: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
              icone: Clock,
            }
            const IconeEstado = estadoInfo.icone
            const estaPago = pedido.estado === 'pago'
            const emAnalise = pedido.estado === 'pendente' && !!pedido.comprovativo

            return (
              <motion.div
                key={pedido.id || pedido.referencia}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(indicePedido * 0.08, 0.3),
                }}
              >
                <Card className="overflow-hidden border-gray-100 shadow-sm">
                  {/* Cabeçalho do Pedido */}
                  <div className="flex flex-col gap-3 border-b border-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        {pedido.referencia}
                      </span>
                      <Badge
                        className={`${estadoInfo.cor} border-0 px-2.5 py-0.5 text-[11px] font-semibold`}
                      >
                        <IconeEstado className="mr-1 h-3 w-3" />
                        {estadoInfo.etiqueta}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {formatarData(pedido.criadoEm)}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {formatarPreco(pedido.total)}
                      </span>
                      {estaPago && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 rounded-lg text-xs font-medium"
                          onClick={() =>
                            window.open(`/api/pedidos/${pedido.id}/recibo`, '_blank')
                          }
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Recibo
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Produtos do Pedido */}
                  <CardContent className="p-5">
                    <div className="space-y-4">
                      {pedido.produtos?.map(
                        (produto, indiceProduto) => (
                          <div
                            key={`${pedido.id}-produto-${indiceProduto}`}
                            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {/* Ícone do formato */}
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                  produto.formato === 'pdf'
                                    ? 'bg-red-50'
                                    : 'bg-purple-50'
                                }`}
                              >
                                {produto.formato === 'pdf' ? (
                                  <FileText
                                    className={`h-5 w-5 ${
                                      produto.formato === 'pdf'
                                        ? 'text-red-500'
                                        : 'text-purple-500'
                                    }`}
                                  />
                                ) : (
                                  <BookOpen className="h-5 w-5 text-purple-500" />
                                )}
                              </div>

                              {/* Informações do produto */}
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {produto.titulo}
                                </p>
                                <Badge
                                  className={`mt-1 ${
                                    produto.formato === 'pdf'
                                      ? 'bg-red-50 text-red-500 hover:bg-red-50'
                                      : 'bg-purple-50 text-purple-500 hover:bg-purple-50'
                                  } border-0 px-1.5 py-0 text-[10px] font-semibold`}
                                >
                                  {produto.formato.toUpperCase()}
                                </Badge>
                              </div>
                            </div>

                            {/* Botões de Download (apenas para pedidos pagos) */}
                            {estaPago && (
                              <div className="flex shrink-0 gap-2 sm:ml-4">
                                {produto.ficheiroPdf && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 rounded-lg border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => {
                                      const caminho = produto.ficheiroPdf
                                      window.open(
                                        `/api/downloads?ficheiro=${encodeURIComponent(caminho)}`,
                                        '_blank'
                                      )
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    PDF
                                  </Button>
                                )}
                                {produto.ficheiroEpub && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 rounded-lg border-purple-200 text-xs font-medium text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                                    onClick={() => {
                                      const caminho = produto.ficheiroEpub
                                      window.open(
                                        `/api/downloads?ficheiro=${encodeURIComponent(caminho)}`,
                                        '_blank'
                                      )
                                    }}
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    EPUB
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Mensagem quando pedido pago sem ficheiros */}
                      {estaPago &&
                        pedido.produtos?.every(
                          (p) => !p.ficheiroPdf && !p.ficheiroEpub
                        ) && (
                          <p className="text-center text-xs text-gray-400">
                            Os ficheiros de download ainda não estão disponíveis.
                            Contacta o suporte se precisares de ajuda.
                          </p>
                        )}

                      {/* Mensagem quando pedido não está pago */}
                      {!estaPago && pedido.estado === 'pendente' && (
                        <p className="text-center text-xs text-amber-600">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {emAnalise
                            ? 'Comprovativo recebido — o teu pagamento está em análise. Normalmente confirmamos em poucas horas.'
                            : 'A aguardar o envio do comprovativo de pagamento.'}
                        </p>
                      )}
                      {pedido.estado === 'rejeitado' && (
                        <p className="text-center text-xs text-red-600">
                          <XCircle className="mr-1 inline h-3 w-3" />
                          Não foi possível confirmar este pagamento. Contacta o
                          suporte se precisares de ajuda.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Separador antes da secção de downloads rápidos */}
          {temDownloads && (
            <>
              <Separator className="my-2" />

              {/* Secção de Downloads Rápidos - Apenas PDFs e EPUBs de pedidos pagos */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                      <Download className="h-5 w-5 text-emerald-600" />
                      Downloads Disponíveis
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {pedidosPagos.flatMap((pedido) =>
                        (pedido.produtos || []).map(
                          (produto, indice) => {
                            const temPdf = !!produto.ficheiroPdf
                            const temEpub = !!produto.ficheiroEpub
                            if (!temPdf && !temEpub) return null

                            return (
                              <div
                                key={`download-${pedido.id}-${indice}`}
                                className="flex items-center justify-between rounded-lg border border-white bg-white p-3 shadow-sm"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-800">
                                    {produto.titulo}
                                  </p>
                                  <div className="mt-1 flex gap-1.5">
                                    {temPdf && (
                                      <Badge className="border-0 bg-red-50 px-1.5 py-0 text-[10px] font-semibold text-red-500 hover:bg-red-50">
                                        PDF
                                      </Badge>
                                    )}
                                    {temEpub && (
                                      <Badge className="border-0 bg-purple-50 px-1.5 py-0 text-[10px] font-semibold text-purple-500 hover:bg-purple-50">
                                        EPUB
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="ml-3 flex shrink-0 gap-1.5">
                                  {temPdf && (
                                    <Button
                                      size="sm"
                                      className="h-8 gap-1 rounded-lg bg-red-500 px-3 text-[11px] font-medium text-white hover:bg-red-600"
                                      onClick={() => {
                                        window.open(
                                          `/api/downloads?ficheiro=${encodeURIComponent(produto.ficheiroPdf!)}`,
                                          '_blank'
                                        )
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        PDF
                                      </span>
                                    </Button>
                                  )}
                                  {temEpub && (
                                    <Button
                                      size="sm"
                                      className="h-8 gap-1 rounded-lg bg-purple-500 px-3 text-[11px] font-medium text-white hover:bg-purple-600"
                                      onClick={() => {
                                        window.open(
                                          `/api/downloads?ficheiro=${encodeURIComponent(produto.ficheiroEpub!)}`,
                                          '_blank'
                                        )
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        EPUB
                                      </span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          }
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
