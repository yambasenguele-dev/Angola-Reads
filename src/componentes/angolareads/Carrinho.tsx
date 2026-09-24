'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { BookX, Trash2, BookOpen, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { usarCarrinho } from '@/lojas/carrinho'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarAutenticacao } from '@/lojas/autenticacao'
import { formatarPreco } from '@/lib/autenticacao'

// Variantes de animação para entrada e saída dos itens
const variantesItem = {
  entrada: { opacity: 1, x: 0, height: 'auto', marginBottom: 12 },
  saida: {
    opacity: 0,
    x: -80,
    height: 0,
    marginBottom: 0,
    overflow: 'hidden',
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
}

export default function Carrinho() {
  const { itens, removerItem, obterTotal } = usarCarrinho()
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const estaAutenticado = usarAutenticacao((s) => s.estaAutenticado)()
  const utilizador = usarAutenticacao((s) => s.utilizador)

  const total = obterTotal()
  const carrinhoVazio = itens.length === 0

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Cabeçalho da Página */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <ShoppingBag className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Carrinho de Compras
            </h1>
            <p className="text-sm text-gray-500">
              {carrinhoVazio
                ? 'Nenhum item adicionado'
                : `${itens.length} ${itens.length === 1 ? 'item' : 'itens'} no teu carrinho`}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Estado Vazio do Carrinho */}
      {carrinhoVazio ? (
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
            O teu carrinho está vazio
          </h2>
          <p className="mb-8 max-w-sm text-center text-sm text-gray-500">
            Parece que ainda não adicionaste nenhum ebook ao teu carrinho.
            Explora o nosso catálogo e encontra algo interessante!
          </p>
          <Button
            onClick={() => navegarPara('inicio')}
            className="rounded-xl bg-emerald-600 px-8 py-2.5 font-medium text-white hover:bg-emerald-700"
          >
            Explorar Catálogo
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Lista de Itens - Lado Esquerdo (2/3) */}
          <div className="lg:col-span-2">
            {/* Alerta se não autenticado */}
            {!estaAutenticado && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="flex items-center gap-2 text-sm text-amber-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 shrink-0"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Precisas de estar autenticado para finalizar a compra.{' '}
                    <button
                      type="button"
                      onClick={() => navegarPara('login')}
                      className="font-semibold underline underline-offset-2 hover:text-amber-900"
                    >
                      Iniciar sessão
                    </button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
              {/* Cabeçalho da lista (desktop) */}
              <div className="hidden border-b border-gray-100 px-6 py-3 sm:grid sm:grid-cols-[1fr_100px_120px_44px] sm:items-center sm:gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Produto
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Formato
                </span>
                <span className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Preço
                </span>
                <span className="w-11" />
              </div>

              {/* Lista de Itens com Animação */}
              <div className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {itens.map((item) => {
                    const precoAtual = item.precoPromocional ?? item.preco
                    const temPromocao =
                      item.precoPromocional !== null && item.precoPromocional > 0

                    return (
                      <motion.div
                        key={`${item.produtoId}-${item.formato}`}
                        layout
                        variants={variantesItem}
                        initial="entrada"
                        exit="saida"
                        transition={{ duration: 0.3 }}
                        className="px-4 py-4 sm:px-6"
                      >
                        <div className="flex items-center gap-4 sm:grid sm:grid-cols-[1fr_100px_120px_44px] sm:items-center sm:gap-4">
                          {/* Miniatura + Título */}
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            {/* Capa em miniatura */}
                            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:h-20 sm:w-14">
                              {item.capaUrl ? (
                                <img
                                  src={item.capaUrl}
                                  alt={`Capa de ${item.titulo}`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                                  <BookOpen className="h-5 w-5 text-emerald-400" />
                                </div>
                              )}
                            </div>

                            {/* Informações do produto */}
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold text-gray-900">
                                {item.titulo}
                              </h3>
                              {/* Formato no mobile */}
                              <div className="mt-1 sm:hidden">
                                <Badge
                                  className={`${
                                    item.formato === 'pdf'
                                      ? 'bg-red-50 text-red-600 hover:bg-red-50'
                                      : 'bg-purple-50 text-purple-600 hover:bg-purple-50'
                                  } border-0 text-[10px] font-semibold`}
                                >
                                  {item.formato.toUpperCase()}
                                </Badge>
                              </div>
                              {/* Preço no mobile */}
                              <div className="mt-1 sm:hidden">
                                {temPromocao && (
                                  <span className="mr-2 text-xs text-gray-400 line-through">
                                    {formatarPreco(item.preco)}
                                  </span>
                                )}
                                <span
                                  className={`text-sm font-bold ${temPromocao ? 'text-emerald-600' : 'text-gray-900'}`}
                                >
                                  {formatarPreco(precoAtual)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Formato (desktop) */}
                          <div className="hidden sm:block">
                            <Badge
                              className={`${
                                item.formato === 'pdf'
                                  ? 'bg-red-50 text-red-600 hover:bg-red-50'
                                  : 'bg-purple-50 text-purple-600 hover:bg-purple-50'
                              } border-0 text-[11px] font-semibold`}
                            >
                              {item.formato.toUpperCase()}
                            </Badge>
                          </div>

                          {/* Preço (desktop) */}
                          <div className="hidden text-right sm:block">
                            {temPromocao && (
                              <span className="mr-1 block text-xs text-gray-400 line-through">
                                {formatarPreco(item.preco)}
                              </span>
                            )}
                            <span
                              className={`text-sm font-bold ${temPromocao ? 'text-emerald-600' : 'text-gray-900'}`}
                            >
                              {formatarPreco(precoAtual)}
                            </span>
                          </div>

                          {/* Botão Remover */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            onClick={() =>
                              removerItem(item.produtoId, item.formato)
                            }
                            aria-label={`Remover ${item.titulo} do carrinho`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido - Lado Direito (1/3) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className="sticky top-24 border-gray-100 shadow-sm">
                <CardContent className="p-6">
                  <h2 className="mb-5 text-lg font-bold text-gray-900">
                    Resumo do Pedido
                  </h2>

                  {/* Lista resumida de itens */}
                  <div className="mb-4 max-h-48 space-y-3 overflow-y-auto pr-1">
                    {itens.map((item) => {
                      const precoAtual = item.precoPromocional ?? item.preco
                      return (
                        <div
                          key={`${item.produtoId}-${item.formato}`}
                          className="flex items-start justify-between gap-2"
                        >
                          <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
                            {item.titulo}
                            <span className="ml-1 text-xs text-gray-400">
                              ({item.formato.toUpperCase()})
                            </span>
                          </p>
                          <span className="shrink-0 text-sm font-medium text-gray-800">
                            {formatarPreco(precoAtual)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="my-4" />

                  {/* Subtotal */}
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatarPreco(total)}
                    </span>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="mb-6 flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-emerald-600">
                      {formatarPreco(total)}
                    </span>
                  </div>

                  {/* Botão Finalizar Compra */}
                  <Button
                    className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                    onClick={() => navegarPara('checkout')}
                  >
                    Finalizar Compra
                  </Button>

                  {/* Botão Continuar a Comprar */}
                  <Button
                    variant="outline"
                    className="mt-3 w-full rounded-xl border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => navegarPara('inicio')}
                  >
                    Continuar a Comprar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </section>
  )
}
