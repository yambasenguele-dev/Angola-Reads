'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
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
import { criarClienteSupabase } from '@/lib/supabase/cliente'

// Variantes de animação do formulário
const variantesFormulario = {
  oculto: { opacity: 0, y: 20 },
  visivel: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

export default function RecuperarSenha() {
  const navegarPara = usarNavegacao((s) => s.navegarPara)
  const voltar = usarNavegacao((s) => s.voltar)

  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Submeter formulário de recuperação de senha
  const lidarSubmissao = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!email.trim()) {
        toast.error('O campo de email é obrigatório.')
        return
      }

      setCarregando(true)

      try {
        const supabase = criarClienteSupabase()
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/`,
        })

        // Por segurança, o Supabase não revela se o email existe ou não —
        // mostramos sempre a mesma mensagem genérica.
        toast.success(
          'Se o email existir, receberás instruções para redefinir a tua palavra-passe.'
        )
      } catch {
        toast.error('Ocorreu um erro. Tenta novamente mais tarde.')
      } finally {
        setCarregando(false)
      }
    },
    [email]
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
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50"
              whileHover={{ scale: 1.05 }}
            >
              <Mail className="h-7 w-7 text-amber-500" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Recuperar palavra-passe
            </CardTitle>
            <CardDescription className="text-gray-500">
              Introduz o teu email e enviar-te-emos um link para redefinires a
              tua palavra-passe.
            </CardDescription>
          </CardHeader>

          <form onSubmit={lidarSubmissao}>
            <CardContent className="flex flex-col gap-4">
              {/* Campo de email */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="email-recuperar"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email-recuperar"
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
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={carregando}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400"
              >
                {carregando ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A enviar...
                  </>
                ) : (
                  'Enviar Link de Recuperação'
                )}
              </Button>

              {/* Link para voltar ao login */}
              <p className="text-center text-sm text-gray-500">
                Lembrei-me da minha palavra-passe.{' '}
                <button
                  type="button"
                  onClick={() => navegarPara('login')}
                  className="font-semibold text-emerald-600 transition-colors hover:text-emerald-700 hover:underline focus:outline-none"
                >
                  Entrar
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </motion.section>
  )
}
