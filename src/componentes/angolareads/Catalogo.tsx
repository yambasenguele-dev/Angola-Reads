'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, BookOpen, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import CartaoProduto from './CartaoProduto'

// Tipo do produto retornado pela API
interface CategoriaApi {
  id: string
  nome: string
  slug: string
}

interface ProdutoApi {
  id: string
  titulo: string
  descricaoCurta: string | null
  capaUrl: string | null
  precoNormal: number
  precoPromocional: number | null
  tipoProduto: string
  destaque: boolean
  categoria: {
    nome: string
    slug: string
  }
}

export default function Catalogo() {
  const [categorias, setCategorias] = useState<CategoriaApi[]>([])
  const [produtos, setProdutos] = useState<ProdutoApi[]>([])
  const [produtosDestaque, setProdutosDestaque] = useState<ProdutoApi[]>([])
  const [carregandoCategorias, setCarregandoCategorias] = useState(true)
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [carregandoDestaque, setCarregandoDestaque] = useState(true)
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [termoPesquisaAtivo, setTermoPesquisaAtivo] = useState('')

  // Buscar categorias da API
  useEffect(() => {
    const buscarCategorias = async () => {
      try {
        const resposta = await fetch('/api/categorias')
        if (resposta.ok) {
          const dados = await resposta.json()
          setCategorias(dados.categorias || dados || [])
        }
      } catch {
        // Silencioso - a lista fica vazia
      } finally {
        setCarregandoCategorias(false)
      }
    }
    buscarCategorias()
  }, [])

  // Buscar produtos em destaque
  useEffect(() => {
    const buscarDestaque = async () => {
      try {
        const resposta = await fetch('/api/produtos?destaque=true')
        if (resposta.ok) {
          const dados = await resposta.json()
          setProdutosDestaque(dados.produtos || dados || [])
        }
      } catch {
        // Silencioso
      } finally {
        setCarregandoDestaque(false)
      }
    }
    buscarDestaque()
  }, [])

  // Buscar todos os produtos (com filtros)
  const buscarProdutos = useCallback(async () => {
    setCarregandoProdutos(true)
    try {
      const parametros = new URLSearchParams()
      if (categoriaSelecionada) {
        parametros.set('categoria', categoriaSelecionada)
      }
      if (termoPesquisaAtivo) {
        parametros.set('pesquisa', termoPesquisaAtivo)
      }
      const query = parametros.toString()
      const resposta = await fetch(`/api/produtos${query ? `?${query}` : ''}`)
      if (resposta.ok) {
        const dados = await resposta.json()
        setProdutos(dados.produtos || dados || [])
      }
    } catch {
      // Silencioso
    } finally {
      setCarregandoProdutos(false)
    }
  }, [categoriaSelecionada, termoPesquisaAtivo])

  useEffect(() => {
    buscarProdutos()
  }, [buscarProdutos])

  // Ouvir evento de pesquisa do cabeçalho
  useEffect(() => {
    const lidarPesquisaExterna = (e: Event) => {
      const detalhe = (e as CustomEvent).detail as { termo: string }
      if (detalhe?.termo) {
        setTermoPesquisa(detalhe.termo)
        setTermoPesquisaAtivo(detalhe.termo)
        setCategoriaSelecionada(null)
      }
    }
    window.addEventListener('angolareads:pesquisa', lidarPesquisaExterna)
    return () => window.removeEventListener('angolareads:pesquisa', lidarPesquisaExterna)
  }, [])

  // Submeter pesquisa local
  const lidarPesquisa = (e: React.FormEvent) => {
    e.preventDefault()
    setTermoPesquisaAtivo(termoPesquisa)
    setCategoriaSelecionada(null)
  }

  // Limpar filtros
  const limparFiltros = () => {
    setCategoriaSelecionada(null)
    setTermoPesquisa('')
    setTermoPesquisaAtivo('')
  }

  // Filtrar produtos em destaque que não estejam nos produtos gerais (quando sem filtros)
  const idsProdutosGerais = new Set(produtos.map((p) => p.id))
  const destaqueFiltrado =
    !termoPesquisaAtivo && !categoriaSelecionada
      ? produtosDestaque.filter((p) => !idsProdutosGerais.has(p.id))
      : []

  // Seções a mostrar
  const mostrarDestaque = destaqueFiltrado.length > 0
  const mostrarFiltrosAtivos = termoPesquisaAtivo || categoriaSelecionada

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Seção Hero com gradiente */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700">
        {/* Elementos decorativos de fundo */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-amber-400/5 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              Livraria digital angolana
            </motion.div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              Descobre ebooks que{' '}
              <span className="bg-gradient-to-r from-amber-200 to-amber-300 bg-clip-text text-transparent">
                transformam
              </span>{' '}
              a tua vida
            </h1>

            <p className="mb-8 text-base leading-relaxed text-emerald-100 sm:text-lg">
              Acesso imediato a centenas de ebooks em português. Aprende, cresce e
              transforma o teu conhecimento com a AngolaReads.
            </p>

            {/* Barra de pesquisa no hero */}
            <form onSubmit={lidarPesquisa} className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Pesquisar por título, autor ou tema..."
                  value={termoPesquisa}
                  onChange={(e) => setTermoPesquisa(e.target.value)}
                  className="h-12 w-full rounded-xl border-0 bg-white pl-12 pr-4 text-sm shadow-lg shadow-black/10 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-amber-300"
                />
                <Button
                  type="submit"
                  className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-amber-500 px-5 text-sm font-medium text-white hover:bg-amber-600"
                >
                  Pesquisar
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Onda decorativa na base do hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 60V20C240 0 480 40 720 30C960 20 1200 0 1440 20V60H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Filtros de Categorias */}
        <section className="-mt-4 mb-8 sm:-mt-2 sm:mb-10">
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="hidden h-4 w-4 flex-shrink-0 text-gray-400 sm:block" />
            {carregandoCategorias ? (
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-20 rounded-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCategoriaSelecionada(null)}
                    className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                      categoriaSelecionada === null
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    Todos
                  </motion.button>
                  {categorias.map((cat) => (
                    <motion.button
                      key={cat.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setCategoriaSelecionada(
                          categoriaSelecionada === cat.slug ? null : cat.slug
                        )
                      }}
                      className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
                        categoriaSelecionada === cat.slug
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-gray-600 shadow-sm ring-1 ring-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {cat.nome}
                    </motion.button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="h-1.5" />
              </ScrollArea>
            )}
          </div>

          {/* Indicador de filtros ativos */}
          <AnimatePresence>
            {mostrarFiltrosAtivos && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex flex-wrap items-center gap-2"
              >
                <span className="text-xs text-gray-500">Filtros ativos:</span>
                {termoPesquisaAtivo && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  >
                    &ldquo;{termoPesquisaAtivo}&rdquo;
                    <button
                      onClick={() => {
                        setTermoPesquisa('')
                        setTermoPesquisaAtivo('')
                      }}
                      className="ml-1 rounded-full p-0.5 hover:bg-emerald-100"
                      aria-label="Remover filtro de pesquisa"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoriaSelecionada && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                  >
                    {categorias.find((c) => c.slug === categoriaSelecionada)?.nome ||
                      categoriaSelecionada}
                    <button
                      onClick={() => setCategoriaSelecionada(null)}
                      className="ml-1 rounded-full p-0.5 hover:bg-emerald-100"
                      aria-label="Remover filtro de categoria"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={limparFiltros}
                  className="text-xs font-medium text-gray-500 underline decoration-dotted underline-offset-2 hover:text-gray-700"
                >
                  Limpar tudo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Produtos em Destaque */}
        {mostrarDestaque && (
          <section className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 flex items-center gap-3"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  Em Destaque
                </h2>
                <p className="text-xs text-gray-500">
                  Seleção especial para ti
                </p>
              </div>
            </motion.div>

            {carregandoDestaque ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <EsqueletoCartao key={`destaque-${i}`} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {destaqueFiltrado.map((produto, indice) => (
                  <CartaoProduto
                    key={produto.id}
                    produto={produto}
                    indice={indice}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Catálogo Completo */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 flex items-center gap-3"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
              <BookOpen className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                {mostrarFiltrosAtivos ? 'Resultados da Pesquisa' : 'Todos os Ebooks'}
              </h2>
              {!carregandoProdutos && (
                <p className="text-xs text-gray-500">
                  {produtos.length}{' '}
                  {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                </p>
              )}
            </div>
          </motion.div>

          {/* Estado de carregamento */}
          {carregandoProdutos ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EsqueletoCartao key={`produto-${i}`} />
              ))}
            </div>
          ) : produtos.length === 0 ? (
            /* Estado vazio */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Nenhum produto encontrado
              </h3>
              <p className="mb-6 max-w-sm text-sm text-gray-500">
                Não conseguimos encontrar ebooks com os filtros selecionados.
                Tenta pesquisar com outros termos ou limpar os filtros.
              </p>
              <Button
                onClick={limparFiltros}
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Ver todos os ebooks
              </Button>
            </motion.div>
          ) : (
            /* Grelha de produtos */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {produtos.map((produto, indice) => (
                  <CartaoProduto
                    key={produto.id}
                    produto={produto}
                    indice={indice}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

// Componente de esqueleto para o cartão de produto
function EsqueletoCartao() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex-1" />
        <div className="flex items-end justify-between">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}