"use client"

import { ArrowLeft, BookOpen, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usarAutenticacao } from "@/lojas/autenticacao"
import { usarNavegacao } from "@/lojas/navegacao"

// Painel do Publisher.
// A conta tem a permissão "podePublicar", mas as ferramentas de publicação
// (gestão de ebooks e vendas) ainda não existem neste projecto. Este ecrã
// protege o acesso e informa o utilizador, sem expor nada a quem não tem permissão.
export default function PainelPublisher() {
  const utilizador = usarAutenticacao((s) => s.utilizador)
  const carregando = usarAutenticacao((s) => s.carregando)
  const navegarPara = usarNavegacao((s) => s.navegarPara)

  if (carregando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  const voltar = (
    <button
      type="button"
      onClick={() => navegarPara("inicio")}
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600"
    >
      <ArrowLeft className="h-4 w-4" />
      Voltar ao catálogo
    </button>
  )

  // Sem sessão
  if (!utilizador) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12 text-center">
        {voltar}
        <Lock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Painel do Publisher</h1>
        <p className="mt-2 text-sm text-gray-500">
          Inicia sessão para aceder a esta área.
        </p>
        <Button
          onClick={() => navegarPara("login")}
          className="mt-5 bg-emerald-600 hover:bg-emerald-700"
        >
          Entrar na conta
        </Button>
      </div>
    )
  }

  // Com sessão mas sem permissão
  if (!utilizador.podePublicar) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-12 text-center">
        {voltar}
        <Lock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
        <h1 className="text-xl font-bold text-gray-900">Área reservada a publishers</h1>
        <p className="mt-2 text-sm text-gray-500">
          A tua conta ainda não tem permissão para publicar ebooks. Se queres vender os
          teus livros na AngolaReads, fala com o nosso suporte.
        </p>
        <Button
          onClick={() => navegarPara("suporte")}
          className="mt-5 bg-emerald-600 hover:bg-emerald-700"
        >
          Falar com o suporte
        </Button>
      </div>
    )
  }

  // Publisher autorizado
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      {voltar}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center sm:p-8">
        <BookOpen className="mx-auto mb-3 h-9 w-9 text-emerald-600" />
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Painel do Publisher
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Olá, {utilizador.nomeCompleto}. A tua conta tem permissão para publicar.
          As ferramentas de gestão de ebooks e de vendas estão a ser preparadas e
          vão aparecer aqui. Até lá, o nosso suporte trata de qualquer publicação por ti.
        </p>
        <Button
          onClick={() => navegarPara("suporte")}
          className="mt-5 bg-emerald-600 hover:bg-emerald-700"
        >
          Falar com o suporte
        </Button>
      </div>
    </div>
  )
}
