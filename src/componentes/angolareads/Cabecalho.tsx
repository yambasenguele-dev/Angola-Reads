'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  ShoppingCart,
  User,
  Menu,
  Search,
  LogOut,
  Shield,
  UserCircle,
  Link2,
  X,
  Home,
  Info,
  Headphones,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarCarrinho } from '@/lojas/carrinho'
import { usarAutenticacao } from '@/lojas/autenticacao'

// Links de navegação principal
const linksNavegacao = [
  { etiqueta: 'Início', vista: 'inicio' as const, icone: Home },
  { etiqueta: 'Sobre', vista: 'sobre' as const, icone: Info },
  { etiqueta: 'Suporte', vista: 'suporte' as const, icone: Headphones },
]

export default function Cabecalho() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const vistaAtual = usarNavegacao((s) => s.vistaAtual)
  const quantidadeItens = usarCarrinho((s) => s.obterQuantidade())
  const utilizador = usarAutenticacao((s) => s.utilizador)
  const sair = usarAutenticacao((s) => s.sair)
  const eAdmin = usarAutenticacao((s) => s.eAdmin)()
  const router = useRouter()

  const [menuAberto, setMenuAberto] = useState(false)
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [pesquisaVisivel, setPesquisaVisivel] = useState(false)

  // Fechar o menu mobile ao navegar
  const lidarNavegacao = useCallback(
    (vista: 'inicio' | 'sobre' | 'suporte') => {
      navegarPara(vista)
      setMenuAberto(false)
    },
    [navegarPara]
  )

  // Submeter pesquisa ao carregar Enter
  const lidarPesquisa = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (termoPesquisa.trim()) {
        navegarPara('inicio')
        setMenuAberto(false)
        // Dispor evento personalizado para o catálogo capturar
        window.dispatchEvent(
          new CustomEvent('angolareads:pesquisa', {
            detail: { termo: termoPesquisa.trim() },
          })
        )
        setTermoPesquisa('')
        setPesquisaVisivel(false)
      }
    },
    [termoPesquisa, navegarPara]
  )

  // Lidar com saída da conta
  const lidarSair = useCallback(() => {
    sair()
    navegarPara('inicio')
  }, [sair, navegarPara])

  // Fechar pesquisa ao clicar fora
  useEffect(() => {
    const fecharAoClicarFora = (e: MouseEvent) => {
      const alvo = e.target as HTMLElement
      if (!alvo.closest('.area-pesquisa')) {
        setPesquisaVisivel(false)
      }
    }
    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  // Etiqueta do tipo de produto
  const etiquetaTipo = (tipo: string) => {
    switch (tipo) {
      case 'ebook':
        return 'Ebook'
      case 'bundle':
        return 'Pacote'
      case 'curso_limitado':
        return 'Curso'
      default:
        return tipo
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <motion.button
          onClick={() => navegarPara('inicio')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 focus:outline-none"
          aria-label="Ir para o início"
        >
          <BookOpen className="h-7 w-7 text-emerald-600" />
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            Angola<span className="text-teal-500">Reads</span>
          </span>
        </motion.button>

        {/* Navegação Desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {linksNavegacao.map((link) => {
            const Icone = link.icone
            const ativo = vistaAtual === link.vista
            return (
              <motion.button
                key={link.vista}
                onClick={() => lidarNavegacao(link.vista)}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none ${
                  ativo
                    ? 'text-emerald-700'
                    : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                <Icone className="h-4 w-4" />
                {link.etiqueta}
                {ativo && (
                  <motion.div
                    layoutId="indicador-navegacao"
                    className="absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </nav>

        {/* Ações à direita */}
        <div className="flex items-center gap-2">
          {/* Pesquisa Desktop */}
          <div className="area-pesquisa relative hidden md:block">
            <AnimatePresence>
              {pesquisaVisivel ? (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={lidarPesquisa}
                  className="overflow-hidden"
                >
                  <Input
                    type="text"
                    placeholder="Pesquisar ebooks..."
                    value={termoPesquisa}
                    onChange={(e) => setTermoPesquisa(e.target.value)}
                    className="h-9 w-full border-emerald-200 bg-emerald-50/50 pr-8 text-sm focus-visible:ring-emerald-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setPesquisaVisivel(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Fechar pesquisa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setPesquisaVisivel(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                  aria-label="Abrir pesquisa"
                >
                  <Search className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Ícone do Carrinho */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navegarPara('carrinho')}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
            aria-label={`Carrinho de compras, ${quantidadeItens} ${quantidadeItens === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingCart className="h-5 w-5" />
            <AnimatePresence>
              {quantidadeItens > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white"
                >
                  {quantidadeItens}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Menu do Utilizador Desktop */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                  aria-label="Menu do utilizador"
                >
                  <User className="h-5 w-5" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {utilizador ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900">
                          {utilizador.nomeCompleto}
                        </p>
                        <p className="text-xs text-gray-500">{utilizador.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => navegarPara('os-meus-ebooks')}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Os Meus Ebooks
                      </DropdownMenuItem>
                      {eAdmin && (
                        <DropdownMenuItem onClick={() => router.push('/Administrador-123')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Painel Admin
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navegarPara('afiliado')}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Programa de Afiliados
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={lidarSair} variant="destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => navegarPara('login')}>
                      <User className="mr-2 h-4 w-4" />
                      Entrar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navegarPara('registo')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Registar
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão Hamburger Mobile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuAberto(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 md:hidden focus:outline-none"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Menu Mobile via Sheet */}
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetContent side="left" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-left">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-bold text-emerald-700">
                Angola<span className="text-teal-500">Reads</span>
              </span>
            </SheetTitle>
            <SheetDescription>
              A tua livraria digital angolana
            </SheetDescription>
          </SheetHeader>

          {/* Pesquisa Mobile */}
          <form onSubmit={lidarPesquisa} className="px-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Pesquisar ebooks..."
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
                className="border-emerald-200 bg-emerald-50/50 pl-9 text-sm focus-visible:ring-emerald-400"
              />
            </div>
          </form>

          <Separator className="my-2" />

          {/* Links de Navegação Mobile */}
          <nav className="flex flex-col gap-1 px-2" aria-label="Navegação mobile">
            {linksNavegacao.map((link) => {
              const Icone = link.icone
              const ativo = vistaAtual === link.vista
              return (
                <button
                  key={link.vista}
                  onClick={() => lidarNavegacao(link.vista)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                    ativo
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <Icone className="h-5 w-5" />
                  {link.etiqueta}
                </button>
              )
            })}
          </nav>

          <Separator className="my-2" />

          {/* Ações Mobile */}
          <div className="flex flex-col gap-1 px-2">
            <button
              onClick={() => {
                navegarPara('carrinho')
                setMenuAberto(false)
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
            >
              <ShoppingCart className="h-5 w-5" />
              Carrinho
              {quantidadeItens > 0 && (
                <Badge className="ml-auto bg-amber-500 text-white hover:bg-amber-600">
                  {quantidadeItens}
                </Badge>
              )}
            </button>

            {utilizador ? (
              <>
                <button
                  onClick={() => {
                    navegarPara('os-meus-ebooks')
                    setMenuAberto(false)
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                >
                  <UserCircle className="h-5 w-5" />
                  Os Meus Ebooks
                </button>
                {eAdmin && (
                  <button
                    onClick={() => {
                      router.push('/Administrador-123')
                      setMenuAberto(false)
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                  >
                    <Shield className="h-5 w-5" />
                    Painel Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    navegarPara('afiliado')
                    setMenuAberto(false)
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus:outline-none"
                >
                  <Link2 className="h-5 w-5" />
                  Programa de Afiliados
                </button>
                <Separator className="my-2" />
                <button
                  onClick={() => {
                    lidarSair()
                    setMenuAberto(false)
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none"
                >
                  <LogOut className="h-5 w-5" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    navegarPara('login')
                    setMenuAberto(false)
                  }}
                  variant="outline"
                  className="mt-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                >
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
                <Button
                  onClick={() => {
                    navegarPara('registo')
                    setMenuAberto(false)
                  }}
                  className="mt-1 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  Registar
                </Button>
              </>
            )}
          </div>

          {/* Info do utilizador logado no mobile */}
          {utilizador && (
            <>
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {utilizador.nomeCompleto}
                </p>
                <p className="text-xs text-gray-500">{utilizador.email}</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </motion.header>
  )
}