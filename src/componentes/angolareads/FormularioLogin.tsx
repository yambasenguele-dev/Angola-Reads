'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { usarNavegacao } from '@/lojas/navegacao'
import { usarAutenticacao, type UtilizadorAtual } from '@/lojas/autenticacao'

// Variantes de animação do formulário
const variantesFormulario = {
  oculto: { opacity: 0, y: 20 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function FormularioLogin() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const voltar = usarNavegacao((s) => s.voltar)
  const definirUtilizador = usarAutenticacao((s) => s.definirUtilizador)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Submeter formulário de login
  const lidarSubmissao = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      // Validação básica
      if (!email.trim()) {
        toast.error('O campo de email é obrigatório.')
        return
      }
      if (!senha) {
        toast.error('O campo de palavra-passe é obrigatório.')
        return
      }

      setCarregando(true)

      try {
        const resposta = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), senha }),
        })

        const dados = await resposta.json()

        if (!resposta.ok) {
          toast.error(dados.erro || 'Credenciais inválidas. Tenta novamente.')
          return
        }

        // Definir utilizador autenticado na store
        // (a sessão em si já está guardada em cookies pelo Supabase Auth)
        const utilizador: UtilizadorAtual = {
          id: dados.utilizador.id,
          email: dados.utilizador.email,
          nomeCompleto: dados.utilizador.nomeCompleto,
          isAdmin: dados.utilizador.isAdmin,
        }
        definirUtilizador(utilizador)

        toast.success(`Bem-vindo de volta, ${utilizador.nomeCompleto}!`)
        navegarPara('inicio')
      } catch {
        toast.error('Erro de ligação. Verifica a tua conexão e tenta novamente.')
      } finally {
        setCarregando(false)
      }
    },
    [email, senha, definirUtilizador, navegarPara]
  )

  return (
    <motion.section
      variants={variantesFormulario}
      initial="oculto"
      animate="visivel"
      className="flex min-h-[70vh] items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-md">
        {/* Botão voltar */}
        <Button
          variant="ghost"
          onClick={voltar}
          className="mb-6 gap-2 text-gray-500 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Card className="border-emerald-100 shadow-lg shadow-emerald-100/40">
          <CardHeader className="pb-4 text-center">
            <motion.div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50"
              whileHover={{ scale: 1.05 }}
            >
              <BookOpen className="h-7 w-7 text-emerald-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Entrar na tua conta
            </CardTitle>
            <CardDescription className="text-gray-500">
              Acede aos teus ebooks e conteúdo exclusivo
            </CardDescription>
          </CardHeader>

          <form onSubmit={lidarSubmissao}>
            <CardContent className="flex flex-col gap-4">
              {/* Campo de email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email-login" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={carregando}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Campo de senha */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="senha-login" className="text-sm font-medium text-gray-700">
                  Palavra-passe
                </Label>
                <Input
                  id="senha-login"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Link para recuperar senha */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navegarPara('recuperar-senha')}
                  className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 hover:underline focus:outline-none"
                >
                  Esqueceste a tua senha?
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Botão de entrada */}
              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400"
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A entrar...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>

              {/* Link para registo */}
              <p className="text-center text-sm text-gray-500">
                Ainda não tens conta?{' '}
                <button
                  type="button"
                  onClick={() => navegarPara('registo')}
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline focus:outline-none"
                >
                  Regista-te
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </motion.section>
  )
}
