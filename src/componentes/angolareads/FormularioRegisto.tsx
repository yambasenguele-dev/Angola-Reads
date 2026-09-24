'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, BookOpen, Check, X } from 'lucide-react'
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

export default function FormularioRegisto() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const voltar = usarNavegacao((s) => s.voltar)
  const definirUtilizador = usarAutenticacao((s) => s.definirUtilizador)

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaConfirmacao, setSenhaConfirmacao] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Validações da senha
  const senhaTemMinimo = senha.length >= 6
  const senhasConferem = senha.length > 0 && senha === senhaConfirmacao

  // Submeter formulário de registo
  const lidarSubmissao = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      // Validação do nome
      if (!nomeCompleto.trim()) {
        toast.error('O campo de nome completo é obrigatório.')
        return
      }

      // Validação do email
      if (!email.trim()) {
        toast.error('O campo de email é obrigatório.')
        return
      }

      // Validação da senha
      if (!senhaTemMinimo) {
        toast.error('A palavra-passe deve ter pelo menos 6 caracteres.')
        return
      }

      // Validação de correspondência das senhas
      if (!senhasConferem) {
        toast.error('As palavras-passe não coincidem.')
        return
      }

      setCarregando(true)

      try {
        const resposta = await fetch('/api/auth/registrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeCompleto: nomeCompleto.trim(),
            email: email.trim(),
            senha,
          }),
        })

        const dados = await resposta.json()

        if (!resposta.ok) {
          toast.error(dados.erro || 'Erro ao criar conta. Tenta novamente.')
          return
        }

        // O registo já autentica o utilizador (sessão guardada em cookies
        // pelo Supabase Auth), exceto se a confirmação de email estiver ativa.
        if (dados.precisaConfirmacao) {
          toast.success(
            dados.mensagem ||
              'Conta criada! Verifica o teu email para confirmar a conta.'
          )
        } else if (dados.utilizador) {
          const utilizador: UtilizadorAtual = {
            id: dados.utilizador.id,
            email: dados.utilizador.email,
            nomeCompleto: dados.utilizador.nomeCompleto,
            isAdmin: dados.utilizador.isAdmin,
          }
          definirUtilizador(utilizador)
          toast.success('Conta criada com sucesso! Bem-vindo(a) à AngolaReads!')
        }

        navegarPara('inicio')
      } catch {
        toast.error('Erro de ligação. Verifica a tua conexão e tenta novamente.')
      } finally {
        setCarregando(false)
      }
    },
    [nomeCompleto, email, senha, senhaConfirmacao, senhaTemMinimo, senhasConferem, definirUtilizador, navegarPara]
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
              Criar conta
            </CardTitle>
            <CardDescription className="text-gray-500">
              Junta-te à maior livraria digital angolana
            </CardDescription>
          </CardHeader>

          <form onSubmit={lidarSubmissao}>
            <CardContent className="flex flex-col gap-4">
              {/* Campo de nome completo */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="nome-registo" className="text-sm font-medium text-gray-700">
                  Nome Completo
                </Label>
                <Input
                  id="nome-registo"
                  type="text"
                  placeholder="O teu nome completo"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  disabled={carregando}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400"
                  autoComplete="name"
                  required
                />
              </div>

              {/* Campo de email */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="email-registo" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email-registo"
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
                <Label htmlFor="senha-registo" className="text-sm font-medium text-gray-700">
                  Palavra-passe
                </Label>
                <Input
                  id="senha-registo"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={carregando}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400"
                  autoComplete="new-password"
                  required
                />
                {/* Indicador de validação: mínimo 6 caracteres */}
                {senha.length > 0 && (
                  <p
                    className={`flex items-center gap-1.5 text-xs ${senhaTemMinimo ? 'text-emerald-600' : 'text-amber-500'}`}
                  >
                    {senhaTemMinimo ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              {/* Campo de confirmação de senha */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="senha-confirmacao-registo"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirmar Palavra-passe
                </Label>
                <Input
                  id="senha-confirmacao-registo"
                  type="password"
                  placeholder="Repete a tua palavra-passe"
                  value={senhaConfirmacao}
                  onChange={(e) => setSenhaConfirmacao(e.target.value)}
                  disabled={carregando}
                  className="border-emerald-200 bg-white focus-visible:ring-emerald-400"
                  autoComplete="new-password"
                  required
                />
                {/* Indicador de validação: senhas coincidem */}
                {senhaConfirmacao.length > 0 && (
                  <p
                    className={`flex items-center gap-1.5 text-xs ${senhasConferem ? 'text-emerald-600' : 'text-amber-500'}`}
                  >
                    {senhasConferem ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    As palavras-passe coincidem
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Botão de registo */}
              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400"
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A criar conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              {/* Link para login */}
              <p className="text-center text-sm text-gray-500">
                Já tens conta?{' '}
                <button
                  type="button"
                  onClick={() => navegarPara('login')}
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline focus:outline-none"
                >
                  Entra
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </motion.section>
  )
}
