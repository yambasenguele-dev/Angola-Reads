import type { Metadata } from 'next'
import Link from 'next/link'

// 404 real (status HTTP 404): o Google remove do índice páginas inexistentes
// ou ebooks desactivados, e o visitante tem sempre para onde ir.
export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: true },
}

export default function PaginaNaoEncontrada() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Erro 404</p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
        Esta página não existe
      </h1>
      <p className="mt-3 max-w-md text-gray-500">
        O ebook ou a página que procuras pode ter sido removido ou o endereço está incorrecto.
        Vê o nosso catálogo e encontra o próximo livro para ler.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Ver todos os ebooks
        </Link>
        <Link
          href="/suporte"
          className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Falar com o suporte
        </Link>
      </div>
    </main>
  )
}
